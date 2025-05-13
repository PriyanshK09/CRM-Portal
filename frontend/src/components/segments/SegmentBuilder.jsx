"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { segmentService } from "../../services/api"

// Mock data for audience size preview
const mockAudienceSize = 0

export default function SegmentBuilder() {
  const navigate = useNavigate()
  const location = useLocation()
  const [segmentName, setSegmentName] = useState("")
  const [segmentDescription, setSegmentDescription] = useState("")
  const [rules, setRules] = useState([{ id: "rule-1", field: "total_spend", operator: ">", value: "1000" }])
  const [groups, setGroups] = useState([
    { id: "group-1", operator: "AND", rules: [{ id: "rule-2", field: "visit_count", operator: ">", value: "3" }] },
  ])
  const [audienceSize, setAudienceSize] = useState(mockAudienceSize)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [audienceLoading, setAudienceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [segmentId, setSegmentId] = useState(null)
  const [audienceSizeTimer, setAudienceSizeTimer] = useState(null)

  // Helper to convert backend operator syntax to frontend syntax
  const convertOperatorToFrontend = useCallback((operator) => {
    // Map backend operators to frontend operators
    const operatorMap = {
      'greaterThan': '>',
      'lessThan': '<',
      'equals': '=',
      'greaterThanEquals': '>=',
      'lessThanEquals': '<=',
      'notEquals': '!=',
      'contains': 'contains',
      'notContains': 'not_contains'
    }
    
    return operatorMap[operator] || operator
  }, [])

  // Helper to convert frontend operator syntax to backend syntax
  const convertOperatorForBackend = useCallback((operator) => {
    // Map frontend operators to backend operators
    const operatorMap = {
      '>': 'greaterThan',
      '<': 'lessThan',
      '=': 'equals',
      '>=': 'greaterThanEquals',
      '<=': 'lessThanEquals',
      '!=': 'notEquals',
      'contains': 'contains',
      'not_contains': 'notContains'
    }
    
    return operatorMap[operator] || operator
  }, [])

  // Load segment data when editing an existing segment
  const loadSegmentData = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await segmentService.getSegmentById(id)
      console.log("Segment data response:", response)
      
      // The API returns the segment directly, not wrapped in an object
      if (response && response._id) {
        console.log("Setting segment name:", response.name)
        
        // Temporarily disable the debounced audience calculation
        if (audienceSizeTimer) {
          clearTimeout(audienceSizeTimer)
          setAudienceSizeTimer(null)
        }
        
        // Set the segment name and description
        setSegmentName(response.name || "")
        setSegmentDescription(response.description || "")
        
        // Process and set rules from the segment data
        let primaryRules = []
        let groupedRules = []
        
        if (response.rules && Array.isArray(response.rules)) {
          // Separate rules into primary rules and group rules
          response.rules.forEach((rule, index) => {
            // Format value if it's a date object
            let ruleValue = rule.value
            if (rule.value && typeof rule.value === 'object' && rule.value.$date) {
              // Convert MongoDB date format to a readable format
              ruleValue = new Date(rule.value.$date).toISOString().split('T')[0]
            }
            
            if (rule.groupId) {
              // This rule belongs to a group
              const existingGroupIndex = groupedRules.findIndex(g => g.id === rule.groupId)
              
              if (existingGroupIndex >= 0) {
                // Add to existing group
                groupedRules[existingGroupIndex].rules.push({
                  id: `rule-group-${rule.groupId}-${index}`,
                  field: rule.field || "visit_count",
                  operator: convertOperatorToFrontend(rule.operator) || ">",
                  value: ruleValue || ""
                })
              } else {
                // Create new group
                groupedRules.push({
                  id: rule.groupId,
                  operator: rule.groupOperator?.toUpperCase() || "AND",
                  rules: [{
                    id: `rule-group-${rule.groupId}-${index}`,
                    field: rule.field || "visit_count",
                    operator: convertOperatorToFrontend(rule.operator) || ">",
                    value: ruleValue || ""
                  }]
                })
              }
            } else {
              // Primary rule
              primaryRules.push({
                id: `rule-${index}`,
                field: rule.field || "total_spend",
                operator: convertOperatorToFrontend(rule.operator) || ">",
                value: ruleValue || ""
              })
            }
          })
        }
        
        // Set the processed rules and groups in a batch to prevent multiple updates
        let stateUpdates = {}
        
        if (primaryRules.length > 0) {
          stateUpdates.rules = primaryRules
        }
        
        if (groupedRules.length > 0) {
          stateUpdates.groups = groupedRules
        }
        
        // Set audience size from server response instead of recalculating
        if (response.audienceSize !== undefined) {
          stateUpdates.audienceSize = response.audienceSize
        }
        
        // Batch update state to prevent multiple rendering
        const updateState = () => {
          if (stateUpdates.rules) setRules(stateUpdates.rules)
          if (stateUpdates.groups) setGroups(stateUpdates.groups)
          if (stateUpdates.audienceSize !== undefined) setAudienceSize(stateUpdates.audienceSize)
        }
        
        updateState()
      } else {
        console.error("Invalid segment data format:", response)
        setError("Invalid segment data received. Please try again.")
      }
    } catch (err) {
      console.error("Error loading segment data:", err)
      setError("Failed to load segment data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [audienceSizeTimer, convertOperatorToFrontend])

  // Update audience size
  const updateAudienceSize = useCallback(async () => {
    try {
      setAudienceLoading(true)
      
      // Prepare all rules for audience calculation
      const allRules = [
        ...rules.map(rule => ({
          field: rule.field,
          operator: convertOperatorForBackend(rule.operator),
          value: rule.value
        }))
      ]
      
      // Add group rules if any
      groups.forEach((group, groupIndex) => {
        if (group.rules && group.rules.length > 0) {
          const groupId = `group-${groupIndex}`
          const groupOperator = group.operator.toLowerCase()
          
          group.rules.forEach(rule => {
            allRules.push({
              field: rule.field,
              operator: convertOperatorForBackend(rule.operator), 
              value: rule.value,
              groupId: groupId,
              groupOperator: groupOperator
            })
          })
        }
      })
      
      // If no rules, set audience size to 0
      if (allRules.length === 0) {
        setAudienceSize(0)
        setAudienceLoading(false)
        return
      }
      
      console.log("Calculating audience size for rules:", allRules)
      
      // Call API to calculate actual audience size
      try {
        const response = await segmentService.calculateAudienceSize({ rules: allRules })
        console.log("Audience size response:", response)
        
        if (response && response.audienceSize !== undefined) {
          setAudienceSize(response.audienceSize)
        } else {
          console.error("Invalid audience size response:", response)
          // Keep previous audience size in case of error
        }
      } catch (apiError) {
        console.error("API error calculating audience size:", apiError)
        // Alert the user about the issue but keep the previous audience size
        if (apiError.response && apiError.response.data && apiError.response.data.message) {
          alert(`Failed to calculate audience size: ${apiError.response.data.message}`)
        } else {
          alert("Failed to calculate audience size. Please check your rules and try again.")
        }
      }
    } catch (err) {
      console.error("Error calculating audience size:", err)
      // Fallback to previous audience size if calculation fails
    } finally {
      setAudienceLoading(false)
    }
  }, [rules, groups, convertOperatorForBackend])

  // Get segment ID from URL query parameters if it exists
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get('id')
    
    if (id) {
      setSegmentId(id)
      loadSegmentData(id)
    }
  }, [location, loadSegmentData])

  // Debounced audience size update when rules change
  useEffect(() => {
    // Clear any existing timer
    if (audienceSizeTimer) {
      clearTimeout(audienceSizeTimer)
    }
    
    // Set a new timer to update audience size after changes
    const timer = setTimeout(() => {
      updateAudienceSize()
    }, 1000) // 1 second delay
    
    setAudienceSizeTimer(timer)
    
    // Clean up on unmount
    return () => {
      if (audienceSizeTimer) {
        clearTimeout(audienceSizeTimer)
      }
    }
  }, [rules, groups, audienceSizeTimer, updateAudienceSize])

  // Available fields for segmentation
  const fields = [
    { value: "total_spend", label: "Total Spend" },
    { value: "visit_count", label: "Visit Count" },
    { value: "last_order_date", label: "Last Order Date" },
    { value: "customer_age", label: "Customer Age (days)" },
    { value: "product_category", label: "Product Category" },
    { value: "location", label: "Location" },
  ]

  // Available operators
  const operators = [
    { value: ">", label: ">" },
    { value: "<", label: "<" },
    { value: "=", label: "=" },
    { value: ">=", label: ">=" },
    { value: "<=", label: "<=" },
    { value: "!=", label: "!=" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does Not Contain" },
  ]

  const handleRuleChange = (index, field, value) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], [field]: value }
    setRules(newRules)
  }

  const handleGroupRuleChange = (groupIndex, ruleIndex, field, value) => {
    const newGroups = [...groups]
    newGroups[groupIndex].rules[ruleIndex] = {
      ...newGroups[groupIndex].rules[ruleIndex],
      [field]: value,
    }
    setGroups(newGroups)
  }

  const handleGroupOperatorChange = (groupIndex, value) => {
    const newGroups = [...groups]
    newGroups[groupIndex].operator = value
    setGroups(newGroups)
  }

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: `rule-${Date.now()}`,
        field: "total_spend",
        operator: ">",
        value: "",
      },
    ])
  }

  const removeRule = (index) => {
    const newRules = [...rules]
    newRules.splice(index, 1)
    setRules(newRules)
  }

  const addGroupRule = (groupIndex) => {
    const newGroups = [...groups]
    newGroups[groupIndex].rules.push({
      id: `rule-${Date.now()}`,
      field: "visit_count",
      operator: ">",
      value: "",
    })
    setGroups(newGroups)
  }

  const removeGroupRule = (groupIndex, ruleIndex) => {
    const newGroups = [...groups]
    newGroups[groupIndex].rules.splice(ruleIndex, 1)
    setGroups(newGroups)
  }

  const addGroup = () => {
    setGroups([
      ...groups,
      {
        id: `group-${Date.now()}`,
        operator: "AND",
        rules: [
          {
            id: `rule-${Date.now()}`,
            field: "visit_count",
            operator: ">",
            value: "",
          },
        ],
      },
    ])
  }

  const removeGroup = (index) => {
    const newGroups = [...groups]
    newGroups.splice(index, 1)
    setGroups(newGroups)
  }

  const handleSaveSegment = () => {
    setSaveDialogOpen(true)
  }

  // Handle save and navigate to campaign creation
  const handleSaveAndCreateCampaign = async () => {
    await saveSegmentData()
    navigate("/campaigns/new", {
      state: {
        segmentId,
        segmentName,
        segmentDescription,
        audienceSize,
      },
    })
  }

  // Handle save and go back to segment list
  const handleSaveAndGoToList = async () => {
    await saveSegmentData()
    navigate("/segments/list")
  }

  // Common segment saving logic
  const saveSegmentData = async () => {
    try {
      setLoading(true)
      
      // Format all rules (including group rules) for the backend
      const formattedRules = []
      
      // Add primary rules
      rules.forEach((rule) => {
        formattedRules.push({
          field: rule.field,
          operator: convertOperatorForBackend(rule.operator),
          value: rule.value
        })
      })
      
      // Add group rules
      groups.forEach((group, groupIndex) => {
        const groupId = `group-${groupIndex}`
        
        group.rules.forEach((rule) => {
          formattedRules.push({
            field: rule.field,
            operator: convertOperatorForBackend(rule.operator),
            value: rule.value,
            groupId: groupId,
            groupOperator: group.operator.toLowerCase()
          })
        })
      })
      
      // Prepare segment data for API
      const segmentData = {
        name: segmentName,
        description: segmentDescription,
        rules: formattedRules,
        isActive: true
      }

      console.log("Saving segment data:", segmentData)
      
      let response
      
      if (segmentId) {
        // Update existing segment
        console.log(`Updating segment with ID: ${segmentId}`)
        response = await segmentService.updateSegment(segmentId, segmentData)
        console.log("Update response:", response)
      } else {
        // Create new segment
        console.log("Creating new segment")
        response = await segmentService.createSegment(segmentData)
        console.log("Create response:", response)
        
        // If this is a new segment, set the ID for future reference
        if (response && response._id) {
          setSegmentId(response._id)
        }
      }
      
      // Update audience size with the value from server response
      if (response && response.audienceSize) {
        setAudienceSize(response.audienceSize)
      }
      
      setSaveDialogOpen(false)
      return true
    } catch (err) {
      console.error("Error saving segment:", err)
      const errorMessage = err.response?.data?.message || 'Failed to save segment. Please try again.'
      alert(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const { source, destination, type } = result

    if (type === "rule") {
      const newRules = [...rules]
      const [movedRule] = newRules.splice(source.index, 1)
      newRules.splice(destination.index, 0, movedRule)
      setRules(newRules)
    } else if (type === "group") {
      const newGroups = [...groups]
      const [movedGroup] = newGroups.splice(source.index, 1)
      newGroups.splice(destination.index, 0, movedGroup)
      setGroups(newGroups)
    } else if (type.startsWith("group-rule-")) {
      const groupIndex = Number.parseInt(type.split("-")[2])
      const newGroups = [...groups]
      const groupRules = [...newGroups[groupIndex].rules]
      const [movedRule] = groupRules.splice(source.index, 1)
      groupRules.splice(destination.index, 0, movedRule)
      newGroups[groupIndex].rules = groupRules
      setGroups(newGroups)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1">
          {segmentId ? "Edit Segment" : "Segment Builder"}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveSegment}
            disabled={!segmentName}
            sx={{ ml: 2 }}
          >
            {segmentId ? "Update Segment" : "Save Segment"}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              label="Segment Name"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <TextField
              label="Segment Description"
              value={segmentDescription}
              onChange={(e) => setSegmentDescription(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" gutterBottom>
              Define Segment Rules
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Combine conditions to target specific customer groups.
            </Typography>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Box sx={{ mb: 3 }}>
                <Droppable droppableId="rules" type="rule">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {rules.map((rule, index) => (
                        <Draggable key={rule.id} draggableId={rule.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{ mb: 2, position: "relative" }}
                            >
                              <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: "grab" }}>
                                    <DragIndicatorIcon color="action" />
                                  </Box>
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={3}>
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Field</InputLabel>
                                        <Select
                                          value={rule.field}
                                          onChange={(e) => handleRuleChange(index, "field", e.target.value)}
                                          label="Field"
                                        >
                                          {fields.map((field) => (
                                            <MenuItem key={field.value} value={field.value}>
                                              {field.label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                      <FormControl fullWidth size="small">
                                        <InputLabel>Operator</InputLabel>
                                        <Select
                                          value={rule.operator}
                                          onChange={(e) => handleRuleChange(index, "operator", e.target.value)}
                                          label="Operator"
                                        >
                                          {operators.map((op) => (
                                            <MenuItem key={op.value} value={op.value}>
                                              {op.label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="Value"
                                        value={rule.value}
                                        onChange={(e) => handleRuleChange(index, "value", e.target.value)}
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                      <IconButton
                                        color="error"
                                        onClick={() => removeRule(index)}
                                        disabled={rules.length === 1}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <Button startIcon={<AddIcon />} onClick={addRule} variant="outlined" sx={{ mt: 1 }}>
                  Add Rule
                </Button>
              </Box>

              {rules.length > 0 && groups.length > 0 && (
                <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
                  <Chip label="OR" color="primary" />
                </Box>
              )}

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="groups" type="group">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {groups.map((group, groupIndex) => (
                        <Draggable key={group.id} draggableId={group.id} index={groupIndex}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{ p: 2, mb: 3, bgcolor: "background.default" }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: "grab" }}>
                                  <DragIndicatorIcon color="action" />
                                </Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Rule Group
                                </Typography>
                                <Box sx={{ flexGrow: 1 }} />
                                <FormControl size="small" sx={{ width: 120, mr: 2 }}>
                                  <InputLabel>Operator</InputLabel>
                                  <Select
                                    value={group.operator}
                                    onChange={(e) => handleGroupOperatorChange(groupIndex, e.target.value)}
                                    label="Operator"
                                  >
                                    <MenuItem value="AND">AND</MenuItem>
                                    <MenuItem value="OR">OR</MenuItem>
                                  </Select>
                                </FormControl>
                                <IconButton color="error" onClick={() => removeGroup(groupIndex)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>

                              <Droppable droppableId={`group-rules-${groupIndex}`} type={`group-rule-${groupIndex}`}>
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {group.rules.map((rule, ruleIndex) => (
                                      <Draggable key={rule.id} draggableId={rule.id} index={ruleIndex}>
                                        {(provided) => (
                                          <Card ref={provided.innerRef} {...provided.draggableProps} sx={{ mb: 2 }}>
                                            <CardContent>
                                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: "grab" }}>
                                                  <DragIndicatorIcon color="action" />
                                                </Box>
                                                <Grid container spacing={2} alignItems="center">
                                                  <Grid item xs={12} sm={3}>
                                                    <FormControl fullWidth size="small">
                                                      <InputLabel>Field</InputLabel>
                                                      <Select
                                                        value={rule.field}
                                                        onChange={(e) =>
                                                          handleGroupRuleChange(
                                                            groupIndex,
                                                            ruleIndex,
                                                            "field",
                                                            e.target.value,
                                                          )
                                                        }
                                                        label="Field"
                                                      >
                                                        {fields.map((field) => (
                                                          <MenuItem key={field.value} value={field.value}>
                                                            {field.label}
                                                          </MenuItem>
                                                        ))}
                                                      </Select>
                                                    </FormControl>
                                                  </Grid>
                                                  <Grid item xs={12} sm={3}>
                                                    <FormControl fullWidth size="small">
                                                      <InputLabel>Operator</InputLabel>
                                                      <Select
                                                        value={rule.operator}
                                                        onChange={(e) =>
                                                          handleGroupRuleChange(
                                                            groupIndex,
                                                            ruleIndex,
                                                            "operator",
                                                            e.target.value,
                                                          )
                                                        }
                                                        label="Operator"
                                                      >
                                                        {operators.map((op) => (
                                                          <MenuItem key={op.value} value={op.value}>
                                                            {op.label}
                                                          </MenuItem>
                                                        ))}
                                                      </Select>
                                                    </FormControl>
                                                  </Grid>
                                                  <Grid item xs={12} sm={4}>
                                                    <TextField
                                                      fullWidth
                                                      size="small"
                                                      label="Value"
                                                      value={rule.value}
                                                      onChange={(e) =>
                                                        handleGroupRuleChange(
                                                          groupIndex,
                                                          ruleIndex,
                                                          "value",
                                                          e.target.value,
                                                        )
                                                      }
                                                    />
                                                  </Grid>
                                                  <Grid item xs={12} sm={2}>
                                                    <IconButton
                                                      color="error"
                                                      onClick={() => removeGroupRule(groupIndex, ruleIndex)}
                                                      disabled={group.rules.length === 1}
                                                    >
                                                      <DeleteIcon />
                                                    </IconButton>
                                                  </Grid>
                                                </Grid>
                                              </Box>
                                            </CardContent>
                                          </Card>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>

                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => addGroupRule(groupIndex)}
                                variant="outlined"
                                size="small"
                              >
                                Add Rule to Group
                              </Button>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button startIcon={<AddIcon />} onClick={addGroup} variant="outlined" sx={{ mt: 1 }}>
                Add Rule Group
              </Button>
            </DragDropContext>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: "sticky", top: 80 }}>
            <Typography variant="h6" gutterBottom>
              Segment Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Segment Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {segmentName || "Unnamed Segment"}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {segmentDescription || "No description provided"}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Audience Size
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', height: 45 }}>
                {audienceLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body1" color="text.secondary">
                      Calculating...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {audienceSize.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1, alignSelf: 'flex-end', mb: 0.5 }}>
                      matching customers
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Rule Summary
              </Typography>
              <Box sx={{ pl: 2, borderLeft: "2px solid", borderColor: "primary.main" }}>
                {rules.map((rule, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    {fields.find((f) => f.value === rule.field)?.label || rule.field}{" "}
                    {operators.find((o) => o.value === rule.operator)?.label || rule.operator} {rule.value}
                  </Typography>
                ))}

                {rules.length > 0 && groups.length > 0 && (
                  <Typography variant="body2" fontWeight="bold" sx={{ my: 1 }}>
                    OR
                  </Typography>
                )}

                {groups.map((group, groupIndex) => (
                  <Box key={groupIndex} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Group {groupIndex + 1} ({group.operator})
                    </Typography>
                    {group.rules.map((rule, ruleIndex) => (
                      <Typography key={ruleIndex} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                        {fields.find((f) => f.value === rule.field)?.label || rule.field}{" "}
                        {operators.find((o) => o.value === rule.operator)?.label || rule.operator} {rule.value}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<PlayArrowIcon />}
              onClick={() => updateAudienceSize()}
              disabled={audienceLoading}
            >
              {audienceLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Calculating...
                </>
              ) : 'Refresh Audience Size'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>{segmentId ? "Update Segment" : "Save Segment"}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            <strong>Name:</strong> {segmentName}
          </Typography>
          {segmentDescription && (
            <Typography variant="body1" paragraph>
              <strong>Description:</strong> {segmentDescription}
            </Typography>
          )}
          <Typography variant="body1" paragraph>
            You're about to {segmentId ? "update" : "save"} a segment with {audienceSize.toLocaleString()} customers.
          </Typography>
          <Typography variant="body1" paragraph>
            What would you like to do next?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Box>
            <Button 
              onClick={handleSaveAndGoToList} 
              color="secondary" 
              sx={{ mr: 1 }}
            >
              {segmentId ? "Update & View Segments" : "Save & View Segments"}
            </Button>
            <Button 
              onClick={handleSaveAndCreateCampaign} 
              variant="contained" 
              color="primary"
            >
              {segmentId ? "Update & Create Campaign" : "Save & Create Campaign"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
