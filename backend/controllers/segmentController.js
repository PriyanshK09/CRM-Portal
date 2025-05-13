import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';
import mongoose from 'mongoose';

// @desc    Get all segments
// @route   GET /api/segments
// @access  Private
export const getSegments = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Execute query
    const segments = await Segment.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const totalCount = await Segment.countDocuments(filter);
    
    res.json({
      segments,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single segment by ID
// @route   GET /api/segments/:id
// @access  Private
export const getSegmentById = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (segment) {
      res.json(segment);
    } else {
      res.status(404).json({ message: 'Segment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new segment
// @route   POST /api/segments
// @access  Private
export const createSegment = async (req, res) => {
  try {
    const { name, description, rules } = req.body;

    // Check if segment name already exists
    const segmentExists = await Segment.findOne({ name });
    if (segmentExists) {
      return res.status(400).json({ message: 'Segment with this name already exists' });
    }

    // Prepare the segment data
    const segmentData = {
      name,
      description,
      rules: rules || [],
      created_at: new Date()
    };
    
    // Only add created_by if user is available
    if (req.user && req.user._id) {
      segmentData.created_by = req.user._id;
    }

    // Create new segment
    const segment = await Segment.create(segmentData);

    // Calculate and update the audience size based on rules
    const audienceSize = await calculateAudienceSizeForSegment(rules);
    segment.audienceSize = audienceSize;
    await segment.save();

    res.status(201).json(segment);
  } catch (error) {
    console.error('Error creating segment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a segment
// @route   PUT /api/segments/:id
// @access  Private
export const updateSegment = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    const { name, description, rules, isActive } = req.body;

    // Check if new name already exists (if name is being updated)
    if (name && name !== segment.name) {
      const nameExists = await Segment.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ message: 'Segment with this name already exists' });
      }
    }

    // Update segment fields
    if (name) segment.name = name;
    if (description !== undefined) segment.description = description;
    if (isActive !== undefined) segment.isActive = isActive;
    
    // Update rules and recalculate audience if rules are updated
    if (rules) {
      segment.rules = rules;
      
      // Recalculate audience size
      const audienceSize = await calculateAudienceSizeForSegment(rules);
      segment.audienceSize = audienceSize;
    }

    // Save the updated segment
    const updatedSegment = await segment.save();
    
    res.json(updatedSegment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a segment
// @route   DELETE /api/segments/:id
// @access  Private
export const deleteSegment = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    // Find customers who are in this segment and remove the segment from them
    await Customer.updateMany(
      { segments: segment._id },
      { $pull: { segments: segment._id } }
    );

    // Delete the segment
    await segment.remove();
    
    res.json({ message: 'Segment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customers in a segment
// @route   GET /api/segments/:id/customers
// @access  Private
export const getSegmentCustomers = async (req, res) => {
  try {
    const segmentId = req.params.id;
    
    // Check if segment exists
    const segmentExists = await Segment.findById(segmentId);
    if (!segmentExists) {
      return res.status(404).json({ message: 'Segment not found' });
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Find customers in this segment
    const customers = await Customer.find({ segments: segmentId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    // Get total count for pagination
    const totalCount = await Customer.countDocuments({ segments: segmentId });
    
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

// @desc    Calculate audience size for a given set of rules
// @route   POST /api/segments/calculate-audience
// @access  Private
export const calculateAudience = async (req, res) => {
  try {
    const { rules } = req.body;
    
    if (!rules || !Array.isArray(rules)) {
      return res.status(400).json({ message: 'Valid rules array is required' });
    }

    console.log('Received rules for audience calculation:', JSON.stringify(rules));
    
    // Process the rules to handle groups if present
    const processedRules = processRulesWithGroups(rules);
    
    // Calculate audience size with processed rules
    const audienceSize = await calculateAudienceSizeForSegment(processedRules);
    
    res.json({ audienceSize });
  } catch (error) {
    console.error('Error calculating audience size:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to process rules with groups
const processRulesWithGroups = (rules) => {
  // Group rules by groupId
  const groupedRules = {};
  const ungroupedRules = [];
  
  rules.forEach(rule => {
    if (rule.groupId) {
      if (!groupedRules[rule.groupId]) {
        groupedRules[rule.groupId] = {
          operator: rule.groupOperator || 'and',
          rules: []
        };
      }
      // Add rule to its group, without the group information
      const { groupId, groupOperator, ...ruleWithoutGroup } = rule;
      groupedRules[rule.groupId].rules.push(ruleWithoutGroup);
    } else {
      // Keep ungrouped rules as is
      ungroupedRules.push(rule);
    }
  });
  
  console.log('Processed groups:', JSON.stringify(groupedRules));
  console.log('Ungrouped rules:', JSON.stringify(ungroupedRules));
  
  // Return the processed rules directly as we handle groups in the MongoDB query generation
  return rules;
};

// Helper function to calculate audience size based on segment rules
const calculateAudienceSizeForSegment = async (rules) => {
  if (!rules || rules.length === 0) {
    console.log('No rules provided, returning audience size of 0');
    return 0;
  }
  
  try {
    // Convert rules to MongoDB query
    const query = convertRulesToMongoQuery(rules);
    
    if (Object.keys(query).length === 0) {
      console.log('Empty query generated, returning audience size of 0');
      return 0;
    }
    
    console.log('Calculating audience size with query:', JSON.stringify(query));
    
    // Count matching customers
    const count = await Customer.countDocuments(query);
    console.log(`Found ${count} matching customers`);
    return count;
  } catch (error) {
    console.error('Error calculating audience size:', error);
    return 0;
  }
};

// Helper function to convert segment rules to MongoDB query
const convertRulesToMongoQuery = (rules) => {
  if (!rules || rules.length === 0) {
    return {};
  }
  
  console.log('Converting rules to MongoDB query:', JSON.stringify(rules));
  
  // Organize rules by groups
  const groupedRules = {};
  const ungroupedRules = [];
  
  rules.forEach(rule => {
    if (rule.groupId) {
      if (!groupedRules[rule.groupId]) {
        groupedRules[rule.groupId] = {
          operator: rule.groupOperator || 'and',
          conditions: []
        };
      }
      
      // Skip adding the rule if field or operator is missing
      if (!rule.field || !rule.operator) {
        console.warn('Skipping invalid rule:', rule);
        return;
      }
      
      // Create the condition for this rule
      const condition = createConditionFromRule(rule);
      if (condition) {
        groupedRules[rule.groupId].conditions.push(condition);
      }
    } else {
      // Process ungrouped rule
      const condition = createConditionFromRule(rule);
      if (condition) {
        ungroupedRules.push(condition);
      }
    }
  });
  
  // Build the final query
  const orConditions = [];
  
  // Add all ungrouped rules to the main AND condition
  if (ungroupedRules.length > 0) {
    orConditions.push({ $and: ungroupedRules });
  }
  
  // Process each group
  Object.values(groupedRules).forEach(group => {
    if (group.conditions.length > 0) {
      // Use the appropriate operator for the group
      const operatorKey = group.operator.toLowerCase() === 'or' ? '$or' : '$and';
      orConditions.push({ [operatorKey]: group.conditions });
    }
  });
  
  // If we have multiple groups or a mix of grouped and ungrouped rules,
  // combine them with OR as per the UI logic
  const finalQuery = orConditions.length > 1 
    ? { $or: orConditions }
    : orConditions.length === 1 
      ? orConditions[0] 
      : {};
  
  console.log('Final MongoDB query:', JSON.stringify(finalQuery));
  return finalQuery;
};

// Helper function to create a condition from a rule
const createConditionFromRule = (rule) => {
  const { field, operator, value } = rule;
  
  // Skip invalid rules
  if (!field || !operator) {
    console.warn('Skipping invalid rule:', rule);
    return null;
  }
  
  // Map frontend field names to actual MongoDB field names
  const fieldMap = {
    'total_spend': 'totalSpend',
    'visit_count': 'visitCount',
    'last_order_date': 'lastOrderDate',
    'customer_age': 'createdAt', // Special case for age calculation
    'product_category': 'preferredCategory',
    'location': 'location'
  };
  
  // Get the actual field name used in MongoDB
  const dbField = fieldMap[field] || field;
  
  let condition = {};
  
  // Special handling for date fields and calculated fields
  if (field === 'customer_age') {
    // For customer age, we need to convert days to a date
    const daysAgo = !isNaN(value) ? Number(value) : 0;
    const dateValue = new Date();
    dateValue.setDate(dateValue.getDate() - daysAgo);
    
    if (operator === 'greaterThan' || operator === '>') {
      // If age > X days, that means createdAt < (today - X days)
      condition = { [dbField]: { $lt: dateValue } };
    } else if (operator === 'lessThan' || operator === '<') {
      // If age < X days, that means createdAt > (today - X days)
      condition = { [dbField]: { $gt: dateValue } };
    } else {
      // Other operators would need similar logic
      console.warn(`Unsupported operator ${operator} for customer_age`);
      return null;
    }
  } else {
    // Handle other fields normally
    switch (operator) {
      case 'equals':
      case '=':
        condition = { [dbField]: value };
        break;
        
      case 'notEquals':
      case '!=':
        condition = { [dbField]: { $ne: value } };
        break;
        
      case 'greaterThan':
      case '>':
        // Try to convert value to number if appropriate
        const gtValue = !isNaN(value) ? Number(value) : value;
        condition = { [dbField]: { $gt: gtValue } };
        break;
        
      case 'lessThan':
      case '<':
        // Try to convert value to number if appropriate
        const ltValue = !isNaN(value) ? Number(value) : value;
        condition = { [dbField]: { $lt: ltValue } };
        break;
        
      case 'greaterThanEquals':
      case '>=':
        // Try to convert value to number if appropriate
        const gteValue = !isNaN(value) ? Number(value) : value;
        condition = { [dbField]: { $gte: gteValue } };
        break;
        
      case 'lessThanEquals':
      case '<=':
        // Try to convert value to number if appropriate
        const lteValue = !isNaN(value) ? Number(value) : value;
        condition = { [dbField]: { $lte: lteValue } };
        break;
        
      case 'contains':
        condition = { [dbField]: { $regex: value, $options: 'i' } };
        break;
        
      case 'notContains':
      case 'not_contains':
        condition = { [dbField]: { $not: { $regex: value, $options: 'i' } } };
        break;
        
      case 'in':
        const inValues = Array.isArray(value) ? value : [value];
        condition = { [dbField]: { $in: inValues } };
        break;
        
      default:
        console.warn(`Unsupported operator: ${operator}`);
        return null;
    }
  }
  
  console.log(`Converted rule: ${field} (${dbField}) ${operator} ${value} => ${JSON.stringify(condition)}`);
  return condition;
};