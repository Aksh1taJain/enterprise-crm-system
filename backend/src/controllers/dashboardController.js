import Lead from '../models/Lead.js';
import Deal from '../models/Deal.js';
import Customer from '../models/Customer.js';

// @desc    Get dashboard KPIs
// @route   GET /api/dashboard/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const isSalesRep = req.user.role === 'Sales Representative';
    const userId = req.user._id;

    // Filters based on role
    const leadFilter = isSalesRep ? { assignedTo: userId } : {};
    const customerFilter = isSalesRep ? { assignedTo: userId } : {};

    // Get lead IDs for Sales Rep to filter deals
    let dealFilter = {};
    if (isSalesRep) {
      const myLeads = await Lead.find({ assignedTo: userId }).select('_id');
      const leadIds = myLeads.map((l) => l._id);
      dealFilter = { lead: { $in: leadIds } };
    }

    // 1. Total Leads
    const totalLeads = await Lead.countDocuments(leadFilter);

    // 2. Total Customers
    const totalCustomers = await Customer.countDocuments(customerFilter);

    // 3. Active Deals (stage not in Won or Lost)
    const activeDeals = await Deal.countDocuments({
      ...dealFilter,
      stage: { $nin: ['Won', 'Lost'] },
    });

    // 4. Revenue Generated (Sum of won deal values)
    const revenueResult = await Deal.aggregate([
      {
        $match: {
          ...dealFilter,
          stage: 'Won',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' },
        },
      },
    ]);
    const revenueGenerated = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalLeads,
      totalCustomers,
      activeDeals,
      revenueGenerated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Private
export const getCharts = async (req, res) => {
  try {
    const isSalesRep = req.user.role === 'Sales Representative';
    const userId = req.user._id;

    // Fetch User's lead IDs if they are a sales rep (for deal matching)
    let leadFilter = {};
    let dealFilter = {};
    if (isSalesRep) {
      leadFilter = { assignedTo: userId };
      const myLeads = await Lead.find({ assignedTo: userId }).select('_id');
      const leadIds = myLeads.map((l) => l._id);
      dealFilter = { lead: { $in: leadIds } };
    }

    // 1. Leads by Month (Last 6 Months)
    const leadsByMonth = await Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    // 2. Deal Status Distribution (Stages breakdown)
    const dealStatus = await Deal.aggregate([
      { $match: dealFilter },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Revenue Trend (Won deals revenue grouped by month)
    const revenueTrend = await Deal.aggregate([
      {
        $match: {
          ...dealFilter,
          stage: 'Won',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$value' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    res.json({
      leadsByMonth,
      dealStatus,
      revenueTrend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
