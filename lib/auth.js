// lib/auth.js - Authentication utilities
export const USERS = {
    admin: {
        username: 'admin',
        password: 'admin123',
        role: 'admin'
    },
    supervisor: {
        username: 'supervisor',
        password: 'supervisor123',
        role: 'supervisor'
    }
}

export const SESSION_DURATION = 60 * 60 * 1000 // 30 minutes in milliseconds

export function validateCredentials(username, password) {
    const user = USERS[username]
    if (!user || user.password !== password) {
        return null
    }
    return {
        username: user.username,
        role: user.role
    }
}

export function createSession(user) {
    const session = {
        user,
        expiresAt: Date.now() + SESSION_DURATION
    }
    return session
}

export function isSessionValid(session) {
    if (!session || !session.expiresAt) return false
    return Date.now() < session.expiresAt
}
