import Campaign from '../models/Campaign.js';
import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';

// @desc    Get all campaigns with pagination and filtering
// @route   GET /api/campaigns
// @access  Private
export const getCampaigns = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.segment) {
      filter.segment = req.query.segment;
    }
    
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Date range filters
    if (req.query.startDate) {
      filter.startDate = { $gte: new Date(req.query.startDate) };
    }
    
    if (req.query.endDate) {
      filter.endDate = { $lte: new Date(req.query.endDate) };
    }

    // Execute query
    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('segment', 'name');

    // Get total count for pagination
    const totalCount = await Campaign.countDocuments(filter);
    
    res.json({
      campaigns,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single campaign by ID
// @route   GET /api/campaigns/:id
// @access  Private
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segment', 'name audienceSize');
    
    if (campaign) {
      res.json(campaign);
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private
export const createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      segment: segmentId,
      template,
      startDate,
      endDate,
      budget,
      goal,
      content,
      status
    } = req.body;

    // Check if segment exists
    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    // Create campaign data object
    const campaignData = {
      name,
      description,
      type,
      segment: segmentId,
      segmentName: segment.name,
      template,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: budget || 0,
      goal,
      audienceSize: segment.audienceSize,
      audience: segment.audienceSize,
      status: status || 'Draft',
      content
    };

    // Only add created_by if user is available in the request
    if (req.user && req.user._id) {
      campaignData.created_by = req.user._id;
    }

    // Create new campaign
    const campaign = await Campaign.create(campaignData);

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Private
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Extract data from request body
    const {
      name,
      description,
      type,
      segment: segmentId,
      template,
      startDate,
      endDate,
      budget,
      goal,
      content,
      status
    } = req.body;

    // Update campaign fields
    if (name) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (type) campaign.type = type;
    if (template) campaign.template = template;
    if (startDate) campaign.startDate = new Date(startDate);
    if (endDate) campaign.endDate = new Date(endDate);
    if (budget !== undefined) campaign.budget = budget;
    if (goal !== undefined) campaign.goal = goal;
    if (status) campaign.status = status;
    if (content) campaign.content = content;

    // Handle segment change if provided
    if (segmentId && segmentId !== campaign.segment.toString()) {
      const newSegment = await Segment.findById(segmentId);
      if (!newSegment) {
        return res.status(404).json({ message: 'Segment not found' });
      }
      
      campaign.segment = segmentId;
      campaign.segmentName = newSegment.name;
      campaign.audienceSize = newSegment.audienceSize;
      campaign.audience = newSegment.audienceSize;
    }

    // Save the updated campaign
    const updatedCampaign = await campaign.save();
    
    res.json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Private
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only allow deletion if campaign is in Draft status
    if (campaign.status !== 'Draft' && campaign.status !== 'Cancelled') {
      return res.status(400).json({ 
        message: 'Cannot delete an active or completed campaign. Cancel it first.' 
      });
    }

    await campaign.remove();
    
    res.json({ message: 'Campaign removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update campaign stats (opens, clicks, etc.)
// @route   PUT /api/campaigns/:id/stats
// @access  Private
export const updateCampaignStats = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const { sent, opened, clicked, failed } = req.body;

    // Update campaign stats
    if (sent !== undefined) campaign.sent = sent;
    if (opened !== undefined) campaign.opened = opened;
    if (clicked !== undefined) campaign.clicked = clicked;
    if (failed !== undefined) campaign.failed = failed;

    // Update campaign performance based on the new stats
    campaign.performance = campaign.updatePerformance();

    // Save the updated campaign
    const updatedCampaign = await campaign.save();
    
    res.json({
      campaign: updatedCampaign,
      metrics: {
        openRate: campaign.calculateOpenRate(),
        clickRate: campaign.calculateClickRate()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get campaign performance stats
// @route   GET /api/campaigns/stats
// @access  Private
export const getCampaignStats = async (req, res) => {
  try {
    // Get counts by campaign type
    const campaignsByType = await Campaign.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get counts by status
    const campaignsByStatus = await Campaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get most successful campaigns by click rate
    const topCampaigns = await Campaign.find({
      clicked: { $gt: 0 }
    })
    .sort({ clicked: -1 })
    .limit(5)
    .select('name type clicked sent');
    
    // Calculate average click rate across all campaigns
    const clickRateStats = await Campaign.aggregate([
      {
        $match: { sent: { $gt: 0 } }
      },
      {
        $project: {
          clickRate: { $multiply: [{ $divide: ['$clicked', '$sent'] }, 100] }
        }
      },
      {
        $group: {
          _id: null,
          avgClickRate: { $avg: '$clickRate' }
        }
      }
    ]);
    
    res.json({
      campaignsByType,
      campaignsByStatus,
      topCampaigns,
      averageClickRate: clickRateStats.length > 0 ? clickRateStats[0].avgClickRate : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};