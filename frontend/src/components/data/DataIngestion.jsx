"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Grid,
  Autocomplete,
  CircularProgress
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { customerService, segmentService, orderService } from "../../services/api";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const themeColors = {
  primary: '#4361ee',
  border: '#e9ecef',
  background: '#f8fafc',
  cardBg: '#fff',
  accent: '#7209b7',
  info: '#4895ef',
  error: '#ef476f',
  success: '#4cc9f0',
  text: '#2b2d42',
  textSecondary: '#6c757d',
  inputBg: '#f8fafc',
  inputFocusBg: '#fff',
  button: '#a5a6f6',
  buttonText: '#fff',
  buttonDisabled: '#cfd2e3',
  buttonSecondary: '#495867',
};

const SectionPaper = styled(Paper)(({ theme }) => ({
  background: themeColors.cardBg,
  border: `1px solid ${themeColors.border}`,
  borderRadius: 10,
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
}));

const DropZone = styled('div')(({ theme, isdragactive }) => ({
  border: `2px dashed ${themeColors.info}`,
  borderRadius: 10,
  background: themeColors.inputBg,
  minHeight: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  cursor: 'pointer',
  color: themeColors.info,
  marginBottom: 16,
  transition: 'background 0.2s',
  ...(isdragactive && { background: '#e3f0ff' }),
}));

