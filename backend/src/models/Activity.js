import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Activity must be linked to a lead'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must be associated with a user'],
    },
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'Follow-up', 'Demo'],
      required: [true, 'Activity type is required'],
    },
    notes: {
      type: String,
      required: [true, 'Activity notes are required'],
    },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
