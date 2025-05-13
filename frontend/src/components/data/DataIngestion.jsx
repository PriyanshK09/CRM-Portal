"use client"

import { useState } from "react"
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
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import AssignmentIcon from '@mui/icons-material/Assignment';

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
  const [singleCustomer, setSingleCustomer] = useState({ name: '', email: '', totalSpend: '', phone: '' });
  const [singleError, setSingleError] = useState({});
  const [isDragActive, setIsDragActive] = useState(false);
  const [orderCsvFile, setOrderCsvFile] = useState(null);
  const [orderCsvError, setOrderCsvError] = useState("");
  const [orderBulkData, setOrderBulkData] = useState("");
  const [orderPreviewData, setOrderPreviewData] = useState(null);
  const [orderIsDragActive, setOrderIsDragActive] = useState(false);
  const [singleOrder, setSingleOrder] = useState({ id: '', customer_id: '', order_date: '', total_amount: '', status: '' });
  const [singleOrderError, setSingleOrderError] = useState({});

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
        const data = await parseCsv(csvFile);
        setPreviewData(data);
        setSnackbarMessage("CSV data imported successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } catch {
        setSnackbarMessage("Failed to parse CSV file");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } else if (customerData) {
      try {
        const data = JSON.parse(customerData);
        setPreviewData(data);
        setSnackbarMessage("JSON data imported successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } catch {
        setSnackbarMessage("Invalid JSON format");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
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
    setSingleCustomer({ ...singleCustomer, [e.target.name]: e.target.value });
    setSingleError({ ...singleError, [e.target.name]: '' });
  };
  const handleSingleSubmit = () => {
    let err = {};
    if (!singleCustomer.name.trim()) err.name = 'Name required';
    if (!singleCustomer.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(singleCustomer.email)) err.email = 'Valid email required';
    if (singleCustomer.totalSpend && isNaN(Number(singleCustomer.totalSpend))) err.totalSpend = 'Must be a number';
    if (Object.keys(err).length) { setSingleError(err); return; }
    setPreviewData(singleCustomer);
    setSnackbarMessage("Customer added successfully!");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
    setSingleCustomer({ name: '', email: '', totalSpend: '', phone: '' });
  };
  const handleSingleClear = () => {
    setSingleCustomer({ name: '', email: '', totalSpend: '', phone: '' });
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
        const data = await parseCsv(orderCsvFile);
        setOrderPreviewData(data);
        setSnackbarMessage("CSV data imported successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } catch {
        setSnackbarMessage("Failed to parse CSV file");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } else if (orderBulkData) {
      try {
        const data = JSON.parse(orderBulkData);
        setOrderPreviewData(data);
        setSnackbarMessage("JSON data imported successfully!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } catch {
        setSnackbarMessage("Invalid JSON format");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    }
  };

  const handleSingleOrderChange = (e) => {
    setSingleOrder({ ...singleOrder, [e.target.name]: e.target.value });
    setSingleOrderError({ ...singleOrderError, [e.target.name]: '' });
  };
  const handleSingleOrderSubmit = () => {
    let err = {};
    if (!singleOrder.id.trim()) err.id = 'Order ID required';
    if (!singleOrder.customer_id.trim()) err.customer_id = 'Customer ID required';
    if (!singleOrder.order_date.trim()) err.order_date = 'Order date required';
    if (singleOrder.total_amount && isNaN(Number(singleOrder.total_amount))) err.total_amount = 'Must be a number';
    if (!singleOrder.status.trim()) err.status = 'Status required';
    if (Object.keys(err).length) { setSingleOrderError(err); return; }
    setOrderPreviewData(singleOrder);
    setSnackbarMessage("Order added successfully!");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
    setSingleOrder({ id: '', customer_id: '', order_date: '', total_amount: '', status: '' });
  };
  const handleSingleOrderClear = () => {
    setSingleOrder({ id: '', customer_id: '', order_date: '', total_amount: '', status: '' });
    setSingleOrderError({});
  };

  const handleLoadCustomerTemplate = () => setCustomerData(customerTemplate);
  const handleLoadOrderTemplate = () => setOrderBulkData(orderTemplate);

  const customerTemplate = JSON.stringify(
    {
      id: "cust123",
      email: "customer@example.com",
      name: "John Doe",
      phone: "+1234567890",
      created_at: "2023-01-15T10:30:00Z",
      total_spend: 1250.75,
      visit_count: 8,
      last_visit_date: "2023-05-20T14:45:00Z",
    },
    null,
    2,
  )

  const orderTemplate = JSON.stringify(
    {
      id: "ord456",
      customer_id: "cust123",
      order_date: "2023-05-20T14:45:00Z",
      total_amount: 125.5,
      items: [
        {
          product_id: "prod789",
          name: "Premium Widget",
          quantity: 2,
          price: 49.99,
        },
        {
          product_id: "prod101",
          name: "Basic Gadget",
          quantity: 1,
          price: 25.52,
        },
      ],
      status: "completed",
    },
    null,
    2,
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
              placeholder='[{"id":"1","name":"John Doe","email":"john@example.com","totalSpend":1250,...}]'
              sx={{ mb: 2, fontFamily: 'monospace', background: themeColors.inputBg, borderRadius: 2 }}
            />
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2, background: '#f4f8ff', color: themeColors.text, border: `1px solid ${themeColors.info}` }}>
              Ensure data includes unique <b>id</b>, <b>name</b>, and <b>email</b>. Add other attributes as needed.
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" onClick={handleClearInputs} sx={{ minWidth: 120, borderRadius: 2, color: themeColors.buttonSecondary }}>
                Clear Inputs
              </Button>
              <Button variant="contained" color="primary" onClick={handleStartImport} disabled={!csvFile && !customerData} sx={{ minWidth: 120, borderRadius: 2, background: themeColors.button, color: themeColors.buttonText, '&:disabled': { background: themeColors.buttonDisabled } }}>
                Start Import
              </Button>
            </Box>
          </SectionPaper>
          <SectionPaper sx={{ flex: 1, p: { xs: 2, md: 4 }, borderRadius: 3, minWidth: 280 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Add Single Customer</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Manually add a new customer to the database.
            </Typography>
            <Box component="form" autoComplete="off" noValidate>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Total Spend ($)"
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
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={singleCustomer.phone}
                  onChange={handleSingleChange}
                  fullWidth
                  size="small"
                  sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" color="secondary" onClick={handleSingleClear} sx={{ minWidth: 120, borderRadius: 2, color: themeColors.buttonSecondary }}>
                  Clear Form
                </Button>
                <Button variant="contained" color="primary" onClick={handleSingleSubmit} sx={{ minWidth: 120, borderRadius: 2, background: themeColors.button, color: themeColors.buttonText, '&:disabled': { background: themeColors.buttonDisabled } }}>
                  Add Customer
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
          <SectionPaper sx={{ flex: 1, p: { xs: 2, md: 4 }, borderRadius: 3, minWidth: 280 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Add Single Order</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Manually add a new order to the database.
            </Typography>
            <Box component="form" autoComplete="off" noValidate>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Order Date"
                  name="order_date"
                  value={singleOrder.order_date}
                  onChange={handleSingleOrderChange}
                  error={!!singleOrderError.order_date}
                  helperText={singleOrderError.order_date}
                  fullWidth
                  size="small"
                  placeholder="YYYY-MM-DDTHH:mm:ssZ"
                  sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                />
                <TextField
                  label="Total Amount ($)"
                  name="total_amount"
                  value={singleOrder.total_amount}
                  onChange={handleSingleOrderChange}
                  error={!!singleOrderError.total_amount}
                  helperText={singleOrderError.total_amount}
                  fullWidth
                  size="small"
                  type="number"
                  sx={{ background: themeColors.inputBg, borderRadius: 2 }}
                />
              </Box>
              <TextField
                label="Status"
                name="status"
                value={singleOrder.status}
                onChange={handleSingleOrderChange}
                error={!!singleOrderError.status}
                helperText={singleOrderError.status}
                fullWidth
                size="small"
                sx={{ background: themeColors.inputBg, borderRadius: 2, mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" color="secondary" onClick={handleSingleOrderClear} sx={{ minWidth: 120, borderRadius: 2, color: themeColors.buttonSecondary }}>
                  Clear Form
                </Button>
                <Button variant="contained" color="primary" onClick={handleSingleOrderSubmit} sx={{ minWidth: 120, borderRadius: 2, background: themeColors.button, color: themeColors.buttonText, '&:disabled': { background: themeColors.buttonDisabled } }}>
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
