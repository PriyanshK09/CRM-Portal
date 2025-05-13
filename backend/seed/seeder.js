import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import models
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Segment from '../models/Segment.js';
import Campaign from '../models/Campaign.js';
import Order from '../models/Order.js';

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

// Sample Data
const users = [
  {
    name: 'Admin User',
    email: 'admin@xeno.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'user'
  }
];

const segments = [
  {
    name: 'High Value Customers',
    description: 'Customers who have spent more than $1000',
    rules: [
      { field: 'totalSpend', operator: 'greaterThan', value: 1000 }
    ],
    audienceSize: 0,
    isActive: true
  },
  {
    name: 'New Customers',
    description: 'Customers who joined in the last 30 days',
    rules: [
      { field: 'createdAt', operator: 'greaterThan', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    ],
    audienceSize: 0,
    isActive: true
  },
  {
    name: 'Inactive Customers',
    description: 'Customers who have not made a purchase in the last 90 days',
    rules: [
      { field: 'lastVisitDate', operator: 'lessThan', value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    ],
    audienceSize: 0,
    isActive: true
  }
];

const customers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    totalSpend: 1500,
    visitCount: 12,
    lastVisitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'active',
    tags: ['loyal', 'high-value'],
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-5678',
    totalSpend: 750,
    visitCount: 8,
    lastVisitDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    status: 'active',
    tags: ['regular'],
    address: {
      street: '456 Elm St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60007',
      country: 'USA'
    }
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '555-9012',
    totalSpend: 250,
    visitCount: 3,
    lastVisitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'new',
    tags: ['new-signup'],
    address: {
      street: '789 Oak St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    }
  },
  {
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '555-3456',
    totalSpend: 1200,
    visitCount: 10,
    lastVisitDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
    status: 'inactive',
    tags: ['high-value', 'inactive'],
    address: {
      street: '321 Pine St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    }
  },
  {
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '555-7890',
    totalSpend: 50,
    visitCount: 1,
    lastVisitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'new',
    tags: ['new-signup'],
    address: {
      street: '654 Cedar St',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    }
  }
];

// Import all data
const importData = async () => {
  try {
    // Clear all existing data
    await User.deleteMany();
    await Customer.deleteMany();
    await Segment.deleteMany();
    await Campaign.deleteMany();
    await Order.deleteMany();

    console.log('Data cleared...');

    // Create users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    console.log('Users created...');

    // Create segments
    const createdSegments = await Segment.insertMany(
      segments.map(segment => ({
        ...segment,
        created_by: adminUser
      }))
    );
    console.log('Segments created...');

    // Create customers
    const createdCustomers = await Customer.create(customers);
    console.log('Customers created...');

    // Assign customers to segments based on rules
    // High Value Segment
    const highValueSegment = createdSegments[0];
    const highValueCustomers = createdCustomers.filter(c => c.totalSpend > 1000);
    
    await Customer.updateMany(
      { _id: { $in: highValueCustomers.map(c => c._id) } },
      { $push: { segments: highValueSegment._id } }
    );
    
    await Segment.findByIdAndUpdate(
      highValueSegment._id,
      { audienceSize: highValueCustomers.length }
    );

    // New Customers Segment
    const newCustomersSegment = createdSegments[1];
    const newCustomers = createdCustomers.filter(c => c.status === 'new');
    
    await Customer.updateMany(
      { _id: { $in: newCustomers.map(c => c._id) } },
      { $push: { segments: newCustomersSegment._id } }
    );
    
    await Segment.findByIdAndUpdate(
      newCustomersSegment._id,
      { audienceSize: newCustomers.length }
    );

    // Inactive Customers Segment
    const inactiveSegment = createdSegments[2];
    const inactiveCustomers = createdCustomers.filter(c => 
      c.lastVisitDate < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );
    
    await Customer.updateMany(
      { _id: { $in: inactiveCustomers.map(c => c._id) } },
      { $push: { segments: inactiveSegment._id } }
    );
    
    await Segment.findByIdAndUpdate(
      inactiveSegment._id,
      { audienceSize: inactiveCustomers.length }
    );

    console.log('Segments updated with customers...');

    // Create campaigns
    const campaigns = [
      {
        name: 'Summer Sale Campaign',
        description: 'Special discounts for all customers during summer',
        type: 'promotional',
        segment: highValueSegment._id,
        segmentName: highValueSegment.name,
        template: 'discount',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: 5000,
        goal: 'Increase sales by 20% among high value customers',
        audienceSize: highValueCustomers.length,
        audience: highValueCustomers.length,
        sent: 20,
        opened: 15,
        clicked: 10,
        status: 'Active',
        created_by: adminUser
      },
      {
        name: 'Welcome New Users',
        description: 'Onboarding campaign for new customers',
        type: 'email',
        segment: newCustomersSegment._id,
        segmentName: newCustomersSegment.name,
        template: 'newsletter',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        budget: 2000,
        goal: 'Improve activation rate for new users',
        audienceSize: newCustomers.length,
        audience: newCustomers.length,
        sent: 30,
        opened: 25,
        clicked: 15,
        status: 'Active',
        created_by: adminUser
      },
      {
        name: 'Win-back Inactive Users',
        description: 'Re-engagement campaign for inactive customers',
        type: 'win-back',
        segment: inactiveSegment._id,
        segmentName: inactiveSegment.name,
        template: 'discount',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        budget: 3000,
        goal: 'Recover 15% of inactive customers',
        audienceSize: inactiveCustomers.length,
        audience: inactiveCustomers.length,
        sent: 100,
        opened: 40,
        clicked: 10,
        status: 'Active',
        created_by: adminUser
      }
    ];

    await Campaign.insertMany(campaigns);
    console.log('Campaigns created...');

    // Create orders
    const orders = [
      {
        id: 'ORD-1001',
        customer_id: createdCustomers[0]._id.toString(),
        customer: createdCustomers[0]._id,
        order_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        total_amount: 750,
        status: 'completed',
        items: [
          { product_id: 'PROD-001', name: 'Premium Plan', quantity: 1, price: 750 }
        ],
        payment_method: 'credit_card',
        shipping_address: createdCustomers[0].address,
        billing_address: createdCustomers[0].address
      },
      {
        id: 'ORD-1002',
        customer_id: createdCustomers[0]._id.toString(),
        customer: createdCustomers[0]._id,
        order_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        total_amount: 750,
        status: 'completed',
        items: [
          { product_id: 'PROD-001', name: 'Premium Plan', quantity: 1, price: 750 }
        ],
        payment_method: 'credit_card',
        shipping_address: createdCustomers[0].address,
        billing_address: createdCustomers[0].address
      },
      {
        id: 'ORD-1003',
        customer_id: createdCustomers[1]._id.toString(),
        customer: createdCustomers[1]._id,
        order_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        total_amount: 750,
        status: 'completed',
        items: [
          { product_id: 'PROD-001', name: 'Premium Plan', quantity: 1, price: 750 }
        ],
        payment_method: 'paypal',
        shipping_address: createdCustomers[1].address,
        billing_address: createdCustomers[1].address
      },
      {
        id: 'ORD-1004',
        customer_id: createdCustomers[2]._id.toString(),
        customer: createdCustomers[2]._id,
        order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        total_amount: 250,
        status: 'processing',
        items: [
          { product_id: 'PROD-002', name: 'Basic Plan', quantity: 1, price: 250 }
        ],
        payment_method: 'credit_card',
        shipping_address: createdCustomers[2].address,
        billing_address: createdCustomers[2].address
      },
      {
        id: 'ORD-1005',
        customer_id: createdCustomers[3]._id.toString(),
        customer: createdCustomers[3]._id,
        order_date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        total_amount: 1200,
        status: 'completed',
        items: [
          { product_id: 'PROD-003', name: 'Enterprise Plan', quantity: 1, price: 1200 }
        ],
        payment_method: 'bank_transfer',
        shipping_address: createdCustomers[3].address,
        billing_address: createdCustomers[3].address
      },
      {
        id: 'ORD-1006',
        customer_id: createdCustomers[4]._id.toString(),
        customer: createdCustomers[4]._id,
        order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        total_amount: 50,
        status: 'pending',
        items: [
          { product_id: 'PROD-004', name: 'Starter Plan', quantity: 1, price: 50 }
        ],
        payment_method: 'credit_card',
        shipping_address: createdCustomers[4].address,
        billing_address: createdCustomers[4].address
      }
    ];

    await Order.insertMany(orders);
    console.log('Orders created...');

    console.log('Data successfully imported!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

// Delete all data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Customer.deleteMany();
    await Segment.deleteMany();
    await Campaign.deleteMany();
    await Order.deleteMany();

    console.log('Data successfully destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

// Determine which action to execute based on command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}