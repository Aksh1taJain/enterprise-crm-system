import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Deal from '../models/Deal.js';
import Customer from '../models/Customer.js';
import Activity from '../models/Activity.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leadsphere');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Deal.deleteMany({});
    await Customer.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);

    const admin = await User.create({
      name: 'Sarah Jenkins',
      email: 'admin@leadsphere.com',
      password: 'Password123', // Pre-save hook hashes it, but we can save it directly since pre-save handles it. Wait! User.js pre-save will run and hash it, so we pass it in plain text!
      role: 'Admin',
    });

    const salesRep = await User.create({
      name: 'Alex Rivera',
      email: 'rep@leadsphere.com',
      password: 'Password123',
      role: 'Sales Representative',
    });

    console.log('Created Users: Admin (admin@leadsphere.com) and Sales Rep (rep@leadsphere.com)');

    // 2. Create Leads
    // Helper to generate dates in the past few months
    const getPastDate = (monthsAgo, dayOffset = 0) => {
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      date.setDate(date.getDate() + dayOffset);
      return date;
    };

    const leadData = [
      {
        name: 'John Doe',
        email: 'john.doe@techcorp.com',
        phone: '123-456-7890',
        company: 'TechCorp Solutions',
        source: 'Website',
        status: 'Won',
        assignedTo: salesRep._id,
        createdAt: getPastDate(5, 5),
      },
      {
        name: 'Alice Smith',
        email: 'alice.smith@designco.com',
        phone: '234-567-8901',
        company: 'DesignCo Agency',
        source: 'Referral',
        status: 'Won',
        assignedTo: salesRep._id,
        createdAt: getPastDate(4, -10),
      },
      {
        name: 'Robert Johnson',
        email: 'robert@buildersinc.com',
        phone: '345-678-9012',
        company: 'Builders Inc',
        source: 'Cold Reach',
        status: 'Qualified',
        assignedTo: salesRep._id,
        createdAt: getPastDate(3, 2),
      },
      {
        name: 'Emily Davis',
        email: 'emily@retailgenius.com',
        phone: '456-789-0123',
        company: 'RetailGenius',
        source: 'Website',
        status: 'Proposal Sent',
        assignedTo: salesRep._id,
        createdAt: getPastDate(2, -15),
      },
      {
        name: 'Michael Brown',
        email: 'mbrown@financesecure.com',
        phone: '567-890-1234',
        company: 'FinanceSecure Ltd',
        source: 'Website',
        status: 'New',
        assignedTo: salesRep._id,
        createdAt: getPastDate(1, 10),
      },
      {
        name: 'Jessica Taylor',
        email: 'jessica@healthpulse.com',
        phone: '678-890-2345',
        company: 'HealthPulse Diagnostics',
        source: 'Cold Reach',
        status: 'Lost',
        assignedTo: salesRep._id,
        createdAt: getPastDate(2, 5),
      },
      // Admin leads (globally visible, assigned to Admin)
      {
        name: 'David Wilson',
        email: 'dwilson@globalventures.com',
        phone: '789-012-3456',
        company: 'Global Ventures LLC',
        source: 'Referral',
        status: 'Won',
        assignedTo: admin._id,
        createdAt: getPastDate(4, 15),
      },
      {
        name: 'Sophia Martinez',
        email: 'sophia@cloudnine.com',
        phone: '890-123-4567',
        company: 'CloudNine Technologies',
        source: 'Website',
        status: 'Proposal Sent',
        assignedTo: admin._id,
        createdAt: getPastDate(3, -5),
      },
      {
        name: 'James Anderson',
        email: 'james@heavymachinery.com',
        phone: '901-234-5678',
        company: 'Heavy Machinery Corp',
        source: 'Cold Reach',
        status: 'New',
        assignedTo: null, // Unassigned lead
        createdAt: getPastDate(1, -2),
      },
    ];

    const leads = [];
    for (const data of leadData) {
      const lead = new Lead(data);
      // We manually set createdAt to simulate monthly trends
      lead.createdAt = data.createdAt;
      await lead.save();
      leads.push(lead);
    }
    console.log(`Seeded ${leads.length} Leads.`);

    // 3. Create Deals
    const dealData = [
      {
        lead: leads[0]._id, // John Doe - Won
        value: 12000,
        stage: 'Won',
        expectedCloseDate: getPastDate(4, 15),
        createdAt: getPastDate(5, 5),
      },
      {
        lead: leads[1]._id, // Alice Smith - Won
        value: 8500,
        stage: 'Won',
        expectedCloseDate: getPastDate(3, 10),
        createdAt: getPastDate(4, -10),
      },
      {
        lead: leads[2]._id, // Robert Johnson - Qualified
        value: 15000,
        stage: 'Qualified',
        expectedCloseDate: getPastDate(-1, 20), // future close
        createdAt: getPastDate(3, 2),
      },
      {
        lead: leads[3]._id, // Emily Davis - Proposal Sent
        value: 6200,
        stage: 'Proposal',
        expectedCloseDate: getPastDate(0, 14), // next week close
        createdAt: getPastDate(2, -15),
      },
      {
        lead: leads[5]._id, // Jessica Taylor - Lost
        value: 9800,
        stage: 'Lost',
        expectedCloseDate: getPastDate(1, 15),
        createdAt: getPastDate(2, 5),
      },
      {
        lead: leads[6]._id, // David Wilson - Won (Admin lead)
        value: 25000,
        stage: 'Won',
        expectedCloseDate: getPastDate(3, 5),
        createdAt: getPastDate(4, 15),
      },
      {
        lead: leads[7]._id, // Sophia Martinez - Proposal (Admin lead)
        value: 18500,
        stage: 'Proposal',
        expectedCloseDate: getPastDate(-1, 5),
        createdAt: getPastDate(3, -5),
      },
    ];

    const deals = [];
    for (const data of dealData) {
      const deal = new Deal(data);
      deal.createdAt = data.createdAt;
      await deal.save();
      deals.push(deal);
    }
    console.log(`Seeded ${deals.length} Deals.`);

    // 4. Create Customers (corresponding to Won leads/deals)
    const customerData = [
      {
        company: 'TechCorp Solutions',
        contactName: 'John Doe',
        email: 'john.doe@techcorp.com',
        phone: '123-456-7890',
        lead: leads[0]._id,
        assignedTo: salesRep._id,
        createdAt: getPastDate(4, 15),
      },
      {
        company: 'DesignCo Agency',
        contactName: 'Alice Smith',
        email: 'alice.smith@designco.com',
        phone: '234-567-8901',
        lead: leads[1]._id,
        assignedTo: salesRep._id,
        createdAt: getPastDate(3, 10),
      },
      {
        company: 'Global Ventures LLC',
        contactName: 'David Wilson',
        email: 'dwilson@globalventures.com',
        phone: '789-012-3456',
        lead: leads[6]._id,
        assignedTo: admin._id,
        createdAt: getPastDate(3, 5),
      },
    ];

    for (const data of customerData) {
      const customer = new Customer(data);
      customer.createdAt = data.createdAt;
      await customer.save();
    }
    console.log('Seeded Converted Customers.');

    // 5. Create Activities
    const activityData = [
      {
        lead: leads[0]._id, // John Doe
        user: salesRep._id,
        type: 'Call',
        notes: 'Initial introduction call. Lead is very interested in enterprise options.',
        createdAt: getPastDate(5, 6),
      },
      {
        lead: leads[0]._id,
        user: salesRep._id,
        type: 'Demo',
        notes: 'Conducted product demo. Showed API keys and custom widgets.',
        createdAt: getPastDate(5, 12),
      },
      {
        lead: leads[0]._id,
        user: salesRep._id,
        type: 'Meeting',
        notes: 'Finalized commercial terms and closed deal!',
        createdAt: getPastDate(4, 15),
      },
      {
        lead: leads[1]._id, // Alice Smith
        user: salesRep._id,
        type: 'Email',
        notes: 'Sent pricing sheets and project examples as requested by design lead.',
        createdAt: getPastDate(4, -8),
      },
      {
        lead: leads[2]._id, // Robert Johnson
        user: salesRep._id,
        type: 'Call',
        notes: 'Follow-up call. Robert is reviewing technical compliance list next week.',
        createdAt: getPastDate(3, 10),
      },
      {
        lead: leads[3]._id, // Emily Davis
        user: salesRep._id,
        type: 'Follow-up',
        notes: 'Sent follow-up proposal email. Waiting on executive board feedback.',
        createdAt: getPastDate(2, -10),
      },
      {
        lead: leads[6]._id, // David Wilson
        user: admin._id,
        type: 'Meeting',
        notes: 'Kick-off contract signature meeting. Confirmed global project parameters.',
        createdAt: getPastDate(3, 5),
      },
    ];

    for (const data of activityData) {
      const activity = new Activity(data);
      activity.createdAt = data.createdAt;
      await activity.save();
    }
    console.log('Seeded Activities History.');

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
