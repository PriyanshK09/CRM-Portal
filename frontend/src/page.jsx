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
import SegmentList from "./components/segments/SegmentList";
import CampaignList from "./components/campaigns/CampaignList";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5048E5",
    },
    secondary: {
      main: "#10B981",
    },
    background: {
      default: "#F9FAFC",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        },
      },
    },
  },
})

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
              <Route path="/segments/list" element={<SegmentList />} />
              <Route path="/campaigns/new" element={<CampaignCreation />} />
              <Route path="/campaigns/history" element={<CampaignHistory />} />
              <Route path="/campaigns/list" element={<CampaignList />} />
              <Route path="/data" element={<DataIngestion />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
