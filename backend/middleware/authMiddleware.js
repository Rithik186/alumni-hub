
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// In-memory cache for validated tokens (avoids DB hit on every request)
const authCache = new Map();
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cleanup stale entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of authCache.entries()) {
        if (now > val.expiry) authCache.delete(key);
    }
}, 10 * 60 * 1000);

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Critical check: Ensure ID exists in token
            if (!decoded || !decoded.id) {
                return res.status(401).json({ message: 'Invalid token payload' });
            }

            // Check in-memory cache first (avoid DB round-trip)
            const cacheKey = String(decoded.id);
            const cached = authCache.get(cacheKey);
            if (cached && Date.now() < cached.expiry) {
                req.user = cached.user;
                return next();
            }

            // Cache miss — hit DB once, then cache for 5 min
            const userCheck = await db.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
            if (userCheck.rows.length === 0) {
                return res.status(401).json({ message: 'User no longer exists. please login again.' });
            }

            const user = userCheck.rows[0];
            authCache.set(cacheKey, { user, expiry: Date.now() + AUTH_CACHE_TTL });


            req.user = user; 
            next();
        } catch (error) {
            console.error('Auth Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
}

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

export const alumniOnly = (req, res, next) => {
    if (req.user && req.user.role === 'alumni') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as alumni' });
    }
};

export const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as student' });
    }
};
