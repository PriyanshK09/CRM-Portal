"use client"

import React, { useState, useEffect } from "react"
import { Grid, Button, Chip, Avatar, Divider, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box } from "@mui/material"
import {
  PeopleAlt as PeopleIcon,
  Campaign as CampaignIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Bolt as BoltIcon,
  MoreHoriz as MoreHorizIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Visibility as VisibilityIcon,
  Mouse as MouseIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer
} from "recharts"
import { useNavigate } from "react-router-dom"
import { dashboardService } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import './Dashboard.css'

export default function Dashboard() {
  const [data, setData] = useState({
    statistics: {},
    recentCampaigns: [],
    performanceData: [],
    engagementData: [],
    topPerformingSegments: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod] = useState('month')
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch statistics
        const statistics = await dashboardService.getStatistics()

        // Fetch recent activity (including campaigns)
        const recentActivity = await dashboardService.getRecentActivity()

        // Make sure we have all required properties for each campaign
        let campaigns = []
        if (recentActivity?.campaigns && recentActivity.campaigns.length > 0) {
          campaigns = recentActivity.campaigns.map(campaign => ({
            name: campaign.name || 'Unnamed Campaign',
            status: campaign.status || 'Unknown',
            audience: campaign.audience || campaign.audienceSize || 0,
            sent: campaign.sent || 0,
            opened: campaign.opened || 0,
            clicked: campaign.clicked || 0
          }))
        }

        // Fetch performance metrics
        const performanceMetrics = await dashboardService.getPerformanceMetrics(selectedPeriod)

        // Fetch top segments - using segments API since it's not in dashboard
        // Note: We'll need to adapt to the actual API response format
        const segments = await fetch('/api/segments?limit=3&sort=audienceSize')
          .then(res => res.json())
          .catch(() => [])

        // Format top segments data from API or use mock data if needed
        let topSegments = []
        if (segments && segments.length > 0) {
          topSegments = segments.map(segment => ({
            name: segment.name,
            subscribers: segment.audienceSize || 0,
            clickRate: Math.floor(Math.random() * 30), // Mock data since not available in API
            conversionRate: Math.floor(Math.random() * 15), // Mock data since not available in API
          }))
        } else {
          // Fallback mock data
          topSegments = [
            { name: "High-Value Customers", subscribers: 320, clickRate: 28, conversionRate: 12 },
            { name: "Recent Purchasers", subscribers: 580, clickRate: 24, conversionRate: 8 },
            { name: "Newsletter Subscribers", subscribers: 1240, clickRate: 18, conversionRate: 5 },
          ]
        }

        setData({
          statistics: statistics || {},
          recentCampaigns: campaigns,
          performanceData: performanceMetrics?.revenue || [],
          engagementData: performanceMetrics?.engagement || [],
          topPerformingSegments: topSegments
        })
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")

        // Fallback to mock data
        setData({
          statistics: {
            customers: 1248,
            customerGrowth: 12.5,
            campaigns: 24,
            campaignGrowth: 8.2,
            activeSegments: 8,
            segmentGrowth: 15,
            orders: 3567,
            orderGrowth: -2.8,
          },
          recentCampaigns: [
            { name: "Summer Sale", audience: 756, sent: 750, opened: 432, clicked: 198, status: "Active" },
            { name: "New Product Launch", audience: 512, sent: 510, opened: 345, clicked: 156, status: "Scheduled" },
            { name: "Win-back Campaign", audience: 324, sent: 320, opened: 187, clicked: 89, status: "Completed" },
          ],
          performanceData: [
            { name: "Jan", revenue: 1500, orders: 90 },
            { name: "Feb", revenue: 2500, orders: 150 },
            { name: "Mar", revenue: 3000, orders: 180 },
            { name: "Apr", revenue: 4500, orders: 270 },
            { name: "May", revenue: 5000, orders: 300 },
            { name: "Jun", revenue: 6000, orders: 360 },
          ],
          engagementData: [
            { name: "Mon", opens: 250, clicks: 120 },
            { name: "Tue", opens: 320, clicks: 180 },
            { name: "Wed", opens: 280, clicks: 150 },
            { name: "Thu", opens: 360, clicks: 200 },
            { name: "Fri", opens: 400, clicks: 220 },
            { name: "Sat", opens: 220, clicks: 90 },
            { name: "Sun", opens: 200, clicks: 80 },
          ],
          topPerformingSegments: [
            { name: "High-Value Customers", subscribers: 320, clickRate: 28, conversionRate: 12 },
            { name: "Recent Purchasers", subscribers: 580, clickRate: 24, conversionRate: 8 },
            { name: "Newsletter Subscribers", subscribers: 1240, clickRate: 18, conversionRate: 5 },
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedPeriod])

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
        <div className="dashboard-error">{error}</div>
        <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    )
  }

  // Calculate Total Revenue
  const totalRevenue = data.performanceData.reduce((sum, item) => sum + item.revenue, 0)
  
  // Revenue trend calculation
  const firstHalf = data.performanceData.slice(0, Math.floor(data.performanceData.length / 2))
  const secondHalf = data.performanceData.slice(Math.floor(data.performanceData.length / 2))
  
  const firstHalfRevenue = firstHalf.reduce((sum, item) => sum + item.revenue, 0)
  const secondHalfRevenue = secondHalf.reduce((sum, item) => sum + item.revenue, 0)
  
  let revenueTrend = 0
  if (firstHalfRevenue > 0) {
    revenueTrend = parseFloat((((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100).toFixed(1))
  }

  const StatCard = ({ icon, title, value, trend, color, iconBg }) => (
    <div className="dashboard-statcard">
      <div className="dashboard-statcard-content">
        <div className="dashboard-statcard-title">{title}</div>
        <div className="dashboard-statcard-value-row">
          <div className="dashboard-statcard-value">{value.toLocaleString()}</div>
          <div className="dashboard-statcard-icon" style={{ background: iconBg }}>
            {React.cloneElement(icon, { style: { color: color, fontSize: '1.5rem' } })}
          </div>
        </div>
        <div className="dashboard-statcard-trend-row">
          {trend > 0 ? (
            <span className="dashboard-statcard-trend-chip-up">
              <ArrowUpwardIcon style={{ fontSize: '0.75rem', verticalAlign: 'middle' }} />
              {trend}%
            </span>
          ) : (
            <span className="dashboard-statcard-trend-chip-down">
              <ArrowDownwardIcon style={{ fontSize: '0.75rem', verticalAlign: 'middle' }} />
              {Math.abs(trend)}%
            </span>
          )}
          <span className="dashboard-statcard-trend-label">vs previous month</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <div className="dashboard-title">
          Welcome back, {currentUser?.name || 'User'}
        </div>
        <div className="dashboard-subtitle">
          Here's what's happening with your campaigns today.
        </div>
      </div>
      <div className="dashboard-statcards">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <StatCard 
              icon={<PeopleIcon />} 
              title="Total Customers" 
              value={data.statistics.customers || 0}
              trend={data.statistics.customerGrowth || 0}
              color="#3E63DD" 
              iconBg="rgba(62, 99, 221, 0.1)" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard 
              icon={<CampaignIcon />} 
              title="Active Campaigns" 
              value={data.statistics.campaigns || 0}
              trend={data.statistics.campaignGrowth || 0}
              color="#10AB6D" 
              iconBg="rgba(16, 171, 109, 0.1)" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard 
              icon={<CategoryIcon />} 
              title="Customer Segments" 
              value={data.statistics.activeSegments || 0}
              trend={data.statistics.segmentGrowth || 0}
              color="#3E63DD" 
              iconBg="rgba(62, 99, 221, 0.1)" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard 
              icon={<ShoppingCartIcon />} 
              title="Total Orders" 
              value={data.statistics.orders || 0}
              trend={data.statistics.orderGrowth || 0}
              color="#DD6B20" 
              iconBg="rgba(221, 107, 32, 0.1)" 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard 
              icon={<AttachMoneyIcon />} 
              title="Total Revenue" 
              value={totalRevenue}
              trend={revenueTrend}
              color="#10AB6D"
              iconBg="rgba(16, 171, 109, 0.1)"
            />
          </Grid>
        </Grid>
      </div>
      <div className="dashboard-maincards-row">
        <div className="dashboard-maincard dashboard-maincard-revenue">
          <div className="dashboard-maincard-header">
            <div className="dashboard-maincard-title">Revenue Overview</div>
            <div className="dashboard-maincard-subtitle">Monthly revenue performance</div>
            <Button className="dashboard-maincard-action" variant="outlined" endIcon={<TrendingUpIcon fontSize="small" />} size="small" style={{ fontWeight: 600, borderRadius: 12, color: '#3E63DD', borderColor: '#E5E7EB' }}>
              Full Report
            </Button>
          </div>
          <div className="dashboard-maincard-content">
            <div className="dashboard-maincard-content-row">
              <div>
                <div className="dashboard-maincard-content-label">Total Revenue</div>
                <div className="dashboard-maincard-content-value">₹{totalRevenue.toLocaleString()}</div>
              </div>
              <div>
                <div className="dashboard-maincard-content-label">Average Order Value</div>
                <div className="dashboard-maincard-content-value">
                  ₹{data.statistics.orders > 0 
                    ? (totalRevenue / data.statistics.orders).toFixed(2)
                    : '0.00'}
                </div>
              </div>
            </div>
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.performanceData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3E63DD" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3E63DD" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} padding={{ left: 10, right: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} tickFormatter={(value) => `₹${value}`} domain={[0, 'dataMax + 1000']} />
                  <Tooltip contentStyle={{ borderRadius: 8, boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.1)', border: 'none', padding: '12px', backgroundColor: '#FFFFFF', color: '#1E293B' }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} labelStyle={{ fontWeight: 600, marginBottom: '4px', color: '#1E293B' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3E63DD" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#3E63DD', stroke: '#FFFFFF', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="dashboard-maincard dashboard-maincard-segments">
          <div className="dashboard-maincard-header">
            <div className="dashboard-maincard-title">Top Performing Segments</div>
            <IconButton size="small" style={{ background: '#F1F5F9' }}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </div>
          <div className="dashboard-maincard-content">
            {data.topPerformingSegments.map((segment, idx) => (
              <div key={idx} style={{ padding: '0 16px' }}>
                <div style={{ padding: '16px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>{segment.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PeopleIcon fontSize="small" style={{ color: '#64748B', fontSize: '0.875rem' }} />
                        <span style={{ color: '#64748B', fontSize: '1rem' }}>{segment.subscribers.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <VisibilityIcon fontSize="small" style={{ color: '#64748B', fontSize: '0.875rem' }} />
                        <span style={{ color: '#64748B', fontSize: '1rem' }}>{segment.clickRate}% CTR</span>
                      </div>
                    </div>
                  </div>
                  <Chip label={`${segment.conversionRate}% CVR`} size="small" style={{ height: 24, background: segment.conversionRate > 10 ? '#10AB6D' : '#3E63DD', color: 'white', fontWeight: 600, fontSize: '0.75rem' }} />
                </div>
                {idx < data.topPerformingSegments.length - 1 && <Divider />}
              </div>
            ))}
            <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: 16, marginLeft: 16, marginRight: 16 }}>
              <Button variant="outlined" size="small" fullWidth style={{ borderRadius: 12, borderColor: '#E5E7EB', color: '#1E293B', fontWeight: 500, padding: '6px 0' }}
                onClick={() => navigate('/segments')}
              >
                View All Segments
              </Button>
            </div>
          </div>
        </div>
        <div className="dashboard-maincard dashboard-maincard-ai">
          <div className="dashboard-maincard-ai-header">
            <div className="dashboard-maincard-ai-header-row">
              <Avatar className="dashboard-maincard-ai-avatar">
                <BoltIcon />
              </Avatar>
              <div>
                <div className="dashboard-maincard-ai-header-title">AI-Powered Insights</div>
                <div className="dashboard-maincard-ai-header-desc">Campaign optimization</div>
              </div>
            </div>
          </div>
          <div className="dashboard-maincard-content">
            <div style={{ color: '#64748B', marginBottom: 16 }}>
              AI suggests these optimizations to improve campaign performance by up to 15%.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
              <Button variant="outlined" fullWidth size="small" style={{ justifyContent: 'flex-start', borderRadius: 12, borderColor: '#E5E7EB', color: '#1E293B', padding: '12px 16px', fontWeight: 500, textAlign: 'left' }}>
                Segment optimization
              </Button>
              <Button variant="outlined" fullWidth size="small" style={{ justifyContent: 'flex-start', borderRadius: 12, borderColor: '#E5E7EB', color: '#1E293B', padding: '12px 16px', fontWeight: 500, textAlign: 'left' }}>
                Content recommendations
              </Button>
              <Button variant="outlined" fullWidth size="small" style={{ justifyContent: 'flex-start', borderRadius: 12, borderColor: '#E5E7EB', color: '#1E293B', padding: '12px 16px', fontWeight: 500, textAlign: 'left' }}>
                Send time optimization
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div className="dashboard-maincard">
            <div className="dashboard-maincard-header">
              <div className="dashboard-maincard-title">Campaign Performance</div>
              <Button 
                variant="contained" 
                size="small" 
                style={{ fontWeight: 600, borderRadius: 12, background: '#3E63DD', color: '#fff', boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.1)' }}
                onClick={() => navigate('/campaigns/new')}
              >
                Create Campaign
              </Button>
            </div>
            <Divider />
            <div style={{ padding: 0 }}>
              <TableContainer component={Paper} elevation={0} square>
                <Table style={{ minWidth: 650, width: '100%', tableLayout: 'fixed' }} aria-label="recent campaign performance">
                  <TableHead className="dashboard-table-header">
                    <TableRow>
                      <TableCell className="dashboard-table-cell-header" width="22%">Campaign</TableCell>
                      <TableCell className="dashboard-table-cell-header" width="15%">Status</TableCell>
                      <TableCell className="dashboard-table-cell-header" width="15%">Audience</TableCell>
                      <TableCell className="dashboard-table-cell-header" width="15%">Sent</TableCell>
                      <TableCell className="dashboard-table-cell-header" width="16%">Open Rate</TableCell>
                      <TableCell className="dashboard-table-cell-header" width="17%">Click Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentCampaigns.map((campaign, idx) => (
                      <TableRow
                        key={idx}
                        className="dashboard-table-row"
                      >
                        <TableCell className="dashboard-table-cell" component="th" scope="row">
                          <span style={{ fontWeight: 600, color: '#1E293B' }}>{campaign.name}</span>
                        </TableCell>
                        <TableCell className="dashboard-table-cell">
                          <Chip 
                            label={campaign.status} 
                            size="small"
                            className={`dashboard-table-status-chip ${
                              campaign.status === 'Active' ? 'dashboard-table-status-active' :
                              campaign.status === 'Scheduled' ? 'dashboard-table-status-scheduled' :
                              'dashboard-table-status-completed'}`}
                          />
                        </TableCell>
                        <TableCell className="dashboard-table-cell">
                          <span style={{ fontWeight: 500 }}>{(campaign.audience || 0).toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="dashboard-table-cell">
                          <span style={{ fontWeight: 500 }}>{(campaign.sent || 0).toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="dashboard-table-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(62, 99, 221, 0.1)' }}>
                              <VisibilityIcon style={{ fontSize: 12, color: '#3E63DD' }} />
                            </div>
                            <span style={{ fontWeight: 500 }}>
                              {campaign.sent && campaign.opened ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="dashboard-table-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 171, 109, 0.1)' }}>
                              <MouseIcon style={{ fontSize: 12, color: '#10AB6D' }} />
                            </div>
                            <span style={{ fontWeight: 500 }}>
                              {campaign.sent && campaign.clicked ? Math.round((campaign.clicked / campaign.sent) * 100) : 0}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className="dashboard-table-footer">
                <Button variant="text" style={{ fontWeight: 600, color: '#3E63DD' }}
                  onClick={() => navigate('/campaigns/history')}
                >
                  View All Campaigns
                </Button>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  )
}
