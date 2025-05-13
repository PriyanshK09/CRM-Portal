"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"


const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}


const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()


const DEMO_USER = {
  uid: "demo-user-id",
  email: "demo@minicrm.com",
  displayName: "Demo User",
  photoURL: null,
  emailVerified: true,
  isDemo: true
}

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider)
  }

  function signOut() {
    if (currentUser?.isDemo) {
      setCurrentUser(null)
      return Promise.resolve()
    }
    return firebaseSignOut(auth)
  }

  
  async function signInAsDemo() {
    try {
      
      setCurrentUser(DEMO_USER)
      return Promise.resolve({ user: DEMO_USER })
    } catch (error) {
      console.error("Error signing in as demo user", error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      
      if (!currentUser?.isDemo) {
        setCurrentUser(user)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [currentUser?.isDemo])

  const value = {
    currentUser,
    signInWithGoogle,
    signOut,
    signInAsDemo,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

