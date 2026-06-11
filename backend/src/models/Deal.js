import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Deal must be linked to a lead'],
    },
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
    },
    stage: {
      type: String,
      enum: ['Qualified', 'Negotiation', 'Proposal', 'Won', 'Lost'],
      default: 'Qualified',
    },
    expectedCloseDate: {
      type: Date,
      required: [true, 'Expected close date is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
