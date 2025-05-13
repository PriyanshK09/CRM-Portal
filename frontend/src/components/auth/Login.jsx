"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { 
  Box, 
  Button, 
  Typography, 
  TextField,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
  Modal,
  Paper,
  Tooltip
} from "@mui/material"
import { 
  Visibility, 
  VisibilityOff, 
  Google as GoogleIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  ChevronRight as ChevronRightIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"

// Custom styled components for enhanced visual appeal
const LoginContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  background: '#f5f7ff'
}));

// Left side - Login form
const LoginFormContainer = styled('div')(({ theme }) => ({
  flex: '0 0 450px',
  padding: '40px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
}));

// Right side - Blue banner
const LoginBanner = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(6),
  background: 'linear-gradient(135deg, #3E63DD 0%, #6E8CEF 100%)',
  color: 'white',
  position: 'relative',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 1
      }
    }
  }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  padding: '12px',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  backgroundColor: theme.palette.primary.main,
}));

const SocialButton = styled(Button)(({ theme }) => ({
  padding: '12px',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '0.95rem',
  textTransform: 'none',
  border: '1px solid #E2E8F0',
  justifyContent: 'center',
  width: '100%',
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2.5),
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: theme.spacing(1.5),
  }
}));

const Divider = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: '20px 0',
  '&::before, &::after': {
    content: '""',
    flex: 1,
    borderBottom: '1px solid #e2e8f0'
  },
  '& span': {
    padding: '0 10px',
    color: theme.palette.text.secondary,
    fontSize: '14px'
  }
}));

// Modal Paper component
const ModalPaper = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxWidth: '90%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  padding: 24,
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 6,
  padding: 6,
  '&:hover': {
    backgroundColor: 'rgba(62, 99, 221, 0.06)',
  }
}));

const CredentialField = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#F9FAFB',
  marginBottom: 16
}));

