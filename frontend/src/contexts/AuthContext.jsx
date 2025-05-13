"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/api"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function login(email, password) {
    try {
      const userData = await authService.login(email, password)
      setCurrentUser(userData)
      return userData
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  async function loginWithGoogle(googleData) {
    try {
      const userData = await authService.googleLogin(googleData)
      setCurrentUser(userData)
      return userData
    } catch (error) {
      console.error("Google login error:", error)
      throw error
    }
  }

  async function register(userData) {
    try {
      const newUser = await authService.register(userData)
      return newUser
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  function logout() {
    authService.logout()
    setCurrentUser(null)
    // Clear any Google auth session
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.disableAutoSelect()
        // Optionally revoke the Google token
        // window.google.accounts.id.revoke()
      } catch (err) {
        console.error("Error while logging out from Google:", err)
      }
    }
    return Promise.resolve()
  }
  
  async function updateProfile(userData) {
    try {
      const updatedUser = await authService.updateProfile(userData)
      setCurrentUser({
        ...currentUser,
        ...updatedUser
      })
      return updatedUser
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  // Handle demo user for testing purposes
  async function loginAsDemo() {
    try {
      const demoUser = {
        _id: "demo-user-id",
        name: "Demo User",
        email: "demo@crm-portal.com",
        role: "admin",
        token: "demo-token",
        isDemo: true
      }
      localStorage.setItem('token', demoUser.token)
      localStorage.setItem('user', JSON.stringify(demoUser))
      setCurrentUser(demoUser)
      return demoUser
    } catch (error) {
      console.error("Error signing in as demo user", error)
      throw error
    }
  }

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    loginAsDemo,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

