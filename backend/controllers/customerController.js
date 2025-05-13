import Customer from '../models/Customer.js';
import Segment from '../models/Segment.js';
import Order from '../models/Order.js';

// @desc    Get all customers with pagination and filtering
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.segment) {
      filter.segments = req.query.segment;
    }

    // Sorting
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;  // Default sort by creation date, newest first
    }

    // Execute query
    const customers = await Customer.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('segments', 'name');

    // Get total count for pagination
    const totalCount = await Customer.countDocuments(filter);
    
    res.json({
      customers,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('segments', 'name');
    
    if (customer) {
      // Get customer orders
      const orders = await Order.find({ customer: customer._id }).sort({ order_date: -1 }).limit(5);
      
      res.json({
        customer,
        orders
      });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      status,
      address,
      tags,
      segments: segmentIds
    } = req.body;

    // Check if customer email already exists
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }

    // Create new customer
    const customer = await Customer.create({
      name,
      email,
      phone,
      status: status || 'new',
      address,
      tags,
      segments: segmentIds || [],
      createdAt: new Date()
    });

    // If segments were specified, update each segment to include this customer
    if (segmentIds && segmentIds.length > 0) {
      await Segment.updateMany(
        { _id: { $in: segmentIds } },
        { $inc: { audienceSize: 1 } }
      );
    }

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Extract data from request body
    const {
      name,
      email,
      phone,
      status,
      address,
      tags,
      segments: newSegmentIds
    } = req.body;

    // Update customer fields
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (status) customer.status = status;
    if (address) customer.address = address;
    if (tags) customer.tags = tags;

    // Handle segment changes if provided
    if (newSegmentIds) {
      // Get current segment IDs as strings for comparison
      const currentSegmentIds = customer.segments.map(id => id.toString());
      
      // Find segments to add and remove
      const segmentsToAdd = newSegmentIds.filter(id => !currentSegmentIds.includes(id));
      const segmentsToRemove = currentSegmentIds.filter(id => !newSegmentIds.includes(id));
      
      // Update segment counts accordingly
      if (segmentsToAdd.length > 0) {
        await Segment.updateMany(
          { _id: { $in: segmentsToAdd } },
          { $inc: { audienceSize: 1 } }
        );
      }
      
      if (segmentsToRemove.length > 0) {
        await Segment.updateMany(
          { _id: { $in: segmentsToRemove } },
          { $inc: { audienceSize: -1 } }
        );
      }
      
      // Update customer segments
      customer.segments = newSegmentIds;
    }

    // Save the updated customer
    const updatedCustomer = await customer.save();
    
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Decrease audience size for all segments this customer belongs to
    if (customer.segments.length > 0) {
      await Segment.updateMany(
        { _id: { $in: customer.segments } },
        { $inc: { audienceSize: -1 } }
      );
    }

    // Remove the customer
    await customer.remove();
    
    res.json({ message: 'Customer removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
export const getCustomerStats = async (req, res) => {
  try {
    // Get total customers count
    const totalCustomers = await Customer.countDocuments();
    
    // Get customers by status
    const customersByStatus = await Customer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get new customers added in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get average spend per customer
    const averageSpend = await Customer.aggregate([
      {
        $group: {
          _id: null,
          avgSpend: { $avg: '$totalSpend' }
        }
      }
    ]);
    
    res.json({
      totalCustomers,
      customersByStatus,
      newCustomers,
      averageSpend: averageSpend.length > 0 ? averageSpend[0].avgSpend : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};