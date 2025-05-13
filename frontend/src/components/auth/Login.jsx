"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Box, Button, Container, Typography, Paper, Grid, Divider } from "@mui/material"
import GoogleIcon from "@mui/icons-material/Google"

export default function Login() {
  const { currentUser, signInWithGoogle, signInAsDemo } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      navigate("/")
    }
  }, [currentUser, navigate])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      navigate("/")
    } catch (error) {
      console.error("Error signing in with Google", error)
    }
  }

  const handleDemoSignIn = async () => {
    try {
      await signInAsDemo()
      navigate("/")
    } catch (error) {
      console.error("Error signing in as demo user", error)
    }
  }

  return (
    <Container component="main" maxWidth="lg">
      <Grid container spacing={2} sx={{ height: "100vh", alignItems: "center" }}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
            }}
          >
            <Typography component="h1" variant="h3" gutterBottom>
              Mini CRM Platform
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Manage customers, build segments, and create campaigns
            </Typography>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                mt: 4,
                width: "100%",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography component="h2" variant="h5" gutterBottom>
                Sign in to your account
              </Typography>
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5, width: "100%" }}
              >
                Sign in with Google
              </Button>
              <Divider sx={{ width: '100%', my: 2 }}>
                <Typography variant="body2" color="text.secondary">OR</Typography>
              </Divider>
              <Button
                variant="outlined"
                onClick={handleDemoSignIn}
                size="large"
                sx={{ py: 1.5, width: "100%" }}
              >
                Login as Demo User
              </Button>
            </Paper>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            bgcolor: "primary.main",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ p: 4, color: "white", maxWidth: "500px" }}>
            <Typography variant="h3" gutterBottom>
              Grow your business with data-driven marketing
            </Typography>
            <Typography variant="h6">
              Segment your customers, create targeted campaigns, and analyze performance - all in one platform.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
