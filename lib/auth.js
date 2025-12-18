// lib/auth.js - Authentication utilities
export const USERS = {
    admin: {
        username: 'shoplc_admin_1',
        password: 'Shoplc1@123',
        role: 'admin'
    },
    admin: {
        username: 'shoplc_admin_2',
        password: 'Shoplc2@123',
        role: 'admin'
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
