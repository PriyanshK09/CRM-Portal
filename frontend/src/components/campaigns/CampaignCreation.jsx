"use client"

import { useLocation } from "react-router-dom"
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Tooltip,
  IconButton,
  Chip,
  Divider,
  Paper,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Badge,
  Avatar,
} from "@mui/material"
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PreviewIcon from '@mui/icons-material/Preview';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import CampaignIcon from '@mui/icons-material/Campaign';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SegmentIcon from '@mui/icons-material/Segment';
import TemplateIcon from '@mui/icons-material/ViewQuilt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PercentIcon from '@mui/icons-material/Percent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React, { useState, useEffect } from 'react';

// Define theme colors
const themeColors = {
  primary: '#4361ee',
  primaryLight: '#eef2fd',
  secondary: '#3f37c9',
  success: '#4cc9f0',
  successLight: '#e0f7fa',
  text: '#2b2d42',
  textSecondary: '#6c757d',
  background: '#f8fafc',
  cardBg: '#ffffff',
  border: '#e9ecef',
  hover: '#f1f3f5',
  accent: '#4895ef',
  warning: '#ffd166',
  error: '#ef476f',
  purple: '#7209b7',
  templateBoxBg: '#f0f4fd', // New background for template boxes
  templateBoxSelected: '#4361ee', // Selected template highlight color
  templateBoxSelectedText: '#ffffff', // Text color for selected template
  inputBg: '#f8fafc', // Light background for form inputs
  inputFocusBg: '#ffffff' // White background when focused
}

const StyledStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root .Mui-completed': {
    color: themeColors.primary,
  },
  '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
    color: themeColors.text,
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: themeColors.primary,
  },
  '& .MuiStepLabel-label.Mui-active': {
    color: themeColors.primary,
    fontWeight: 600,
  },
  '& .MuiStepLabel-label': {
    fontSize: '0.9rem',
    fontWeight: 500,
  }
}));

const FormSectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: themeColors.primary,
  fontSize: '1.1rem',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  backgroundColor: themeColors.cardBg,
  border: `1px solid ${themeColors.border}`,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 25px rgba(66, 99, 235, 0.1)',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: themeColors.success,
    color: 'white',
  },
}));

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: themeColors.cardBg,
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(4),
  border: `1px solid ${themeColors.border}`,
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    backgroundColor: themeColors.primary,
    opacity: 0.7,
  }
}));

const TemplatePreviewCard = styled(Card)(({ theme, selected, bgColor }) => ({
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius * 2,
  height: '220px', // Fixed height for all cards
  width: '100%', // Full width within grid item
  boxShadow: selected 
    ? '0 5px 15px rgba(67, 97, 238, 0.3)'
    : '0 2px 8px rgba(0,0,0,0.05)',
  overflow: 'hidden',
  backgroundColor: selected ? themeColors.templateBoxSelected : themeColors.templateBoxBg,
  transition: 'all 0.2s ease',
  border: selected 
    ? `2px solid ${themeColors.templateBoxSelected}` 
    : '2px solid transparent',
  '&:hover': {
    borderColor: themeColors.templateBoxSelected,
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(67, 97, 238, 0.2)',
  }
}));

const TemplateTitle = styled(Typography)(({ theme, selected }) => ({
  fontWeight: 600,
  color: selected ? themeColors.templateBoxSelectedText : themeColors.text,
  fontSize: '1rem',
  marginBottom: theme.spacing(1)
}));

const TemplateDescription = styled(Typography)(({ theme, selected }) => ({
  fontSize: '0.875rem',
  color: selected ? themeColors.templateBoxSelectedText : themeColors.textSecondary
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: themeColors.inputBg,
    transition: 'background-color 0.2s, box-shadow 0.2s',
    borderRadius: theme.shape.borderRadius * 1.5,
    '&:hover': {
      backgroundColor: themeColors.inputFocusBg,
    },
    '&.Mui-focused': {
      backgroundColor: themeColors.inputFocusBg,
      boxShadow: '0 0 0 2px rgba(67, 97, 238, 0.2)',
    }
  },
  '& .MuiFormHelperText-root': {
    marginLeft: theme.spacing(1.5),
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: themeColors.inputBg,
    transition: 'background-color 0.2s, box-shadow 0.2s',
    borderRadius: theme.shape.borderRadius * 1.5,
    '&:hover': {
      backgroundColor: themeColors.inputFocusBg,
    },
    '&.Mui-focused': {
      backgroundColor: themeColors.inputFocusBg,
      boxShadow: '0 0 0 2px rgba(67, 97, 238, 0.2)',
    }
  },
  '& .MuiInputLabel-root': {
    transformOrigin: 'left top',
  },
  '& .MuiFormHelperText-root': {
    marginLeft: theme.spacing(1.5),
  }
}));

