import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Customer from '../models/Customer.js';
import Campaign from '../models/Campaign.js';
import Order from '../models/Order.js';
import Segment from '../models/Segment.js';

const router = express.Router();

// Protect all dashboard routes
router.use(protect);

// @desc    Get dashboard statistics (KPIs)
// @route   GET /api/dashboard/statistics
// @access  Private
router.get('/statistics', async (req, res) => {
  try {
    // Get current date and previous month date for growth calculations
    const currentDate = new Date();
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    
    // Get customer counts and growth
    const totalCustomers = await Customer.countDocuments();
    const previousMonthCustomers = await Customer.countDocuments({
      createdAt: { $lt: previousMonthDate }
    });
    const customerGrowth = previousMonthCustomers > 0 
      ? ((totalCustomers - previousMonthCustomers) / previousMonthCustomers) * 100 
      : 0;
    
    // Get campaign counts and growth
    const totalCampaigns = await Campaign.countDocuments();
    const previousMonthCampaigns = await Campaign.countDocuments({
      createdAt: { $lt: previousMonthDate }
    });
    const campaignGrowth = previousMonthCampaigns > 0 
      ? ((totalCampaigns - previousMonthCampaigns) / previousMonthCampaigns) * 100 
      : 0;
    
    // Get active segment counts and growth
    const activeSegments = await Segment.countDocuments({ isActive: true });
    const previousMonthActiveSegments = await Segment.countDocuments({
      isActive: true,
      createdAt: { $lt: previousMonthDate }
    });
    const segmentGrowth = previousMonthActiveSegments > 0 
      ? ((activeSegments - previousMonthActiveSegments) / previousMonthActiveSegments) * 100 
      : 0;
    
    // Get order counts and growth
    const totalOrders = await Order.countDocuments();
    const previousMonthOrders = await Order.countDocuments({
      order_date: { $lt: previousMonthDate }
    });
    const orderGrowth = previousMonthOrders > 0 
      ? ((totalOrders - previousMonthOrders) / previousMonthOrders) * 100 
      : 0;
    
    // Return dashboard statistics
    res.json({
      customers: totalCustomers,
      customerGrowth: parseFloat(customerGrowth.toFixed(1)),
      campaigns: totalCampaigns,
      campaignGrowth: parseFloat(campaignGrowth.toFixed(1)),
      activeSegments: activeSegments,
      segmentGrowth: parseFloat(segmentGrowth.toFixed(1)),
      orders: totalOrders,
      orderGrowth: parseFloat(orderGrowth.toFixed(1))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get recent activity (campaigns, orders, etc.)
// @route   GET /api/dashboard/recent-activity
// @access  Private
router.get('/recent-activity', async (req, res) => {
  try {
    // Get recent campaigns
    const recentCampaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name status audience audienceSize sent opened clicked');
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ order_date: -1 })
      .limit(5)
      .populate('customer', 'name email')
      .select('order_date total_amount status');
    
    // Return recent activity data
    res.json({
      campaigns: recentCampaigns,
      orders: recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get top customers
// @route   GET /api/dashboard/top-customers
// @access  Private
router.get('/top-customers', async (req, res) => {
  try {
    // Get top customers by spend
    const topCustomers = await Customer.find()
      .sort({ totalSpend: -1 })
      .limit(5)
      .select('name email totalSpend lastVisitDate');
    
    res.json(topCustomers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get performance metrics based on time period
// @route   GET /api/dashboard/performance-metrics
// @access  Private
router.get('/performance-metrics', async (req, res) => {
  try {
    const { period } = req.query;
    let startDate = new Date();
    let interval = '';
    let dateFormat = '';
    
    // Set period parameters
    switch(period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        interval = '$dayOfWeek';
        dateFormat = {
          1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'
        };
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        interval = '$month';
        dateFormat = {
          1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
          7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
        };
        break;
      case 'month':
      default:
        startDate.setMonth(startDate.getMonth() - 1);
        interval = '$dayOfMonth';
        // For month, we'll use actual day numbers
        break;
    }
    
    // Get revenue and order metrics
    const revenueData = await Order.aggregate([
      {
        $match: {
          order_date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { timeInterval: { [interval]: { $dateFromParts: { 'year': { $year: '$order_date' }, 'month': { $month: '$order_date' }, 'day': { $dayOfMonth: '$order_date' } } } } },
          revenue: { $sum: '$total_amount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.timeInterval': 1 }
      }
    ]);
    
    // Get engagement metrics (opens and clicks)
    const engagementData = await Campaign.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { timeInterval: { [interval]: { $dateFromParts: { 'year': { $year: '$createdAt' }, 'month': { $month: '$createdAt' }, 'day': { $dayOfMonth: '$createdAt' } } } } },
          opens: { $sum: '$opened' },
          clicks: { $sum: '$clicked' }
        }
      },
      {
        $sort: { '_id.timeInterval': 1 }
      }
    ]);
    
    // Format the response data
    const formatData = (data, type) => {
      return data.map(item => {
        let name;
        if (period === 'week' || period === 'year') {
          name = dateFormat[item._id.timeInterval];
        } else {
          // For month, use the day number
          name = item._id.timeInterval.toString();
        }
        
        if (type === 'revenue') {
          return {
            name,
            revenue: item.revenue,
            orders: item.orders
          };
        } else {
          return {
            name,
            opens: item.opens,
            clicks: item.clicks
          };
        }
      });
    };
    
    res.json({
      revenue: formatData(revenueData, 'revenue'),
      engagement: formatData(engagementData, 'engagement')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;