export default function DataIngestion() {
  const [tabValue, setTabValue] = useState(0)
  const [customerData, setCustomerData] = useState("")
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [previewData, setPreviewData] = useState(null)
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState("");
  const [singleCustomer, setSingleCustomer] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    totalSpend: '', 
    visitCount: '',
    lastVisitDate: null,
    status: 'active',
    tags: [],
    segments: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [singleError, setSingleError] = useState({});
  const [isDragActive, setIsDragActive] = useState(false);
  const [orderCsvFile, setOrderCsvFile] = useState(null);
  const [orderCsvError, setOrderCsvError] = useState("");
  const [orderBulkData, setOrderBulkData] = useState("");
  const [orderPreviewData, setOrderPreviewData] = useState(null);
  const [orderIsDragActive, setOrderIsDragActive] = useState(false);
  const [singleOrder, setSingleOrder] = useState({ 
    id: '', 
    customer_id: '', 
    order_date: null, 
    total_amount: '', 
    status: 'pending',
    payment_method: 'credit_card',
    items: [{ product_id: '', name: '', quantity: 1, price: 0 }],
    shipping_address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    billing_address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [singleOrderError, setSingleOrderError] = useState({});
  const [availableSegments, setAvailableSegments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load available segments for dropdown
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setIsLoading(true);
        const response = await segmentService.getSegments();
        if (response && response.segments) {
          setAvailableSegments(response.segments);
        }
      } catch (error) {
        console.error("Error fetching segments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSegments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setPreviewData(null)
    setCsvFile(null);
    setCsvError("");
    setCustomerData("");
    setSingleCustomer({ name: '', email: '', totalSpend: '', phone: '' });
    setSingleError({});
  }

  const handleCustomerDataChange = (event) => {
    setCustomerData(event.target.value)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv' && file.size <= 5 * 1024 * 1024) {
      setCsvFile(file);
      setCsvError("");
    } else {
      setCsvError("Please upload a valid CSV file (max 5MB)");
    }
  };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = () => setIsDragActive(false);
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv' && file.size <= 5 * 1024 * 1024) {
      setCsvFile(file);
      setCsvError("");
    } else {
      setCsvError("Please upload a valid CSV file (max 5MB)");
    }
  };
  const parseCsv = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const [header, ...rows] = text.trim().split(/\r?\n/);
        const keys = header.split(',');
        const data = rows.map(row => {
          const values = row.split(',');
          return Object.fromEntries(keys.map((k, i) => [k.trim(), values[i]?.trim()]))
        });
        resolve(data);
      };
      reader.onerror = () => reject("Failed to read file");
      reader.readAsText(file);
    });
  };
  const handleStartImport = async () => {
    if (csvFile) {
      try {
        setIsSubmitting(true);
        const data = await parseCsv(csvFile);
        
        // Make API calls to create multiple customers
        const responses = [];
        for (const customer of data) {
          try {
            const response = await customerService.createCustomer(customer);
            responses.push(response);
          } catch (error) {
            console.error(`Error creating customer ${customer.email}:`, error);
          }
        }
        
        setPreviewData(responses);
        setSnackbarMessage(`Imported ${responses.length} customers successfully!`);
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Failed to parse or import CSV:", error);
        setSnackbarMessage("Failed to parse CSV file");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (customerData) {
      try {
        setIsSubmitting(true);
        let data;
        try {
          data = JSON.parse(customerData);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          setSnackbarMessage("Invalid JSON format. Please check the format and try again.");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          setIsSubmitting(false);
          return;
        }
        
        // Handle whether it's an array or single object
        if (Array.isArray(data)) {
          const responses = [];
          for (const customer of data) {
            try {
              const response = await customerService.createCustomer(customer);
              responses.push(response);
            } catch (error) {
              console.error(`Error creating customer ${customer.email}:`, error);
              // Add error to responses to show in preview
              responses.push({ 
                error: true, 
                email: customer.email,
                message: error.response?.data?.message || "API error" 
              });
            }
          }
          setPreviewData(responses);
          const successCount = responses.filter(r => !r.error).length;
          const errorCount = responses.length - successCount;
          
          if (errorCount === 0) {
            setSnackbarMessage(`Imported ${successCount} customers successfully!`);
            setSnackbarSeverity("success");
          } else {
            setSnackbarMessage(`Imported ${successCount} customers with ${errorCount} errors.`);
            setSnackbarSeverity("warning");
          }
        } else {
          try {
            const response = await customerService.createCustomer(data);
            setPreviewData(response);
            setSnackbarMessage("Customer imported successfully!");
            setSnackbarSeverity("success");
          } catch (error) {
            console.error("Error creating single customer:", error);
            setPreviewData({ 
              error: true, 
              message: error.response?.data?.message || "API error",
              details: error.response?.data || {}
            });
            setSnackbarMessage(`Import failed: ${error.response?.data?.message || error.message || "Unknown error"}`);
            setSnackbarSeverity("error");
          }
        }
        
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Error importing JSON data:", error);
        setSnackbarMessage(`Import failed: ${error.response?.data?.message || error.message || "Unknown error"}`);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const handleClearInputs = () => {
    setCsvFile(null);
    setCsvError("");
    setCustomerData("");
    setPreviewData(null);
  };

  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setSingleCustomer({
        ...singleCustomer,
        address: {
          ...singleCustomer.address,
          [addressField]: value
        }
      });
      setSingleError({ ...singleError, [name]: '' });
    } else {
      // Handle direct fields
      setSingleCustomer({ ...singleCustomer, [name]: value });
      setSingleError({ ...singleError, [name]: '' });
    }
  };

  const handleDateChange = (date) => {
    setSingleCustomer({ ...singleCustomer, lastVisitDate: date });
    setSingleError({ ...singleError, lastVisitDate: '' });
  };

  const handleTagsChange = (event, newValue) => {
    setSingleCustomer({ ...singleCustomer, tags: newValue });
  };

  const handleSegmentsChange = (event) => {
    const { value } = event.target;
    setSingleCustomer({ ...singleCustomer, segments: value });
  };

  const handleSingleSubmit = async () => {
    let err = {};
    
    // Validate required fields
    if (!singleCustomer.name.trim()) err.name = 'Name required';
    if (!singleCustomer.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(singleCustomer.email)) {
      err.email = 'Valid email required';
    }
    if (singleCustomer.totalSpend && isNaN(Number(singleCustomer.totalSpend))) {
      err.totalSpend = 'Must be a number';
    }
    if (singleCustomer.visitCount && isNaN(Number(singleCustomer.visitCount))) {
      err.visitCount = 'Must be a number';
    }
    
    if (Object.keys(err).length) { 
      setSingleError(err); 
      return; 
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare customer data for API
      const customerData = {
        ...singleCustomer,
        totalSpend: singleCustomer.totalSpend ? Number(singleCustomer.totalSpend) : 0,
        visitCount: singleCustomer.visitCount ? Number(singleCustomer.visitCount) : 0,
      };
      
      // Make API call to create customer
      const response = await customerService.createCustomer(customerData);
      
      setPreviewData(response);
      setSnackbarMessage("Customer added successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      
      // Reset form after successful submission
      setSingleCustomer({ 
        name: '', 
        email: '', 
        phone: '', 
        totalSpend: '', 
        visitCount: '',
        lastVisitDate: null,
        status: 'active',
        tags: [],
        segments: [],
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      setSnackbarMessage(error.response?.data?.message || "Failed to add customer");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSingleClear = () => {
    setSingleCustomer({ 
      name: '', 
      email: '', 
      phone: '', 
      totalSpend: '', 
      visitCount: '',
      lastVisitDate: null,
      status: 'active',
      tags: [],
      segments: [],
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    });
    setSingleError({});
  };

  const handleOrderDrop = (e) => {
    e.preventDefault();
    setOrderIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv' && file.size <= 5 * 1024 * 1024) {
      setOrderCsvFile(file);
      setOrderCsvError("");
    } else {
      setOrderCsvError("Please upload a valid CSV file (max 5MB)");
    }
  };
  const handleOrderDragOver = (e) => { e.preventDefault(); setOrderIsDragActive(true); };
  const handleOrderDragLeave = () => setOrderIsDragActive(false);
  const handleOrderFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv' && file.size <= 5 * 1024 * 1024) {
      setOrderCsvFile(file);
      setOrderCsvError("");
    } else {
      setOrderCsvError("Please upload a valid CSV file (max 5MB)");
    }
  };
  const handleOrderBulkChange = (e) => setOrderBulkData(e.target.value);
  const handleOrderClearInputs = () => {
    setOrderCsvFile(null);
    setOrderCsvError("");
    setOrderBulkData("");
    setOrderPreviewData(null);
  };
  const handleOrderStartImport = async () => {
    if (orderCsvFile) {
      try {
        setIsSubmitting(true);
        const data = await parseCsv(orderCsvFile);
        
        // Make API calls to create multiple orders
        const responses = [];
        for (const order of data) {
          try {
            const response = await orderService.createOrder(order);
            responses.push(response);
          } catch (error) {
            console.error(`Error creating order ${order.id}:`, error);
            // Add error to responses to show in preview
            responses.push({ 
              error: true, 
              id: order.id,
              message: error.response?.data?.message || "API error" 
            });
          }
        }
        
        setOrderPreviewData(responses);
        const successCount = responses.filter(r => !r.error).length;
        const errorCount = responses.length - successCount;
        
        if (errorCount === 0) {
          setSnackbarMessage(`Imported ${successCount} orders successfully!`);
          setSnackbarSeverity("success");
        } else {
          setSnackbarMessage(`Imported ${successCount} orders with ${errorCount} errors.`);
          setSnackbarSeverity("warning");
        }
        
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Failed to parse or import CSV:", error);
        setSnackbarMessage("Failed to parse CSV file");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (orderBulkData) {
      try {
        setIsSubmitting(true);
        let data;
        try {
          data = JSON.parse(orderBulkData);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          setSnackbarMessage("Invalid JSON format. Please check the format and try again.");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          setIsSubmitting(false);
          return;
        }
        
        // Handle whether it's an array or single object
        if (Array.isArray(data)) {
          const responses = [];
          for (const order of data) {
            try {
              const response = await orderService.createOrder(order);
              responses.push(response);
            } catch (error) {
              console.error(`Error creating order ${order.id}:`, error);
              // Add error to responses to show in preview
              responses.push({ 
                error: true, 
                id: order.id,
                message: error.response?.data?.message || "API error" 
              });
            }
          }
          setOrderPreviewData(responses);
          const successCount = responses.filter(r => !r.error).length;
          const errorCount = responses.length - successCount;
          
          if (errorCount === 0) {
            setSnackbarMessage(`Imported ${successCount} orders successfully!`);
            setSnackbarSeverity("success");
          } else {
            setSnackbarMessage(`Imported ${successCount} orders with ${errorCount} errors.`);
            setSnackbarSeverity("warning");
          }
        } else {
          try {
            const response = await orderService.createOrder(data);
            setOrderPreviewData(response);
            setSnackbarMessage("Order imported successfully!");
            setSnackbarSeverity("success");
          } catch (error) {
            console.error("Error creating single order:", error);
            setOrderPreviewData({ 
              error: true, 
              message: error.response?.data?.message || "API error",
              details: error.response?.data || {}
            });
            setSnackbarMessage(`Import failed: ${error.response?.data?.message || error.message || "Unknown error"}`);
            setSnackbarSeverity("error");
          }
        }
        
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Error importing JSON data:", error);
        setSnackbarMessage(`Import failed: ${error.response?.data?.message || error.message || "Unknown error"}`);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSingleOrderChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('shipping_address.')) {
      const addressField = name.split('.')[1];
      setSingleOrder({
        ...singleOrder,
        shipping_address: {
          ...singleOrder.shipping_address,
          [addressField]: value
        }
      });
    } else if (name.startsWith('billing_address.')) {
      const addressField = name.split('.')[1];
      setSingleOrder({
        ...singleOrder,
        billing_address: {
          ...singleOrder.billing_address,
          [addressField]: value
        }
      });
    } else {
      // Handle direct fields
      setSingleOrder({ ...singleOrder, [name]: value });
    }
    
    setSingleOrderError({ ...singleOrderError, [name]: '' });
  };
  
  const handleOrderDateChange = (date) => {
    setSingleOrder({ ...singleOrder, order_date: date });
    setSingleOrderError({ ...singleOrderError, order_date: '' });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...singleOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Convert numeric fields
    if (field === 'quantity' || field === 'price') {
      updatedItems[index][field] = value === '' ? value : Number(value);
    }
    
    setSingleOrder({ ...singleOrder, items: updatedItems });
  };
  
  const addItem = () => {
    setSingleOrder({
      ...singleOrder,
      items: [...singleOrder.items, { product_id: '', name: '', quantity: 1, price: 0 }]
    });
  };
  
  const removeItem = (index) => {
    if (singleOrder.items.length > 1) {
      const updatedItems = [...singleOrder.items];
      updatedItems.splice(index, 1);
      setSingleOrder({ ...singleOrder, items: updatedItems });
    }
  };
  
  const handleSingleOrderSubmit = async () => {
    let err = {};
    if (!singleOrder.id.trim()) err.id = 'Order ID required';
    if (!singleOrder.customer_id.trim()) err.customer_id = 'Customer ID required';
    if (!singleOrder.order_date) err.order_date = 'Order date required';
    if (!singleOrder.total_amount || isNaN(Number(singleOrder.total_amount))) err.total_amount = 'Valid amount required';
    if (!singleOrder.status) err.status = 'Status required';
    
    // Validate items
    const invalidItems = singleOrder.items.some(item => 
      !item.product_id || !item.name || !item.quantity || !item.price
    );
    
    if (invalidItems) {
      err.items = 'All item fields are required';
    }
    
    if (Object.keys(err).length) { 
      setSingleOrderError(err); 
      return; 
    }
    
    try {
      setIsSubmitting(true);
      
      // Calculate total from items if not manually entered
      let calculatedTotal = 0;
      singleOrder.items.forEach(item => {
        calculatedTotal += (item.quantity * item.price);
      });
      
      const orderData = {
        ...singleOrder,
        total_amount: singleOrder.total_amount ? Number(singleOrder.total_amount) : calculatedTotal,
        order_date: singleOrder.order_date ? singleOrder.order_date.toISOString() : new Date().toISOString()
      };
      
      // Make API call to create order
      const response = await orderService.createOrder(orderData);
      
      setOrderPreviewData(response);
      setSnackbarMessage("Order added successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      
      // Reset form after successful submission
      setSingleOrder({ 
        id: '', 
        customer_id: '', 
        order_date: null, 
        total_amount: '', 
        status: 'pending',
        payment_method: 'credit_card',
        items: [{ product_id: '', name: '', quantity: 1, price: 0 }],
        shipping_address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        billing_address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
    } catch (error) {
      console.error("Error creating order:", error);
      setSnackbarMessage(error.response?.data?.message || "Failed to add order");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSingleOrderClear = () => {
    setSingleOrder({ 
      id: '', 
      customer_id: '', 
      order_date: null, 
      total_amount: '', 
      status: 'pending',
      payment_method: 'credit_card',
      items: [{ product_id: '', name: '', quantity: 1, price: 0 }],
      shipping_address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      billing_address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    });
    setSingleOrderError({});
  };

  const handleLoadCustomerTemplate = () => {
    setCustomerData(customerTemplate);
  };

  const handleLoadOrderTemplate = () => setOrderBulkData(orderTemplate);

  const customerTemplate = JSON.stringify(
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      totalSpend: 1500,
      visitCount: 12,
      lastVisitDate: "2023-04-28T10:35:25.807Z",
      status: "active",
      tags: [
        "loyal",
        "high-value"
      ],
      segments: [],
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "India"
      }
    },
    null,
    2
  );

  const orderTemplate = JSON.stringify(
    {
      id: "ORD-1001",
      customer_id: "68232070f8fa3dc8e46f657f",
      order_date: "2023-05-03T10:35:28.447Z",
      total_amount: 750,
      status: "completed",
      items: [
        {
          product_id: "PROD-001",
          name: "Premium Plan",
          quantity: 1,
          price: 750
        }
      ],
      payment_method: "credit_card",
      shipping_address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "India"
      },
      billing_address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "India"
      }
    },
    null,
    2
  )

  return (
    <Box sx={{ background: themeColors.background, minHeight: '100vh', p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Data Ingestion</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Import customer and order data into your CRM
      </Typography>
      <SectionPaper sx={{ mb: 3, boxShadow: 'none', borderRadius: 0, borderBottom: `2px solid ${themeColors.primary}` }}>
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" sx={{ minHeight: 48 }}>
          <Tab label="Customers" sx={{ fontWeight: 600, minWidth: 120 }} />
          <Tab label="Orders" sx={{ fontWeight: 600, minWidth: 120 }} />
        </Tabs>
      </SectionPaper>
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <SectionPaper sx={{ flex: 2, p: { xs: 2, md: 4 }, borderRadius: 3, minWidth: 340 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Import Customers</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Add multiple customers via CSV file or JSON data.
            </Typography>
            <DropZone
              isdragactive={isDragActive ? 1 : 0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('csv-input').click()}
              sx={{ mb: 2 }}
            >
              <CloudUploadIcon sx={{ fontSize: 38, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Drag 'n' drop a CSV file here, or <span style={{ color: themeColors.accent, textDecoration: 'underline', cursor: 'pointer' }}>click to select</span>.
              </Typography>
              <Typography variant="caption" color="text.secondary">Max file size: 5MB</Typography>
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
            </DropZone>
            {csvFile && (
              <Typography variant="body2" color="success.main" mb={1}>Selected: {csvFile.name}</Typography>
            )}
            {csvError && (
              <Typography variant="body2" color="error.main" mb={1}>{csvError}</Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Or Paste JSON Data</Typography>
              <Button onClick={handleLoadCustomerTemplate} size="small" startIcon={<AssignmentIcon />} sx={{ textTransform: 'none', borderRadius: 1, ml: 1 }}>
                Load Template
              </Button>
            </Box>
            <TextField
              multiline
              minRows={4}
              maxRows={8}
              value={customerData}
              onChange={handleCustomerDataChange}
              fullWidth
              placeholder='[{"name":"John Doe","email":"john@example.com","totalSpend":1250,...}]'
              sx={{ mb: 2, fontFamily: 'monospace', background: themeColors.inputBg, borderRadius: 2 }}
            />
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2, background: '#f4f8ff', color: themeColors.text, border: `1px solid ${themeColors.info}` }}>
              Ensure data includes <b>name</b>, <b>email</b>, and other fields matching the template format.
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleClearInputs} 
                sx={{ minWidth: 120, borderRadius: 2, color: themeColors.buttonSecondary }}
                disabled={isSubmitting}
              >
                Clear Inputs
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleStartImport} 
                disabled={(!csvFile && !customerData) || isSubmitting} 
                sx={{ 
                  minWidth: 120, 
                  borderRadius: 2, 
                  background: themeColors.button, 
                  color: themeColors.buttonText, 
                  '&:disabled': { background: themeColors.buttonDisabled } 
                }}
              >
                {isSubmitting ? 'Importing...' : 'Start Import'}
                {isSubmitting && <CircularProgress size={16} sx={{ ml: 1 }} />}
              </Button>
            </Box>
          </SectionPaper>
          <SectionPaper sx={{ flex: 1, p: { xs: 2, md: 4 }, borderRadius: 3, minWidth: 340 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Add Single Customer</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Manually add a new customer to the database.
            </Typography>
            <Box component="form" autoComplete="off" noValidate>
              {/* Basic Information Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0' 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    Basic Information
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Full Name"
                      name="name"
                      value={singleCustomer.name}
                      onChange={handleSingleChange}
                      error={!!singleError.name}
                      helperText={singleError.name}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email Address"
                      name="email"
                      value={singleCustomer.email}
                      onChange={handleSingleChange}
                      error={!!singleError.email}
                      helperText={singleError.email}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Phone Number"
                      name="phone"
                      value={singleCustomer.phone}
                      onChange={handleSingleChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" sx={{ background: themeColors.inputBg, borderRadius: 2 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={singleCustomer.status}
                        onChange={handleSingleChange}
                        label="Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="new">New</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Engagement Metrics Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0' 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    Engagement Metrics
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Total Spend (₹)"
                      name="totalSpend"
                      value={singleCustomer.totalSpend}
                      onChange={handleSingleChange}
                      error={!!singleError.totalSpend}
                      helperText={singleError.totalSpend}
                      fullWidth
                      size="small"
                      type="number"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Visit Count"
                      name="visitCount"
                      value={singleCustomer.visitCount}
                      onChange={handleSingleChange}
                      error={!!singleError.visitCount}
                      helperText={singleError.visitCount}
                      fullWidth
                      size="small"
                      type="number"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Last Visit Date"
                        value={singleCustomer.lastVisitDate}
                        onChange={handleDateChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            size="small"
                            error={!!singleError.lastVisitDate}
                            helperText={singleError.lastVisitDate}
                            sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Address Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0' 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    Address Information
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Street Address"
                      name="address.street"
                      value={singleCustomer.address.street}
                      onChange={handleSingleChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="City"
                      name="address.city"
                      value={singleCustomer.address.city}
                      onChange={handleSingleChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="State/Province"
                      name="address.state"
                      value={singleCustomer.address.state}
                      onChange={handleSingleChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="ZIP/Postal Code"
                      name="address.zipCode"
                      value={singleCustomer.address.zipCode}
                      onChange={handleSingleChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Country"
                      name="address.country"
                      value={singleCustomer.address.country}
                      onChange={handleSingleChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Segmentation Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0' 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    Tags & Segments
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={singleCustomer.tags}
                      onChange={handleTagsChange}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip 
                            label={option} 
                            {...getTagProps({ index })} 
                            color="primary" 
                            variant="outlined" 
                            size="small" 
                            sx={{ borderRadius: 1 }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder="Add tags..."
                          size="small"
                          sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      size="small" 
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    >
                      <InputLabel>Segments</InputLabel>
                      <Select
                        multiple
                        name="segments"
                        value={singleCustomer.segments}
                        onChange={handleSegmentsChange}
                        input={<OutlinedInput label="Segments" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const segment = availableSegments.find(seg => seg._id === value);
                              return (
                                <Chip 
                                  key={value} 
                                  label={segment ? segment.name : value} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                  sx={{ borderRadius: 1 }}
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {isLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} /> Loading segments...
                          </MenuItem>
                        ) : (
                          availableSegments.map((segment) => (
                            <MenuItem key={segment._id} value={segment._id}>
                              <Checkbox checked={singleCustomer.segments.indexOf(segment._id) > -1} />
                              <ListItemText primary={segment.name} />
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end', 
                mt: 3,
                position: 'sticky',
                bottom: 0,
                pb: 2,
                pt: 2,
                background: themeColors.cardBg,
                borderTop: `1px solid ${themeColors.border}`,
                zIndex: 10
              }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleSingleClear} 
                  sx={{ 
                    minWidth: 120, 
                    borderRadius: 2, 
                    color: themeColors.buttonSecondary,
                    boxShadow: 'none'
                  }}
                  disabled={isSubmitting}
                >
                  Clear Form
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSingleSubmit} 
                  sx={{ 
                    minWidth: 120, 
                    borderRadius: 2, 
                    background: themeColors.button, 
                    color: themeColors.buttonText, 
                    '&:disabled': { background: themeColors.buttonDisabled },
                    boxShadow: '0 2px 8px rgba(67, 97, 238, 0.15)'
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Customer'}
                  {isSubmitting && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Button>
              </Box>
            </Box>
          </SectionPaper>
        </Box>
      )}
      {tabValue === 1 && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <SectionPaper sx={{ flex: 2, p: { xs: 2, md: 4 }, borderRadius: 3, minWidth: 340 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Import Orders</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Add multiple orders via CSV file or JSON data.
            </Typography>
            <DropZone
              isdragactive={orderIsDragActive ? 1 : 0}
              onDrop={handleOrderDrop}
              onDragOver={handleOrderDragOver}
              onDragLeave={handleOrderDragLeave}
              onClick={() => document.getElementById('order-csv-input').click()}
              sx={{ mb: 2 }}
            >
              <CloudUploadIcon sx={{ fontSize: 38, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Drag 'n' drop a CSV file here, or <span style={{ color: themeColors.accent, textDecoration: 'underline', cursor: 'pointer' }}>click to select</span>.
              </Typography>
              <Typography variant="caption" color="text.secondary">Max file size: 5MB</Typography>
              <input
                id="order-csv-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleOrderFileInput}
              />
            </DropZone>
            {orderCsvFile && (
              <Typography variant="body2" color="success.main" mb={1}>Selected: {orderCsvFile.name}</Typography>
            )}
            {orderCsvError && (
              <Typography variant="body2" color="error.main" mb={1}>{orderCsvError}</Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Or Paste JSON Data</Typography>
              <Button onClick={handleLoadOrderTemplate} size="small" startIcon={<AssignmentIcon />} sx={{ textTransform: 'none', borderRadius: 1, ml: 1 }}>
                Load Template
              </Button>
            </Box>
            <TextField
              multiline
              minRows={4}
              maxRows={8}
              value={orderBulkData}
              onChange={handleOrderBulkChange}
              fullWidth
              placeholder='[{"id":"ord456","customer_id":"cust123","order_date":"2023-05-20T14:45:00Z",...}]'
              sx={{ mb: 2, fontFamily: 'monospace', background: themeColors.inputBg, borderRadius: 2 }}
            />
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2, background: '#f4f8ff', color: themeColors.text, border: `1px solid ${themeColors.info}` }}>
              Ensure data includes unique <b>id</b>, <b>customer_id</b>, <b>order_date</b>, <b>total_amount</b>, and <b>status</b>.
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" onClick={handleOrderClearInputs} sx={{ minWidth: 120, borderRadius: 2, color: themeColors.buttonSecondary }}>
                Clear Inputs
              </Button>
              <Button variant="contained" color="primary" onClick={handleOrderStartImport} disabled={!orderCsvFile && !orderBulkData} sx={{ minWidth: 120, borderRadius: 2, background: themeColors.button, color: themeColors.buttonText, '&:disabled': { background: themeColors.buttonDisabled } }}>
                Start Import
              </Button>
            </Box>
          </SectionPaper>
          <SectionPaper sx={{ flex: 1, p: { xs: 2, md: 4 }, borderRadius: 3, minWidth: 340 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Add Single Order</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Manually add a new order to the database.
            </Typography>
            <Box component="form" autoComplete="off" noValidate>
              {/* Basic Order Information */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0' 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    Basic Information
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Order ID"
                      name="id"
                      value={singleOrder.id}
                      onChange={handleSingleOrderChange}
                      error={!!singleOrderError.id}
                      helperText={singleOrderError.id}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Customer ID"
                      name="customer_id"
                      value={singleOrder.customer_id}
                      onChange={handleSingleOrderChange}
                      error={!!singleOrderError.customer_id}
                      helperText={singleOrderError.customer_id}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Order Date"
                        value={singleOrder.order_date}
                        onChange={handleOrderDateChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            size="small"
                            error={!!singleOrderError.order_date}
                            helperText={singleOrderError.order_date}
                            sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Total Amount (₹)"
                      name="total_amount"
                      value={singleOrder.total_amount}
                      onChange={handleSingleOrderChange}
                      error={!!singleOrderError.total_amount}
                      helperText={singleOrderError.total_amount}
                      placeholder="₹0.00"
                      fullWidth
                      size="small"
                      type="number"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" sx={{ background: themeColors.inputBg, borderRadius: 2 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={singleOrder.status}
                        onChange={handleSingleOrderChange}
                        label="Status"
                        error={!!singleOrderError.status}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="refunded">Refunded</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" sx={{ background: themeColors.inputBg, borderRadius: 2 }}>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        name="payment_method"
                        value={singleOrder.payment_method}
                        onChange={handleSingleOrderChange}
                        label="Payment Method"
                      >
                        <MenuItem value="credit_card">Credit Card</MenuItem>
                        <MenuItem value="debit_card">Debit Card</MenuItem>
                        <MenuItem value="paypal">PayPal</MenuItem>
                        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Order Items */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0' 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    Order Items
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary" 
                    onClick={addItem}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Add Item
                  </Button>
                </Box>
                
                {singleOrderError.items && (
                  <Typography color="error" variant="caption" sx={{ mb: 2, display: 'block' }}>
                    {singleOrderError.items}
                  </Typography>
                )}
                
                {singleOrder.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, borderRadius: 2, background: '#ffffff', border: '1px dashed #e2e8f0' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">Item #{index + 1}</Typography>
                        {singleOrder.items.length > 1 && (
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => removeItem(index)}
                            sx={{ minWidth: 'auto', p: 0.5 }}
                          >
                            Remove
                          </Button>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Product ID"
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          fullWidth
                          size="small"
                          sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Product Name"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          fullWidth
                          size="small"
                          sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <TextField
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          fullWidth
                          size="small"
                          InputProps={{ inputProps: { min: 1 } }}
                          sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <TextField
                          label="Price (₹)"
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          fullWidth
                          size="small"
                          InputProps={{ 
                            inputProps: { min: 0, step: "0.01" },
                            startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>₹</Typography>
                          }}
                          sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Paper>
              
              {/* Shipping Address */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0' 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    Shipping Address
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Street Address"
                      name="shipping_address.street"
                      value={singleOrder.shipping_address.street}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="City"
                      name="shipping_address.city"
                      value={singleOrder.shipping_address.city}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="State/Province"
                      name="shipping_address.state"
                      value={singleOrder.shipping_address.state}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="ZIP/Postal Code"
                      name="shipping_address.zipCode"
                      value={singleOrder.shipping_address.zipCode}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Country"
                      name="shipping_address.country"
                      value={singleOrder.shipping_address.country}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Billing Address */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 2, 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0' 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    Billing Address
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Street Address"
                      name="billing_address.street"
                      value={singleOrder.billing_address.street}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="City"
                      name="billing_address.city"
                      value={singleOrder.billing_address.city}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="State/Province"
                      name="billing_address.state"
                      value={singleOrder.billing_address.state}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="ZIP/Postal Code"
                      name="billing_address.zipCode"
                      value={singleOrder.billing_address.zipCode}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Country"
                      name="billing_address.country"
                      value={singleOrder.billing_address.country}
                      onChange={handleSingleOrderChange}
                      fullWidth
                      size="small"
                      sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Form Actions */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end', 
                mt: 3,
                position: 'sticky',
                bottom: 0,
                pb: 2,
                pt: 2,
                background: themeColors.cardBg,
                borderTop: `1px solid ${themeColors.border}`,
                zIndex: 10
              }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleSingleOrderClear} 
                  sx={{ 
                    minWidth: 120, 
                    borderRadius: 2, 
                    color: themeColors.buttonSecondary,
                    boxShadow: 'none'
                  }}
                >
                  Clear Form
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSingleOrderSubmit} 
                  sx={{ 
                    minWidth: 120, 
                    borderRadius: 2, 
                    background: themeColors.button, 
                    color: themeColors.buttonText, 
                    '&:disabled': { background: themeColors.buttonDisabled },
                    boxShadow: '0 2px 8px rgba(67, 97, 238, 0.15)'
                  }}
                >
                  Add Order
                </Button>
              </Box>
            </Box>
          </SectionPaper>
        </Box>
      )}
      {(previewData || orderPreviewData) && (
        <SectionPaper sx={{ mt: 4, p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Data Preview</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Field</strong></TableCell>
                  <TableCell><strong>Value</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(previewData || orderPreviewData)
                  ? (previewData || orderPreviewData).map((row, idx) => Object.entries(row).map(([k, v], i) => (
                      <TableRow key={idx + '-' + k + '-' + i}>
                        <TableCell>{k}</TableCell>
                        <TableCell>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</TableCell>
                      </TableRow>
                    )))
                  : Object.entries(previewData || orderPreviewData).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell>{k}</TableCell>
                        <TableCell>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionPaper>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
