"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  Tooltip,
  MenuItem,
  Select,
  Button,
  CircularProgress,
  Fade,
} from "@mui/material"
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from "@mui/icons-material"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { useNavigate } from 'react-router-dom';

// Mock data for campaigns
const mockCampaigns = [
  {
    id: 1,
    name: "Summer Sale Promotion",
    segmentName: "High Value Customers",
    createdAt: "2023-06-15T10:30:00Z",
    audienceSize: 756,
    sent: 750,
    opened: 432,
    clicked: 198,
    failed: 6,
    type: "promotional",
    performance: "high",
  },
  {
    id: 2,
    name: "New Product Launch",
    segmentName: "Recent Purchasers",
    createdAt: "2023-06-10T14:45:00Z",
    audienceSize: 512,
    sent: 510,
    opened: 345,
    clicked: 156,
    failed: 2,
    type: "announcement",
    performance: "medium",
  },
  {
    id: 3,
    name: "Win-back Campaign",
    segmentName: "Inactive Customers",
    createdAt: "2023-06-05T09:15:00Z",
    audienceSize: 324,
    sent: 320,
    opened: 187,
    clicked: 89,
    failed: 4,
    type: "win-back",
    performance: "medium",
  },
  {
    id: 4,
    name: "Loyalty Rewards",
    segmentName: "VIP Customers",
    createdAt: "2023-05-28T11:20:00Z",
    audienceSize: 128,
    sent: 128,
    opened: 112,
    clicked: 98,
    failed: 0,
    type: "loyalty",
    performance: "high",
  },
  {
    id: 5,
    name: "Flash Sale",
    segmentName: "All Customers",
    createdAt: "2023-05-20T16:30:00Z",
    audienceSize: 1248,
    sent: 1240,
    opened: 687,
    clicked: 312,
    failed: 8,
    type: "promotional",
    performance: "low",
  },
]

// AI-generated performance insights
const mockInsights = [
  "The 'Loyalty Rewards' campaign had the highest engagement rate at 87.5%.",
  "Campaigns targeting 'VIP Customers' consistently outperform other segments.",
  "The 'Win-back Campaign' had a 27.8% click-through rate, which is 5% higher than average.",
  "Consider sending campaigns on Tuesdays for optimal open rates based on historical data.",
]

// Theme colors for consistency
const themeColors = {
  primary: '#4361ee', // Vibrant Blue
  secondary: '#7209b7', // Purple
  accent: '#f72585', // Pink
  success: '#4cc9f0', // Light Blue / Cyan
  warning: '#f59e0b', // Amber
  error: '#ef476f', // Red
  info: '#4895ef', // Sky Blue
  background: '#f8fafc', // Very Light Gray
  cardBg: '#ffffff', // White
  border: '#dee2e6', // Light Gray
  text: '#212529', // Dark Gray / Almost Black
  textSecondary: '#6c757d', // Medium Gray
  inputBg: '#f1f3f5', // Lighter Gray for inputs
  inputFocusBg: '#ffffff', // White on focus
  button: '#4361ee', // Primary Blue
  buttonText: '#ffffff', // White
  buttonDisabled: '#ced4da', // Gray for disabled
  buttonSecondary: '#6c757d', // Medium Gray
  tableHeaderBg: '#f1f3f5',
  hoverRowBg: '#e9ecef',
  selectedRowBg: '#dcfce7', // A light green for selection, implies success/focus
  chipBg: '#e7e7ff', // Light purple for chips, derived from primary
};