export default function Login() {
  const { currentUser, login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)

  // Google OAuth client ID
  const googleClientId = "88933272732-rsm5mc4g1gjv9qm85lkau13q8vr772gc.apps.googleusercontent.com"

  // Demo credentials
  const demoCredentials = {
    email: "admin@xeno.com",
    password: "123456"
  }

  useEffect(() => {
    if (currentUser) {
      navigate("/")
    }
    
    // Load Google API script
    const loadGoogleScript = () => {
      // Check if the script is already loaded
      if (document.querySelector(`script[src="https://accounts.google.com/gsi/client"]`)) return
      
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      document.body.appendChild(script)
      
      return () => {
        // Clean up
        document.body.removeChild(script)
      }
    }
    
    loadGoogleScript()
  }, [currentUser, navigate])
  
  // Initialize Google One Tap after the script is loaded
  useEffect(() => {
    // Only proceed if Google API is loaded and user isn't already logged in
    if (!window.google || currentUser) return;
    
    const handleGoogleCredentialResponse = async (response) => {
      try {
        setLoading(true);
        setError("");
        
        // Decode the JWT token to get user information
        const payload = parseJwt(response.credential);
        
        await loginWithGoogle({
          idToken: response.credential,
          name: payload.name,
          email: payload.email,
          googleId: payload.sub
        });
        
        navigate("/");
      } catch (error) {
        console.error("Google sign-in error:", error);
        setError(error.response?.data?.message || "Google authentication failed");
      } finally {
        setLoading(false);
      }
    };
    
    setTimeout(() => {
      try {
        // Initialize Google Sign-In with the correct client ID
        window.google?.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });
        
        // Render the Google Sign-In button
        const buttonElement = document.getElementById("googleSignInButton");
        if (buttonElement) {
          window.google?.accounts.id.renderButton(
            buttonElement,
            { 
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signin_with",
              shape: "rectangular"
            }
          );
        } else {
          console.error("Google sign-in button element not found");
        }
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
      }
    }, 500); // Give a small delay to ensure the Google API is fully loaded
    
  }, [currentUser, navigate, loginWithGoogle, googleClientId]);

  // Parse JWT token from Google
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      return null
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }
    
    try {
      setLoading(true)
      await login(email, password)
      navigate("/")
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sign in")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setDemoModalOpen(true)
  }

  const handleCloseDemoModal = () => {
    setDemoModalOpen(false)
    setEmailCopied(false)
    setPasswordCopied(false)
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'email') {
        setEmailCopied(true)
        setTimeout(() => setEmailCopied(false), 2000)
      } else {
        setPasswordCopied(true)
        setTimeout(() => setPasswordCopied(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const useCredentials = () => {
    setEmail(demoCredentials.email)
    setPassword(demoCredentials.password)
    handleCloseDemoModal()
  }

  return (
    <LoginContainer>
      {/* Left side - Login form */}
      <LoginFormContainer>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight={700} color="primary">
            CRM Portal
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': { alignItems: 'center' }
            }}
          >
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleLogin}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Email Address</Typography>
            <StyledTextField
              fullWidth
              id="email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="your.email@example.com"
              variant="outlined"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Password</Typography>
            <StyledTextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••••"
              variant="outlined"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="large"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Link
              component="button"
              variant="body2"
              type="button"
              sx={{ textDecoration: 'none', fontWeight: 500 }}
            >
              Forgot password?
            </Link>
          </Box>
          
          <LoginButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                Sign In
                <ChevronRightIcon sx={{ ml: 0.5 }} />
              </>
            )}
          </LoginButton>
          
          <Divider>
            <span>Or continue with</span>
          </Divider>
          
          {/* Google Sign In Button */}
          <Box sx={{ mb: 2 }}>
            {/* Visible div for Google's button */}
            <Box 
              id="googleSignInButton" 
              sx={{ 
                width: '100%', 
                height: '42px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                '& > div': {
                  borderRadius: '8px !important',
                  width: '100% !important',
                  boxShadow: 'none !important',
                },
                '& iframe': {
                  width: '100% !important',
                  scale: '1.02',
                },
                '&:hover': {
                  boxShadow: '0px 2px 4px rgba(62, 99, 221, 0.12)',
                  border: '1px solid rgba(62, 99, 221, 0.3)',
                  transition: 'all 0.2s ease'
                }
              }} 
            />
            
            {/* Fallback custom button in case Google button doesn't load */}
            {!window.google && (
              <SocialButton
                fullWidth
                variant="outlined"
                onClick={() => console.log("Google API not loaded yet")}
                disabled={loading || !window.google}
                startIcon={<GoogleIcon sx={{ color: '#4285F4' }} />}
                sx={{ 
                  mt: 1, 
                  display: window.google ? 'none' : 'flex',
                  backgroundColor: '#ffffff',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    boxShadow: '0px 2px 4px rgba(62, 99, 221, 0.12)',
                    border: '1px solid rgba(62, 99, 221, 0.3)'
                  }
                }}
              >
                Sign in with Google
              </SocialButton>
            )}
          </Box>
          
          <SocialButton
            fullWidth
            variant="outlined"
            onClick={handleDemoLogin}
            disabled={loading}
            sx={{ bgcolor: '#F8FAFC' }}
          >
            Demo account - View credentials
          </SocialButton>
        </Box>

        {/* Demo Credentials Modal */}
        <Modal
          open={demoModalOpen}
          onClose={handleCloseDemoModal}
          aria-labelledby="demo-modal-title"
        >
          <ModalPaper>
            <Typography id="demo-modal-title" variant="h6" component="h2" fontWeight={600} sx={{ mb: 2 }}>
              Demo Credentials
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Use these admin credentials to explore the full functionality of the CRM Portal:
            </Typography>
            
            <CredentialField>
              <Box>
                <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block' }}>
                  Email
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {demoCredentials.email}
                </Typography>
              </Box>
              <Tooltip title={emailCopied ? "Copied!" : "Copy email"} placement="top">
                <CopyButton onClick={() => copyToClipboard(demoCredentials.email, 'email')} size="small">
                  {emailCopied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </CopyButton>
              </Tooltip>
            </CredentialField>
            
            <CredentialField>
              <Box>
                <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block' }}>
                  Password
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {demoCredentials.password}
                </Typography>
              </Box>
              <Tooltip title={passwordCopied ? "Copied!" : "Copy password"} placement="top">
                <CopyButton onClick={() => copyToClipboard(demoCredentials.password, 'password')} size="small">
                  {passwordCopied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </CopyButton>
              </Tooltip>
            </CredentialField>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleCloseDemoModal}
              >
                Close
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={useCredentials}
                endIcon={<ChevronRightIcon />}
              >
                Use these credentials
              </Button>
            </Box>
          </ModalPaper>
        </Modal>
      </LoginFormContainer>
      
      {/* Right side - Marketing banner */}
      <LoginBanner>
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 40, 
            right: 40, 
            width: 80, 
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 60, 
            left: 30, 
            width: 120, 
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)'
          }}
        />
        
        <Box sx={{ position: 'relative', maxWidth: 600 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Grow your business with data-driven marketing
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
            Segment your customers, create targeted campaigns, and analyze performance - all in one platform.
          </Typography>
          
          <Box sx={{ mt: 5 }}>
            <FeatureItem>
              <ChevronRightIcon />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Detailed customer segmentation with powerful filters
              </Typography>
            </FeatureItem>
            <FeatureItem>
              <ChevronRightIcon />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Campaign management with performance analytics
              </Typography>
            </FeatureItem>
            <FeatureItem>
              <ChevronRightIcon />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Data-driven insights to optimize your marketing strategy
              </Typography>
            </FeatureItem>
            <FeatureItem>
              <ChevronRightIcon />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Easy data import from multiple sources
              </Typography>
            </FeatureItem>
          </Box>
        </Box>
      </LoginBanner>
    </LoginContainer>
  )
}
