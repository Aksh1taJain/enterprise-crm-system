import Activity from '../models/Activity.js';
import Lead from '../models/Lead.js';

// @desc    Get activities with filtering
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'Sales Representative') {
      // Find all leads assigned to this representative
      const myLeads = await Lead.find({ assignedTo: req.user._id }).select('_id');
      const leadIds = myLeads.map((lead) => lead._id);
      
      // Representatative can see activities they created, OR activities logged for their leads
      filter.$or = [
        { user: req.user._id },
        { lead: { $in: leadIds } },
      ];
    }

    // Lead filter
    if (req.query.lead) {
      // If a sales rep is filtering by lead, ensure they own that lead
      if (req.user.role === 'Sales Representative') {
        const leadRecord = await Lead.findById(req.query.lead);
        if (!leadRecord || !leadRecord.assignedTo || leadRecord.assignedTo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Access denied to activities for this lead' });
        }
      }
      filter.lead = req.query.lead;
    }

    // Type filter
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const activities = await Activity.find(filter)
      .populate('lead', 'name company email')
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
export const createActivity = async (req, res) => {
  try {
    const { lead, type, notes } = req.body;

    if (!lead || !type || !notes) {
      return res.status(400).json({ message: 'Please provide lead, type, and notes' });
    }

    // Verify lead exists and is accessible
    const leadRecord = await Lead.findById(lead);
    if (!leadRecord) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Sales Rep check
    if (
      req.user.role === 'Sales Representative' &&
      (!leadRecord.assignedTo || leadRecord.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied: Lead is not assigned to you' });
    }

    const activity = await Activity.create({
      lead,
      user: req.user._id,
      type,
      notes,
    });

    const populatedActivity = await Activity.findById(activity._id)
      .populate('lead', 'name company email')
      .populate('user', 'name role');

    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
