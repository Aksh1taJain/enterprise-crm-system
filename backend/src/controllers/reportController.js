import Lead from '../models/Lead.js';
import Deal from '../models/Deal.js';
import Customer from '../models/Customer.js';

// Helper: Convert array of objects to CSV string
const convertToCSV = (data, fields, headers) => {
  const headerRow = headers.join(',');
  const rows = data.map((row) =>
    fields
      .map((fieldName) => {
        // Handle nested fields or path resolving (e.g. 'assignedTo.name')
        const parts = fieldName.split('.');
        let val = row;
        for (const part of parts) {
          if (val === null || val === undefined) {
            val = '';
            break;
          }
          val = val[part];
        }

        if (val === undefined || val === null) {
          val = '';
        } else if (val instanceof Date) {
          val = val.toISOString().split('T')[0];
        }

        // Clean value and escape double quotes
        val = val.toString().replace(/"/g, '""');
        
        // Wrap in quotes if it contains separator, quotes, or newlines
        if (/[",\n\r]/.test(val)) {
          val = `"${val}"`;
        }
        return val;
      })
      .join(',')
  );
  return [headerRow, ...rows].join('\r\n');
};

// Helper: Build query filter based on request and user role
const buildBaseFilter = async (req, isSalesRep) => {
  const filter = {};

  // Date Range filter
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      // Set to end of day
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Assigned Representative filtering
  if (isSalesRep) {
    filter.assignedTo = req.user._id;
  } else if (req.query.assignedTo) {
    filter.assignedTo = req.query.assignedTo;
  }

  return filter;
};

// @desc    Export Leads to CSV
// @route   GET /api/reports/export-leads
// @access  Private
export const exportLeads = async (req, res) => {
  try {
    const isSalesRep = req.user.role === 'Sales Representative';
    const filter = await buildBaseFilter(req, isSalesRep);

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Source filter
    if (req.query.source) {
      filter.source = req.query.source;
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const fields = ['name', 'email', 'phone', 'company', 'source', 'status', 'assignedTo.name', 'createdAt'];
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Assigned To', 'Created Date'];

    const csvData = convertToCSV(leads, fields, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_report.csv');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export Deals to CSV
// @route   GET /api/reports/export-deals
// @access  Private
export const exportDeals = async (req, res) => {
  try {
    const isSalesRep = req.user.role === 'Sales Representative';
    const baseFilter = await buildBaseFilter(req, isSalesRep);
    
    // We construct query filters for Deals
    const dealFilter = {};
    if (baseFilter.createdAt) {
      dealFilter.createdAt = baseFilter.createdAt;
    }

    if (req.query.stage) {
      dealFilter.stage = req.query.stage;
    }

    // Resolve leads for filtering if Sales Rep or filtering by representative
    if (isSalesRep || req.query.assignedTo) {
      const leadQuery = {};
      if (isSalesRep) {
        leadQuery.assignedTo = req.user._id;
      } else {
        leadQuery.assignedTo = req.query.assignedTo;
      }
      const leads = await Lead.find(leadQuery).select('_id');
      const leadIds = leads.map(l => l._id);
      dealFilter.lead = { $in: leadIds };
    }

    const deals = await Deal.find(dealFilter)
      .populate({
        path: 'lead',
        populate: { path: 'assignedTo', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    // Format deals structure for exporter
    const formattedDeals = deals.map(deal => ({
      leadName: deal.lead ? deal.lead.name : 'N/A',
      company: deal.lead ? deal.lead.company : 'N/A',
      value: deal.value,
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate,
      assignedRep: deal.lead && deal.lead.assignedTo ? deal.lead.assignedTo.name : 'Unassigned',
      createdAt: deal.createdAt,
    }));

    const fields = ['leadName', 'company', 'value', 'stage', 'expectedCloseDate', 'assignedRep', 'createdAt'];
    const headers = ['Lead Name', 'Company', 'Deal Value ($)', 'Stage', 'Expected Close Date', 'Assigned Rep', 'Created Date'];

    const csvData = convertToCSV(formattedDeals, fields, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=deals_report.csv');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export Customers to CSV
// @route   GET /api/reports/export-customers
// @access  Private
export const exportCustomers = async (req, res) => {
  try {
    const isSalesRep = req.user.role === 'Sales Representative';
    const filter = await buildBaseFilter(req, isSalesRep);

    const customers = await Customer.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const fields = ['company', 'contactName', 'email', 'phone', 'assignedTo.name', 'createdAt'];
    const headers = ['Company', 'Contact Name', 'Email', 'Phone', 'Assigned Rep', 'Converted Date'];

    const csvData = convertToCSV(customers, fields, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers_report.csv');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
