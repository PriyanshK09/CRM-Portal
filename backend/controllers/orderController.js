import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

// @desc    Get all orders with pagination and filtering
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
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
    
    if (req.query.customer) {
      filter.customer = req.query.customer;
    }
    
    if (req.query.search) {
      filter.id = { $regex: req.query.search, $options: 'i' };
    }
    
    // Date range filters
    if (req.query.startDate) {
      filter.order_date = { $gte: new Date(req.query.startDate) };
    }
    
    if (req.query.endDate) {
      if (filter.order_date) {
        filter.order_date.$lte = new Date(req.query.endDate);
      } else {
        filter.order_date = { $lte: new Date(req.query.endDate) };
      }
    }

    // Execute query
    const orders = await Order.find(filter)
      .sort({ order_date: -1 })
      .limit(limit)
      .skip(skip)
      .populate('customer', 'name email');

    // Get total count for pagination
    const totalCount = await Order.countDocuments(filter);
    
    res.json({
      orders,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone');
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      id,
      customer_id,
      items,
      total_amount,
      status,
      payment_method,
      shipping_address,
      billing_address,
      notes,
      campaign_source
    } = req.body;

    // Check if order ID already exists
    if (id) {
      const orderExists = await Order.findOne({ id });
      if (orderExists) {
        return res.status(400).json({ message: 'Order with this ID already exists' });
      }
    }

    // Check if customer exists
    let customer = null;
    if (customer_id) {
      customer = await Customer.findById(customer_id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }

    // Generate unique order ID if not provided
    const orderId = id || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create new order
    const order = await Order.create({
      id: orderId,
      customer_id: customer_id || 'GUEST',
      customer: customer ? customer._id : null,
      order_date: new Date(),
      total_amount,
      status: status || 'pending',
      items: items || [],
      payment_method,
      shipping_address,
      billing_address,
      notes,
      campaign_source
    });

    // Update customer's total spend and last visit date
    if (customer) {
      customer.totalSpend = (customer.totalSpend || 0) + total_amount;
      customer.lastVisitDate = new Date();
      customer.visitCount = (customer.visitCount || 0) + 1;
      await customer.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const {
      status,
      items,
      total_amount,
      payment_method,
      shipping_address,
      billing_address,
      notes
    } = req.body;

    // Update order fields
    if (status) order.status = status;
    if (payment_method) order.payment_method = payment_method;
    if (shipping_address) order.shipping_address = shipping_address;
    if (billing_address) order.billing_address = billing_address;
    if (notes !== undefined) order.notes = notes;

    // Update items and total if both are provided
    if (items && total_amount) {
      // If total amount changes, update customer's spend as well
      if (order.customer && order.total_amount !== total_amount) {
        const customer = await Customer.findById(order.customer);
        if (customer) {
          customer.totalSpend = (customer.totalSpend || 0) - order.total_amount + total_amount;
          await customer.save();
        }
      }
      
      order.items = items;
      order.total_amount = total_amount;
    }

    // Save the updated order
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If connected to a customer, update their total spend
    if (order.customer) {
      const customer = await Customer.findById(order.customer);
      if (customer) {
        customer.totalSpend = Math.max(0, (customer.totalSpend || 0) - order.total_amount);
        await customer.save();
      }
    }

    // Remove the order
    await order.remove();
    
    res.json({ message: 'Order removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
export const getOrderStats = async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total_amount' }
        }
      }
    ]);
    
    // Get total revenue
    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          avgOrderValue: { $avg: '$total_amount' }
        }
      }
    ]);
    
    // Get recent revenue trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueTrends = await Order.aggregate([
      {
        $match: {
          order_date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$order_date' },
            year: { $year: '$order_date' }
          },
          revenue: { $sum: '$total_amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);
    
    res.json({
      totalOrders,
      ordersByStatus,
      totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
      avgOrderValue: revenueStats.length > 0 ? revenueStats[0].avgOrderValue : 0,
      revenueTrends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};