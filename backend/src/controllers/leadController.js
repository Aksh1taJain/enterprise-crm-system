import Lead from '../models/Lead.js';

// @desc    Get all leads with filtering & search
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req, res) => {
  try {
    const filter = {};

    // Enforce ownership: Sales Representative only gets their assigned leads
    if (req.user.role === 'Sales Representative') {
      filter.assignedTo = req.user._id;
    } else if (req.query.assignedTo) {
      // Admins can filter by assigned representative
      filter.assignedTo = req.query.assignedTo;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Source filter
    if (req.query.source) {
      filter.source = req.query.source;
    }

    // Search filter (matches name, email, or company)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
      ];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Private
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Authorization check
    if (
      req.user.role === 'Sales Representative' &&
      (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied: Lead is not assigned to you' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a lead
// @route   POST /api/leads
// @access  Private
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, assignedTo } = req.body;

    if (!name || !email || !phone || !company || !source) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Determine assignee based on role
    let leadAssignee = null;
    if (req.user.role === 'Sales Representative') {
      leadAssignee = req.user._id;
    } else {
      leadAssignee = assignedTo || null;
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source,
      status: status || 'New',
      assignedTo: leadAssignee,
    });

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email');
    res.status(201).json(populatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Authorization check
    if (
      req.user.role === 'Sales Representative' &&
      (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied: Lead is not assigned to you' });
    }

    // Update fields
    lead.name = req.body.name || lead.name;
    lead.email = req.body.email || lead.email;
    lead.phone = req.body.phone || lead.phone;
    lead.company = req.body.company || lead.company;
    lead.source = req.body.source || lead.source;
    lead.status = req.body.status || lead.status;

    // Only Admin can assign/reassign leads
    if (req.user.role === 'Admin') {
      lead.assignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : lead.assignedTo;
    }

    const updatedLead = await lead.save();
    const populatedLead = await Lead.findById(updatedLead._id).populate('assignedTo', 'name email');

    res.json(populatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Authorization check
    if (
      req.user.role === 'Sales Representative' &&
      (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied: Lead is not assigned to you' });
    }

    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
