import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'Sales Representative') {
      filter.assignedTo = req.user._id;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { company: searchRegex },
        { contactName: searchRegex },
        { email: searchRegex },
      ];
    }

    const customers = await Customer.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('assignedTo', 'name email');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Authorization check
    if (
      req.user.role === 'Sales Representative' &&
      (!customer.assignedTo || customer.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied: Customer is not assigned to you' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Convert lead to customer explicitly
// @route   POST /api/customers/convert
// @access  Private
export const convertLeadToCustomer = async (req, res) => {
  try {
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ message: 'Please provide leadId' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check ownership if Sales Rep
    if (
      req.user.role === 'Sales Representative' &&
      (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied: Lead is not assigned to you' });
    }

    // Check if customer already exists
    let customer = await Customer.findOne({ email: lead.email });
    if (customer) {
      return res.status(400).json({ message: 'Customer already exists for this lead email' });
    }

    // Create Customer
    customer = await Customer.create({
      company: lead.company,
      contactName: lead.name,
      email: lead.email,
      phone: lead.phone,
      lead: lead._id,
      assignedTo: lead.assignedTo,
    });

    // Update Lead status to Won
    lead.status = 'Won';
    await lead.save();

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