export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(0)
  const rowsPerPage = 5
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    setCampaigns(mockCampaigns)
  }, [])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [searchTerm, typeFilter, sortBy, sortOrder, page])

  const processedCampaigns = useMemo(() => {
    let data = [...campaigns]
    if (typeFilter) data = data.filter(c => c.type === typeFilter)
    if (searchTerm) {
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.segmentName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    data.sort((a, b) => {
      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      return 0
    })
    return data
  }, [campaigns, searchTerm, typeFilter, sortBy, sortOrder])

  const pagedCampaigns = useMemo(() => {
    const start = page * rowsPerPage
    return processedCampaigns.slice(start, start + rowsPerPage)
  }, [processedCampaigns, page])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign === selectedCampaign ? null : campaign)
  }

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    else {
      setSortBy(col)
      setSortOrder("asc")
    }
  }

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value)
    setPage(0)
  }

  const handleOpenCreateCampaign = () => {
    navigate('/campaigns/new');
  };

  const handlePageChange = (inc) => {
    setPage((prev) => Math.max(0, Math.min(prev + inc, Math.floor(processedCampaigns.length / rowsPerPage) -1 ))) // Fix off-by-one
  }

  const handleCloseDetails = () => setSelectedCampaign(null)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "promotional":
        return "primary"
      case "win-back":
        return "secondary"
      case "loyalty":
        return "success"
      case "announcement":
        return "info"
      default:
        return "default" // MUI default chip color
    }
  }

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "high":
        return "#10B981" // success
      case "medium":
        return "#F59E0B" // warning
      case "low":
        return "#EF4444" // error
      default:
        return "#6B7280" // gray
    }
  }

  const renderCampaignPerformanceChart = (campaign) => {
    const data = [
      { name: "Opened", value: campaign.opened, color: "#3B82F6" }, // blue
      { name: "Clicked", value: campaign.clicked, color: "#10B981" }, // green
      { name: "Not Opened", value: campaign.sent - campaign.opened, color: "#D1D5DB" }, // gray
      { name: "Failed", value: campaign.failed, color: themeColors.error }, // Add failed to chart
    ]

    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value) => `${value} recipients`} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Box sx={{ background: themeColors.background, minHeight: '100vh', p: { xs: 1, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: themeColors.primary, letterSpacing: 0.5 }}>
            Campaign Insights Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: themeColors.textSecondary, mt: 1 }}>
            Oversee and analyze your campaign performance. Click on a campaign for detailed metrics.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleOpenCreateCampaign}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: 1,
            minWidth: 180,
            bgcolor: themeColors.button,
            color: themeColors.buttonText,
            '&:hover': { bgcolor: themeColors.accent }
          }}>
          Create Campaign
        </Button>
      </Box>
      <Grid container spacing={selectedCampaign ? 3 : 4} alignItems="flex-start" sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        {/* Main content area (Table + Insights) */}
        <Grid 
          item 
          xs={12} 
          md={selectedCampaign ? 7 : 12} 
          sx={{ 
            transition: 'width 0.3s ease-in-out', // Only transition width
            order: { xs: 2, md: 1 }, // Ensure table comes first on md+
            display: 'flex', // Use flex to contain children properly
            flexDirection: 'column'
          }}
        >
          <Paper sx={{ p: 0, mb: 0, borderRadius: 3, boxShadow: '0 6px 18px rgba(0,0,0,0.05)', border: `1px solid ${themeColors.border}`, background: themeColors.cardBg }}>
            {/* Table Controls */}
            <Box
              sx={{
                display: "flex",
                flexWrap: 'wrap',
                justifyContent: "space-between",
                alignItems: 'center',
                p: { xs: 2, md: 3 },
                borderBottom: `1px solid ${themeColors.border}`,
                gap: 2,
                bgcolor: themeColors.background,
                borderTopLeftRadius: 'inherit',
                borderTopRightRadius: 'inherit',
              }}
            >
              <TextField
                placeholder="Search by name or segment..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                sx={{
                  width: { xs: '100%', sm: 280 },
                  background: themeColors.inputBg,
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: themeColors.border },
                    '&:hover fieldset': { borderColor: themeColors.primary },
                    '&.Mui-focused fieldset': { borderColor: themeColors.primary, boxShadow: `0 0 0 2px ${themeColors.primary}30` },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: themeColors.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Select
                  value={typeFilter}
                  onChange={handleTypeFilter}
                  displayEmpty
                  size="small"
                  sx={{
                    minWidth: 180,
                    background: themeColors.inputBg,
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: themeColors.border },
                      '&:hover fieldset': { borderColor: themeColors.primary },
                    }
                  }}
                >
                  <MenuItem value="">All Campaign Types</MenuItem>
                  <MenuItem value="promotional">Promotional</MenuItem>
                  <MenuItem value="win-back">Win-back</MenuItem>
                  <MenuItem value="loyalty">Loyalty</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                </Select>
                <Tooltip title="Advanced Filters (coming soon)">
                  <IconButton sx={{ color: themeColors.textSecondary, border: `1px solid ${themeColors.border}`, borderRadius: 2, p: '7px' }}>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            {/* Table Section */}
            <Fade in={!loading} timeout={400} unmountOnExit>
              <TableContainer sx={{ maxHeight: 600, overflowY: 'auto' }}>
                <Table stickyHeader aria-label="campaign history table">
                  <TableHead>
                    <TableRow sx={{ '& th': { background: themeColors.tableHeaderBg, color: themeColors.text, fontWeight: 'bold', py: 1.5 } }}>
                      <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          Campaign Name
                          {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="inherit" sx={{ ml: 0.5 }} /> : <ArrowDownwardIcon fontSize="inherit" sx={{ ml: 0.5 }} />)}
                        </Box>
                      </TableCell>
                      <TableCell onClick={() => handleSort('createdAt')} sx={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          Date Sent
                          {sortBy === 'createdAt' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="inherit" sx={{ ml: 0.5 }} /> : <ArrowDownwardIcon fontSize="inherit" sx={{ ml: 0.5 }} />)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>Audience Size</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>Delivery Metrics</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>Engagement</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedCampaigns.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                          <Alert severity="info" icon={<InfoIcon />} sx={{ justifyContent: 'center', maxWidth: 400, mx: 'auto', bgcolor: themeColors.inputBg, color: themeColors.textSecondary }}>
                            No campaigns match your current filters. Try adjusting your search or filter criteria.
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                    {pagedCampaigns.map((campaign) => (
                      <TableRow
                        key={campaign.id}
                        hover
                        onClick={() => handleCampaignClick(campaign)}
                        selected={selectedCampaign?.id === campaign.id}
                        sx={{
                          cursor: "pointer",
                          transition: 'background-color 0.2s ease, border-left-color 0.2s ease',
                          borderLeft: selectedCampaign?.id === campaign.id ? `5px solid ${themeColors.primary}` : '5px solid transparent',
                          '&:hover': {
                            backgroundColor: themeColors.hoverRowBg,
                          },
                          '&.Mui-selected': {
                            backgroundColor: themeColors.selectedRowBg,
                            '&:hover': {
                              backgroundColor: themeColors.selectedRowBg, // Keep selected color on hover
                            }
                          },
                          'td, th': {
                            py: 1.5, // Adjusted padding
                            fontSize: '0.9rem', // Standardized font size
                            borderBottom: `1px solid ${themeColors.border}`,
                          },
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Tooltip title={campaign.name} placement="top-start" arrow>
                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                              <Typography variant="subtitle1" fontWeight={600} sx={{ color: themeColors.text, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {campaign.name}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                <Typography variant="caption" sx={{ color: themeColors.textSecondary, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {campaign.segmentName}
                                </Typography>
                                <Chip
                                  label={campaign.type}
                                  size="small"
                                  color={getTypeColor(campaign.type)}
                                  sx={{
                                    borderRadius: 1,
                                    fontWeight: 500,
                                    textTransform: 'capitalize',
                                    fontSize: '0.7rem',
                                    height: '20px',
                                    bgcolor: campaign.type === 'promotional' ? themeColors.chipBg : undefined, // Example of specific chip styling
                                    color: campaign.type === 'promotional' ? themeColors.primary : undefined,
                                  }}
                                />
                              </Box>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(campaign.createdAt)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{campaign.audienceSize.toLocaleString()}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            <Typography variant="body2" sx={{ color: themeColors.text, fontWeight: 500 }}>
                              <span style={{color: themeColors.textSecondary, fontSize: '0.8rem'}}>Sent: </span>{campaign.sent.toLocaleString()}
                            </Typography>
                            {campaign.failed > 0 ? (
                              <Typography variant="caption" sx={{ color: themeColors.error, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                                Failed: {campaign.failed.toLocaleString()}
                              </Typography>
                            ) : (
                              <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                Failed: 0
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Tooltip title={`Performance: ${campaign.performance}`} arrow>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: getPerformanceColor(campaign.performance),
                                  mr: 1,
                                  flexShrink: 0,
                                }}
                              />
                            </Tooltip>
                            <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                              {Math.round((campaign.opened / campaign.sent) * 100)}% opened, {Math.round((campaign.clicked / campaign.sent) * 100)}% clicked
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Fade>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, p: 3 }}>
                <CircularProgress color="primary" />
                <Typography sx={{ ml: 2, color: themeColors.textSecondary }}>Loading campaigns...</Typography>
              </Box>
            )}
            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: `1px solid ${themeColors.border}`, bgcolor: themeColors.background, borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
              <Typography variant="caption" sx={{color: themeColors.textSecondary}}>
                Showing {pagedCampaigns.length > 0 ? page * rowsPerPage + 1 : 0}-{Math.min((page + 1) * rowsPerPage, processedCampaigns.length)} of {processedCampaigns.length} campaigns
              </Typography>
              <Box sx={{ display: 'flex', gap: 1}}>
                <Button onClick={() => handlePageChange(-1)} disabled={page === 0 || loading} size="small" variant="outlined" sx={{color: themeColors.textSecondary, borderColor: themeColors.border}}>Previous</Button>
                <Button onClick={() => handlePageChange(1)} disabled={page + 1 >= Math.ceil(processedCampaigns.length / rowsPerPage) || loading} size="small" variant="outlined" sx={{color: themeColors.textSecondary, borderColor: themeColors.border}}>Next</Button>
              </Box>
            </Box>
          </Paper>
          {/* AI Insights Section (conditionally rendered) */}
          {!selectedCampaign && (
            <Paper sx={{ p: { xs: 2, md: 3 }, mt: 3, borderRadius: 3, boxShadow: '0 6px 18px rgba(0,0,0,0.05)', border: `1px solid ${themeColors.border}`, background: themeColors.cardBg }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1.5, fontSize: '1.8rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: themeColors.text }}>AI-Powered Campaign Insights</Typography>
              </Box>
              <Divider sx={{ mb: 2.5, borderColor: themeColors.border }} />
              {mockInsights.length > 0 ? (
                <Grid container spacing={2}>
                  {mockInsights.map((insight, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card variant="outlined" sx={{
                        borderRadius: 2,
                        border: `1px solid ${themeColors.info}60`, // Lighter border
                        background: `${themeColors.info}15`, // Very light info background
                        height: '100%',
                        display: 'flex',
                      }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2 }}>
                          <InfoIcon sx={{ color: themeColors.info, mt: 0.5, fontSize: '1.2rem' }} />
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary, lineHeight: 1.6 }}>{insight}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info" sx={{ bgcolor: themeColors.inputBg }}>No AI insights available at the moment.</Alert>
              )}
            </Paper>
          )}
        </Grid>
        {/* Campaign Details Panel */}
        {selectedCampaign && (
          <Grid 
            item 
            xs={12} 
            md={5} 
            sx={{ 
              order: { xs: 1, md: 2 }, // Ensure details comes second on md+
              display: 'block' // Explicitly set display
            }}
          >
            {/* Temporarily remove Fade to isolate layout issue */}
            {/* <Fade in={true} timeout={300}> */}
            <Paper sx={{
              p: { xs: 2, md: 3 },
              position: "sticky",
              top: { xs: 16, md: 24 }, // Adjust for responsive sticky position
              borderRadius: 3,
              boxShadow: '0 8px 30px rgba(0,0,0,0.07)',
              border: `1px solid ${themeColors.border}`,
              background: themeColors.cardBg,
              minWidth: 320, // Ensure a minimum width
              maxHeight: 'calc(100vh - 48px)', // Max height with padding
              overflowY: 'auto'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 0 }}>
                  Campaign Details
                </Typography>
                <IconButton onClick={handleCloseDetails} size="medium" sx={{ color: themeColors.textSecondary }}><CloseIcon /></IconButton>
              </Box>
              <Divider sx={{ mb: 2.5, borderColor: themeColors.border }} />

              {selectedCampaign && (
                <>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Campaign Name
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ color: themeColors.text, fontSize: '1.1rem' }}>
                      {selectedCampaign.name}
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Segment
                      </Typography>
                      <Typography variant="body1" sx={{ color: themeColors.text }}>{selectedCampaign.segmentName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Date Sent
                      </Typography>
                      <Typography variant="body1" sx={{ color: themeColors.text }}>{formatDate(selectedCampaign.createdAt)}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      Performance Overview
                    </Typography>
                    {renderCampaignPerformanceChart(selectedCampaign)}
                    <Grid container spacing={1} sx={{ mt: 2, textAlign: 'center' }}>
                      {[
                        { label: "Sent", value: selectedCampaign.sent },
                        { label: "Opened", value: selectedCampaign.opened },
                        { label: "Clicked", value: selectedCampaign.clicked },
                        { label: "Failed", value: selectedCampaign.failed }
                      ].map(metric => (
                        <Grid item xs={3} key={metric.label}>
                          <Paper variant="outlined" sx={{ p: 1, borderColor: themeColors.border, background: themeColors.background }}>
                            <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>
                              {metric.label}
                            </Typography>
                            <Typography variant="h6" sx={{ color: themeColors.text, fontSize: '1.2rem' }}>
                              {metric.value.toLocaleString()}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                    <Divider sx={{ my: 2.5, borderColor: themeColors.border }} />
                    <Grid container spacing={2}>
                      {[
                        { label: "Delivery Rate", value: Math.round((selectedCampaign.sent / selectedCampaign.audienceSize) * 100), unit: "%" },
                        { label: "Open Rate", value: Math.round((selectedCampaign.opened / selectedCampaign.sent) * 100), unit: "%" },
                        { label: "Click Rate", value: Math.round((selectedCampaign.clicked / selectedCampaign.sent) * 100), unit: "%" },
                        { label: "Failure Rate", value: Math.round((selectedCampaign.failed / selectedCampaign.sent) * 100), unit: "%" }
                      ].map(metric => (
                        <Grid item xs={6} sm={3} key={metric.label}>
                           <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontSize: '0.8rem' }}>{metric.label}</Typography>
                           <Typography variant="body1" fontWeight={600} sx={{ color: themeColors.text }}>{metric.value}{metric.unit}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      AI Analysis
                    </Typography>
                    <Card variant="outlined" sx={{
                      mt: 1, borderRadius: 2,
                      border: `1px solid ${selectedCampaign.performance === "high" ? themeColors.success : selectedCampaign.performance === "medium" ? themeColors.warning : themeColors.error}60`,
                      background: `${selectedCampaign.performance === "high" ? themeColors.success : selectedCampaign.performance === "medium" ? themeColors.warning : themeColors.error}15`,
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ color: themeColors.textSecondary, lineHeight: 1.6 }}>
                          {selectedCampaign.performance === "high"
                            ? "This campaign performed exceptionally well with an open rate significantly above average. Consider using similar messaging and targeting for future campaigns to replicate this success."
                            : selectedCampaign.performance === "medium"
                              ? "This campaign had average performance. Exploring A/B testing for subject lines or call-to-actions might improve engagement."
                              : "This campaign underperformed. A review of the target audience, message content, and send time is recommended. Consider if the segment was appropriate."}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      Activity Log
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, background: themeColors.inputBg, borderRadius: 2, borderColor: themeColors.border }}>
                      <ul style={{ paddingLeft: 18, margin: 0, color: themeColors.textSecondary, fontSize: '0.85rem', listStyleType: 'disc' }}>
                        {[
                          `Campaign draft created: ${formatDate(new Date(new Date(selectedCampaign.createdAt).getTime() - Math.random() * 24 * 60 * 60 * 1000))}`, // Mock earlier date
                          `Audience segment '${selectedCampaign.segmentName}' defined.`,
                          `Campaign scheduled and approved.`,
                          `Sent to ${selectedCampaign.sent.toLocaleString()} recipients on ${formatDate(selectedCampaign.createdAt)}.`,
                          `Initial tracking: ${selectedCampaign.opened.toLocaleString()} opens, ${selectedCampaign.clicked.toLocaleString()} clicks.`,
                          selectedCampaign.failed > 0 && `${selectedCampaign.failed} delivery failures recorded.`,
                          `Performance categorized as: ${selectedCampaign.performance}.`
                        ].filter(Boolean).map((activity, idx) => (
                          <li key={idx} style={{ marginBottom: idx === 6 ? 0 : '6px' }}>{activity}</li>
                        ))}
                      </ul>
                    </Paper>
                  </Box>
                </>
              )}
            </Paper>
            {/* </Fade> */}
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
