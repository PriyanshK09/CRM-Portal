"use client"

import { useState } from "react"
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
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

// Mock data for audience size preview
const mockAudienceSize = 1248

export default function SegmentBuilder() {
  const navigate = useNavigate()
  const [segmentName, setSegmentName] = useState("")
  const [rules, setRules] = useState([{ id: "rule-1", field: "total_spend", operator: ">", value: "1000" }])
  const [groups, setGroups] = useState([
    { id: "group-1", operator: "AND", rules: [{ id: "rule-2", field: "visit_count", operator: ">", value: "3" }] },
  ])
  const [audienceSize, setAudienceSize] = useState(mockAudienceSize)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

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
    updateAudienceSize()
  }

  const handleGroupRuleChange = (groupIndex, ruleIndex, field, value) => {
    const newGroups = [...groups]
    newGroups[groupIndex].rules[ruleIndex] = {
      ...newGroups[groupIndex].rules[ruleIndex],
      [field]: value,
    }
    setGroups(newGroups)
    updateAudienceSize()
  }

  const handleGroupOperatorChange = (groupIndex, value) => {
    const newGroups = [...groups]
    newGroups[groupIndex].operator = value
    setGroups(newGroups)
    updateAudienceSize()
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
    updateAudienceSize()
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
    updateAudienceSize()
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
    updateAudienceSize()
  }

  const updateAudienceSize = () => {
    // In a real app, you would call an API to get the actual audience size
    // based on the current rules
    const randomFactor = Math.random() * 0.3 + 0.7 // Random factor between 0.7 and 1.0
    setAudienceSize(Math.floor(mockAudienceSize * randomFactor))
  }

  const handleSaveSegment = () => {
    setSaveDialogOpen(true)
  }

  const handleSaveConfirm = () => {
    // In a real app, you would save the segment to your backend
    console.log("Saving segment:", {
      name: segmentName,
      rules,
      groups,
      audienceSize,
    })

    setSaveDialogOpen(false)
    navigate("/campaigns/new", {
      state: {
        segmentName,
        audienceSize,
      },
    })
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

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1">
          Segment Builder
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
            Save Segment
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
                Audience Size
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {audienceSize.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                customers match your criteria
              </Typography>
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
            >
              Refresh Audience Size
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Segment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            You\'re about to save a segment with {audienceSize.toLocaleString()} customers.
          </Typography>
          <Typography variant="body1">Would you like to create a campaign for this segment now?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfirm} variant="contained" color="primary">
            Save & Create Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
