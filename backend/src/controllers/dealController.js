import Deal from '../models/Deal.js';
import Lead from '../models/Lead.js';
import Customer from '../models/Customer.js';

// Helper: check if sales rep owns the lead for the deal
const verifyLeadOwnership = async (leadId, userId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) return false;
  return lead.assignedTo && lead.assignedTo.toString() === userId.toString();
};

// @desc    Get all deals
// @route   GET /api/deals
// @access  Private
export const getDeals = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'Sales Representative') {
      // Find all leads assigned to this representative
      const myLeads = await Lead.find({ assignedTo: req.user._id }).select('_id');
      const leadIds = myLeads.map((lead) => lead._id);
      filter.lead = { $in: leadIds };
    }

    const deals = await Deal.find(filter)
      .populate({
        path: 'lead',
        populate: { path: 'assignedTo', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get deal by ID
// @route   GET /api/deals/:id
// @access  Private
export const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id).populate({
      path: 'lead',
      populate: { path: 'assignedTo', select: 'name email' },
    });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Authorization check
    if (req.user.role === 'Sales Representative') {
      if (
        !deal.lead ||
        !deal.lead.assignedTo ||
        deal.lead.assignedTo._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: 'Access denied: Deal is not associated with your leads' });
      }
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a deal
// @route   POST /api/deals
// @access  Private
export const createDeal = async (req, res) => {
  try {
    const { lead, value, stage, expectedCloseDate } = req.body;

    if (!lead || !value || !expectedCloseDate) {
      return res.status(400).json({ message: 'Please provide lead, value and expected close date' });
    }

    // Verify lead exists and is accessible
    const leadRecord = await Lead.findById(lead);
    if (!leadRecord) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role === 'Sales Representative') {
      const isOwner = await verifyLeadOwnership(lead, req.user._id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied: Lead is not assigned to you' });
      }
    }

    const deal = await Deal.create({
      lead,
      value,
      stage: stage || 'Qualified',
      expectedCloseDate,
    });

    // If initial stage is Won, trigger lead conversion
    if (stage === 'Won') {
      leadRecord.status = 'Won';
      await leadRecord.save();

      // Check if Customer already exists
      const customerExists = await Customer.findOne({ email: leadRecord.email });
      if (!customerExists) {
        await Customer.create({
          company: leadRecord.company,
          contactName: leadRecord.name,
          email: leadRecord.email,
          phone: leadRecord.phone,
          lead: leadRecord._id,
          assignedTo: leadRecord.assignedTo,
        });
      }
    }

    const populatedDeal = await Deal.findById(deal._id).populate({
      path: 'lead',
      populate: { path: 'assignedTo', select: 'name email' },
    });

    res.status(201).json(populatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a deal
// @route   PUT /api/deals/:id
// @access  Private
export const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Authorization check
    if (req.user.role === 'Sales Representative') {
      const isOwner = await verifyLeadOwnership(deal.lead, req.user._id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied: Lead associated with deal is not assigned to you' });
      }
    }

    // Update details
    deal.value = req.body.value !== undefined ? req.body.value : deal.value;
    deal.stage = req.body.stage || deal.stage;
    deal.expectedCloseDate = req.body.expectedCloseDate || deal.expectedCloseDate;

    const updatedDeal = await deal.save();

    // If deal stage updated to Won, convert lead status to Won and create Customer record
    if (req.body.stage === 'Won') {
      const leadRecord = await Lead.findById(deal.lead);
      if (leadRecord) {
        leadRecord.status = 'Won';
        await leadRecord.save();

        // Check if customer already exists
        const customerExists = await Customer.findOne({ email: leadRecord.email });
        if (!customerExists) {
          await Customer.create({
            company: leadRecord.company,
            contactName: leadRecord.name,
            email: leadRecord.email,
            phone: leadRecord.phone,
            lead: leadRecord._id,
            assignedTo: leadRecord.assignedTo,
          });
        }
      }
    } else if (req.body.stage === 'Lost') {
      const leadRecord = await Lead.findById(deal.lead);
      if (leadRecord) {
        leadRecord.status = 'Lost';
        await leadRecord.save();
      }
    }

    const populatedDeal = await Deal.findById(updatedDeal._id).populate({
      path: 'lead',
      populate: { path: 'assignedTo', select: 'name email' },
    });

    res.json(populatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Private
export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Authorization check
    if (req.user.role === 'Sales Representative') {
      const isOwner = await verifyLeadOwnership(deal.lead, req.user._id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied: Lead associated with deal is not assigned to you' });
      }
    }

    await Deal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
