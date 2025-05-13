"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { AuthProvider } from "./contexts/AuthContext"
import Login from "./components/auth/Login"
import Dashboard from "./components/dashboard/Dashboard"
import SegmentBuilder from "./components/segments/SegmentBuilder"
import CampaignCreation from "./components/campaigns/CampaignCreation"
import CampaignHistory from "./components/campaigns/CampaignHistory"
import DataIngestion from "./components/data/DataIngestion"
import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import SegmentList from "./components/segments/SegmentList"
import CampaignList from "./components/campaigns/CampaignList"

// Create a premium professional theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3E63DD',
      light: '#6E8CEF',
      dark: '#2F4CAD',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10AB6D',
      light: '#3CBE84',
      dark: '#0C8956',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E53E3E',
      light: '#FC8181',
      dark: '#C53030',
    },
    warning: {
      main: '#DD6B20',
      light: '#F6AD55',
      dark: '#C05621',
    },
    info: {
      main: '#2A6EBB',
      light: '#63B3ED',
      dark: '#2C5282',
    },
    success: {
      main: '#10AB6D',
      light: '#3CBE84',
      dark: '#0C8956',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      A100: '#F3F4F6',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    overline: {
      fontWeight: 600,
      fontSize: '0.75rem',
      lineHeight: 1.66,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.06)',
    '0px 1px 3px rgba(15, 23, 42, 0.1), 0px 1px 2px rgba(15, 23, 42, 0.06)',
    '0px 4px 8px -2px rgba(15, 23, 42, 0.08), 0px 2px 4px -2px rgba(15, 23, 42, 0.06)',
    '0px 12px 16px -4px rgba(15, 23, 42, 0.08), 0px 4px 6px -2px rgba(15, 23, 42, 0.04)',
    '0px 20px 24px -4px rgba(15, 23, 42, 0.08), 0px 8px 8px -4px rgba(15, 23, 42, 0.04)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          lineHeight: 1.5,
        },
        'input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 100px #FFFFFF inset',
          WebkitTextFillColor: '#0F172A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        sizeLarge: {
          fontSize: '0.9375rem',
          padding: '12px 24px',
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(15, 23, 42, 0.06), 0px 2px 4px rgba(15, 23, 42, 0.04)',
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(to right, #3E63DD, #4F6EE9)',
          '&:hover': {
            background: 'linear-gradient(to right, #2F4CAD, #3E63DD)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(to right, #10AB6D, #12C17C)',
          '&:hover': {
            background: 'linear-gradient(to right, #0C8956, #10AB6D)',
          },
        },
        outlinedPrimary: {
          borderColor: '#3E63DD',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(15, 23, 42, 0.06), 0px 4px 8px rgba(15, 23, 42, 0.04)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px 0',
        },
        title: {
          fontSize: '1rem',
          fontWeight: 600,
          color: '#0F172A',
        },
        subheader: {
          fontSize: '0.875rem',
          color: '#475569',
          marginTop: '4px',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F9FAFB',
          '& .MuiTableCell-root': {
            color: '#475569',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            lineHeight: 1,
            borderBottom: '1px solid #E2E8F0',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '16px 24px',
          borderBottom: '1px solid #E2E8F0',
        },
        head: {
          fontWeight: 600,
          color: '#475569',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: 'rgba(62, 99, 221, 0.02)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          height: '24px',
          fontSize: '0.75rem',
          fontWeight: 500,
          transition: 'all 150ms ease',
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: 'rgba(62, 99, 221, 0.1)',
            color: '#3E63DD',
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: 'rgba(16, 171, 109, 0.1)',
            color: '#10AB6D',
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(229, 62, 62, 0.1)',
            color: '#E53E3E',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(221, 107, 32, 0.1)',
            color: '#DD6B20',
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(16, 171, 109, 0.1)',
            color: '#10AB6D',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            '& fieldset': {
              borderColor: '#E2E8F0',
              transition: 'all 150ms ease',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '1px',
              borderColor: '#3E63DD',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E2E8F0',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: '4px 0px 16px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.06)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        colorDefault: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '40px',
        },
        indicator: {
          height: '2px',
          borderRadius: '2px 2px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          padding: '10px 16px',
          minWidth: 'auto',
          minHeight: '40px',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&.Mui-selected': {
            backgroundColor: 'rgba(62, 99, 221, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(62, 99, 221, 0.12)',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E2E8F0',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 4,
          fontWeight: 500,
        },
        arrow: {
          color: '#0F172A',
        },
      },
    },
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/segments" element={<SegmentBuilder />} />
              <Route path="/campaigns/new" element={<CampaignCreation />} />
              <Route path="/campaigns/history" element={<CampaignHistory />} />
              <Route path="/data" element={<DataIngestion />} />
              <Route path="/segments/list" element={<SegmentList />} />
              <Route path="/campaigns/list" element={<CampaignList />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