const steps = ['Campaign Details', 'Audience Selection', 'Content & Schedule'];

// Generate step icons
const stepIcons = [
  <CampaignIcon />,
  <PeopleAltIcon />,
  <CalendarTodayIcon />
];

// Template preview content
const templatePreviews = {
  promotional: {
    title: "Promotional Template",
    description: "Perfect for product promotions and special offers",
    bgColor: '#4361ee', // Blue
    textColor: '#ffffff',
    icon: "local_offer"
  },
  newsletter: {
    title: "Newsletter Template",
    description: "Great for regular updates and company news",
    bgColor: '#4361ee', // Blue
    textColor: '#ffffff',
    icon: "mail"
  },
  announcement: {
    title: "Announcement Template",
    description: "Ideal for important announcements and updates",
    bgColor: '#4361ee', // Blue
    textColor: '#ffffff',
    icon: "campaign"
  },
  discount: {
    title: "Discount Offer",
    description: "Designed for promotional discounts and limited-time offers",
    bgColor: '#4361ee', // Blue
    textColor: '#ffffff',
    icon: "percent"
  }
};

export default function CampaignCreation() {
  const location = useLocation()
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    type: '',
    segment: '',
    template: '',
    startDate: null,
    endDate: null,
    budget: '',
    goal: ''
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // If coming from segment builder, use the passed data
    if (location.state?.segmentName) {
      setCampaignData((prevData) => ({
        ...prevData,
        name: `${location.state.segmentName} Campaign`,
        segment: location.state.segmentId || '' // Add segment ID if available
      }));
      displaySnackbar(`Segment "${location.state.segmentName}" successfully loaded`, 'success');
    }
  }, [location])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaignData({
      ...campaignData,
      [name]: value
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleDateChange = (name, date) => {
    setCampaignData({
      ...campaignData,
      [name]: date
    });
    // Clear error when date is selected
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!campaignData.name.trim()) newErrors.name = 'Campaign name is required';
      if (campaignData.name && campaignData.name.length < 3) newErrors.name = 'Campaign name must be at least 3 characters';
      if (!campaignData.type) newErrors.type = 'Please select a campaign type';
      if (!campaignData.description.trim()) newErrors.description = 'Description is required';
    } 
    else if (activeStep === 1) {
      if (!campaignData.segment) newErrors.segment = 'Please select a segment';
    }
    else if (activeStep === 2) {
      if (!campaignData.template) newErrors.template = 'Please select a template';
      if (!campaignData.startDate) newErrors.startDate = 'Start date is required';
      if (!campaignData.endDate) newErrors.endDate = 'End date is required';
      if (campaignData.startDate && campaignData.endDate && campaignData.startDate > campaignData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (!campaignData.budget.trim()) newErrors.budget = 'Budget is required';
      if (isNaN(campaignData.budget) || parseFloat(campaignData.budget) <= 0) {
        newErrors.budget = 'Budget must be a valid positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
      // Scroll to top when changing steps
      window.scrollTo(0, 0);
      displaySnackbar('Progress saved!', 'success');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Campaign created:', campaignData);
        displaySnackbar('Campaign created successfully!', 'success');
        // In a real application, we would navigate to campaigns dashboard
        // Example: navigate('/campaigns');
      } catch (error) {
        console.error('Error creating campaign:', error);
        displaySnackbar('Error creating campaign. Please try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const displaySnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const calculateProgress = () => {
    const totalFields = 9; // Total number of fields in the form
    const filledFields = Object.entries(campaignData).filter(([key, value]) => {
      if (value === null) return false;
      return value !== '' && !(typeof value === 'string' && value.trim() === '');
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const getCampaignTypeIcon = (type) => {
    switch(type) {
      case 'email': return <EmailIcon />;
      case 'sms': return <SmsIcon />;
      case 'social': return <CampaignIcon />;
      case 'push': return <NotificationsIcon />;
      default: return null;
    }
  };

  const handleTemplateSelect = (template) => {
    setCampaignData({
      ...campaignData,
      template
    });
    // Clear template error if present
    if (errors.template) {
      setErrors({
        ...errors,
        template: ''
      });
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <FormSection>
              <FormSectionTitle variant="h6">
                <PersonOutlineIcon /> Basic Information
              </FormSectionTitle>
            
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Campaign Name"
                    name="name"
                    value={campaignData.name}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name || "Enter a unique name for your campaign"}
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Campaign name will be visible to your team only">
                          <InfoIcon color="action" sx={{ ml: 1 }} fontSize="small" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
              
                <Grid item xs={12}>
                  <StyledFormControl fullWidth error={!!errors.type}>
                    <InputLabel id="campaign-type-label">Campaign Type</InputLabel>
                    <Select
                      labelId="campaign-type-label"
                      id="campaign-type"
                      name="type"
                      value={campaignData.type}
                      label="Campaign Type"
                      onChange={handleChange}
                    >
                      <MenuItem value="email">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon color="primary" />
                          <Typography>Email Campaign</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="sms">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SmsIcon color="secondary" />
                          <Typography>SMS Campaign</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="social">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CampaignIcon color="info" />
                          <Typography>Social Media Campaign</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="push">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <NotificationsIcon color="warning" />
                          <Typography>Push Notification</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                    {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                    {!errors.type && <FormHelperText>Select the channel you want to use for this campaign</FormHelperText>}
                  </StyledFormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={campaignData.description}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description || "Provide a brief description of your campaign's purpose"}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Campaign Goal"
                    name="goal"
                    value={campaignData.goal}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="e.g., Increase sales by 10%"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Setting clear goals will help measure your campaign's success">
                          <HelpOutlineIcon color="action" sx={{ ml: 1 }} fontSize="small" />
                        </Tooltip>
                      ),
                    }}
                    helperText="What do you want to achieve with this campaign?"
                  />
                </Grid>
              </Grid>
            </FormSection>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <FormSection>
              <FormSectionTitle variant="h6">
                <SegmentIcon /> Target Audience
              </FormSectionTitle>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledFormControl fullWidth error={!!errors.segment}>
                    <InputLabel id="segment-label">Customer Segment</InputLabel>
                    <Select
                      labelId="segment-label"
                      id="segment"
                      name="segment"
                      value={campaignData.segment}
                      label="Customer Segment"
                      onChange={handleChange}
                    >
                      <MenuItem value="new-customers">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 32, height: 32 }}>N</Avatar>
                          <Box>
                            <Typography>New Customers (Last 30 Days)</Typography>
                            <Typography variant="caption" color="text.secondary">1,250 contacts</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="high-value">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', width: 32, height: 32 }}>H</Avatar>
                          <Box>
                            <Typography>High Value Customers</Typography>
                            <Typography variant="caption" color="text.secondary">720 contacts</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="inactive">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#ffebee', color: '#c62828', width: 32, height: 32 }}>I</Avatar>
                          <Box>
                            <Typography>Inactive Customers</Typography>
                            <Typography variant="caption" color="text.secondary">3,100 contacts</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="frequent">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#fff8e1', color: '#f57f17', width: 32, height: 32 }}>F</Avatar>
                          <Box>
                            <Typography>Frequent Buyers</Typography>
                            <Typography variant="caption" color="text.secondary">950 contacts</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="all">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 32, height: 32 }}>A</Avatar>
                          <Box>
                            <Typography>All Customers</Typography>
                            <Typography variant="caption" color="text.secondary">15,400 contacts</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </Select>
                    {errors.segment && <FormHelperText>{errors.segment}</FormHelperText>}
                    {!errors.segment && (
                      <FormHelperText>
                        Choose a segment or <Button size="small" sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}>create a new one</Button>
                      </FormHelperText>
                    )}
                  </StyledFormControl>
                </Grid>
                
                {campaignData.segment && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.primary" sx={{ mb: 2 }}>
                      Segment Analytics
                    </Typography>
                    <StyledCard variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Paper sx={{ p: 2, flex: '1 1 auto', minWidth: isMobile ? '100%' : '200px' }}>
                            <Typography variant="overline" display="block" color="text.secondary">
                              Total customers
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {campaignData.segment === 'new-customers' ? '1,250' :
                               campaignData.segment === 'high-value' ? '720' :
                               campaignData.segment === 'inactive' ? '3,100' :
                               campaignData.segment === 'frequent' ? '950' :
                               campaignData.segment === 'all' ? '15,400' : '0'}
                            </Typography>
                          </Paper>
                          
                          <Paper sx={{ p: 2, flex: '1 1 auto', minWidth: isMobile ? '100%' : '200px' }}>
                            <Typography variant="overline" display="block" color="text.secondary">
                              Avg. purchase value
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              ${campaignData.segment === 'new-customers' ? '35.50' :
                               campaignData.segment === 'high-value' ? '125.75' :
                               campaignData.segment === 'inactive' ? '22.30' :
                               campaignData.segment === 'frequent' ? '58.40' :
                               campaignData.segment === 'all' ? '48.60' : '0'}
                            </Typography>
                          </Paper>
                          
                          <Paper sx={{ p: 2, flex: '1 1 auto', minWidth: isMobile ? '100%' : '200px' }}>
                            <Typography variant="overline" display="block" color="text.secondary">
                              Expected engagement
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h4" fontWeight="bold" sx={{ mr: 1 }}>
                                {campaignData.segment === 'new-customers' ? '35%' :
                                 campaignData.segment === 'high-value' ? '68%' :
                                 campaignData.segment === 'inactive' ? '12%' :
                                 campaignData.segment === 'frequent' ? '74%' :
                                 campaignData.segment === 'all' ? '28%' : '0%'}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={campaignData.segment === 'high-value' || campaignData.segment === 'frequent' ? 'High' : 'Average'}
                                color={campaignData.segment === 'high-value' || campaignData.segment === 'frequent' ? 'success' : 'primary'}
                              />
                            </Box>
                          </Paper>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                )}
              </Grid>
            </FormSection>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <FormSection>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormSectionTitle variant="h6" sx={{ mb: 0 }}>
                  <TemplateIcon /> Content Template
                </FormSectionTitle>
                <Tooltip title="Preview selected template">
                  <IconButton 
                    onClick={handlePreviewToggle} 
                    color={showPreview ? "primary" : "default"}
                    disabled={!campaignData.template}
                  >
                    <PreviewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {errors.template && (
                <FormHelperText error sx={{ mb: 2 }}>{errors.template}</FormHelperText>
              )}
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={3} sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  {Object.entries(templatePreviews).map(([key, template], index) => {
                    const isSelected = campaignData.template === key;
                    return (
                      <Grid item key={key} sx={{ width: '100%' }}>
                        <TemplatePreviewCard 
                          selected={isSelected} 
                          onClick={() => handleTemplateSelect(key)}
                        >
                          <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box 
                                sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 48,
                                  height: 48,
                                  borderRadius: '12px',
                                  bgcolor: themeColors.primary,
                                  color: 'white',
                                  mr: 2
                                }}
                              >
                                {template.icon === 'local_offer' && <LocalOfferIcon fontSize="medium" />}
                                {template.icon === 'mail' && <EmailIcon fontSize="medium" />}
                                {template.icon === 'campaign' && <CampaignIcon fontSize="medium" />}
                                {template.icon === 'percent' && <PercentIcon fontSize="medium" />}
                              </Box>
                              <Box>
                                <TemplateTitle selected={isSelected}>{template.title}</TemplateTitle>
                                <TemplateDescription selected={isSelected}>
                                  {template.description}
                                </TemplateDescription>
                              </Box>
                            </Box>
                            {isSelected && (
                              <Box sx={{ mt: 'auto', textAlign: 'right' }}>
                                <Chip 
                                  icon={<CheckCircleIcon />} 
                                  label="Selected" 
                                  size="small"
                                  color="primary"
                                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                />
                              </Box>
                            )}
                          </CardContent>
                        </TemplatePreviewCard>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
              
              {showPreview && campaignData.template && (
                <Box 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    bgcolor: '#f8fafc',
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom fontWeight="600">Template Preview</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: `1px solid ${themeColors.border}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${themeColors.border}`, pb: 1, mb: 2 }}>
                          <Box sx={{ bgcolor: themeColors.primary, width: 80, height: 24, borderRadius: 0.5 }}></Box>
                          <Box sx={{ bgcolor: themeColors.border, width: 24, height: 24, borderRadius: '50%' }}></Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ bgcolor: themeColors.border, width: '100%', height: 20, mb: 1, borderRadius: 0.5 }}></Box>
                          <Box sx={{ bgcolor: themeColors.border, width: '80%', height: 20, mb: 1, borderRadius: 0.5 }}></Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ bgcolor: themeColors.primary, width: '40%', height: 36, borderRadius: 1 }}></Box>
                        </Box>
                        
                        <Box sx={{ bgcolor: themeColors.border, width: '100%', height: 120, borderRadius: 1, mb: 2 }}></Box>
                        
                        {campaignData.template === 'discount' && (
                          <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Box sx={{ bgcolor: themeColors.accent, width: '60%', height: 60, mx: 'auto', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="caption" sx={{ color: 'white' }}>DISCOUNT CODE</Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {templatePreviews[campaignData.template].title}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          This shows how your {templatePreviews[campaignData.template].title.toLowerCase()} will look to your audience. 
                          The content will be customized based on your campaign details and audience segments.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Best used for:</Typography>
                        <ul style={{ paddingLeft: 20, marginTop: 0 }}>
                          {campaignData.template === 'promotional' && (
                            <>
                              <li><Typography variant="body2">New product launches</Typography></li>
                              <li><Typography variant="body2">Special promotions and sales</Typography></li>
                              <li><Typography variant="body2">Seasonal offers</Typography></li>
                            </>
                          )}
                          {campaignData.template === 'newsletter' && (
                            <>
                              <li><Typography variant="body2">Regular customer updates</Typography></li>
                              <li><Typography variant="body2">Company news and articles</Typography></li>
                              <li><Typography variant="body2">Industry insights</Typography></li>
                            </>
                          )}
                          {campaignData.template === 'announcement' && (
                            <>
                              <li><Typography variant="body2">Important company updates</Typography></li>
                              <li><Typography variant="body2">Event announcements</Typography></li>
                              <li><Typography variant="body2">Policy changes</Typography></li>
                            </>
                          )}
                          {campaignData.template === 'discount' && (
                            <>
                              <li><Typography variant="body2">Limited-time offers</Typography></li>
                              <li><Typography variant="body2">Exclusive discount codes</Typography></li>
                              <li><Typography variant="body2">Flash sales</Typography></li>
                            </>
                          )}
                        </ul>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              <FormSectionTitle variant="h6">
                <CalendarTodayIcon /> Schedule & Budget
              </FormSectionTitle>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={campaignData.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: errors.startDate || "When should the campaign begin?",
                          InputProps: {
                            startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'action.active' }} />,
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={campaignData.endDate}
                      onChange={(date) => handleDateChange('endDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: errors.endDate || "When should the campaign end?",
                          InputProps: {
                            startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'action.active' }} />,
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Campaign Budget"
                    name="budget"
                    value={campaignData.budget}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    error={!!errors.budget}
                    helperText={errors.budget || "Enter your total budget for this campaign"}
                  />
                </Grid>
              </Grid>
            </FormSection>
            
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Campaign Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Campaign Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{campaignData.name || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getCampaignTypeIcon(campaignData.type)}
                    <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                      {campaignData.type === 'email' ? 'Email Campaign' :
                       campaignData.type === 'sms' ? 'SMS Campaign' :
                       campaignData.type === 'social' ? 'Social Media Campaign' :
                       campaignData.type === 'push' ? 'Push Notification' :
                       'Not set'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Audience</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {campaignData.segment === 'new-customers' ? 'New Customers (1,250)' :
                     campaignData.segment === 'high-value' ? 'High Value Customers (720)' :
                     campaignData.segment === 'inactive' ? 'Inactive Customers (3,100)' :
                     campaignData.segment === 'frequent' ? 'Frequent Buyers (950)' :
                     campaignData.segment === 'all' ? 'All Customers (15,400)' :
                     'Not set'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {campaignData.startDate && campaignData.endDate 
                      ? `${campaignData.startDate.toLocaleDateString()} - ${campaignData.endDate.toLocaleDateString()}`
                      : 'Not set'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom component="h1">
            Create New Campaign
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set up a new campaign by filling out the information below
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress 
            variant="determinate" 
            value={calculateProgress()} 
            size={48}
            thickness={5}
            sx={{ mr: 1 }}
          />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {calculateProgress()}% Complete
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <StyledStepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel StepIconComponent={() => (
                  <StyledBadge 
                    badgeContent={activeStep > index ? <CheckCircleOutlineIcon fontSize="small" /> : null}
                    overlap="circular"
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                        color: activeStep >= index ? 'white' : 'text.secondary',
                        width: 32, 
                        height: 32 
                      }}
                    >
                      {stepIcons[index]}
                    </Avatar>
                  </StyledBadge>
                )}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </StyledStepper>
        </CardContent>
      </Card>
      
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
            {getStepContent(activeStep)}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                startIcon={activeStep > 0 && <ArrowBackIcon />}
                sx={{
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  borderColor: themeColors.border,
                  '&:hover': {
                    borderColor: themeColors.primary,
                    backgroundColor: themeColors.primaryLight,
                  }
                }}
              >
                Back
              </Button>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{ 
                      minWidth: 150,
                      borderRadius: '8px',
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      boxShadow: '0 4px 10px rgba(67, 97, 238, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(67, 97, 238, 0.4)',
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Creating...
                      </>
                    ) : 'Create Campaign'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      minWidth: 150,
                      borderRadius: '8px',
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      boxShadow: '0 4px 10px rgba(67, 97, 238, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(67, 97, 238, 0.4)',
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
