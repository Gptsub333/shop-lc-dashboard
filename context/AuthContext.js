"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { validateCredentials, createSession, isSessionValid } from '@/lib/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Check for existing session in localStorage
        const sessionData = localStorage.getItem('session')
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData)
                if (isSessionValid(session)) {
                    setUser(session.user)
                } else {
                    localStorage.removeItem('session')
                }
            } catch (e) {
                localStorage.removeItem('session')
            }
        }
        setLoading(false)
    }, [])

    const login = (username, password) => {
        const validUser = validateCredentials(username, password)
        if (!validUser) {
            return { success: false, error: 'Invalid credentials' }
        }

        const session = createSession(validUser)
        localStorage.setItem('session', JSON.stringify(session))
        setUser(validUser)
        return { success: true }
    }

    const logout = () => {
        localStorage.removeItem('session')
        setUser(null)
        router.push('/login')
    }

    const isAuthenticated = () => {
        if (!user) return false
        const sessionData = localStorage.getItem('session')
        if (!sessionData) return false

        try {
            const session = JSON.parse(sessionData)
            return isSessionValid(session)
        } catch (e) {
            return false
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
