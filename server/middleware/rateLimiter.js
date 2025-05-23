// Simple in-memory rate limiter middleware
const requestCounts = {};
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 100; // Limit per IP per window

// Clean up old request counts every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const ip in requestCounts) {
        if (requestCounts[ip].timestamp < now - WINDOW_MS) {
            delete requestCounts[ip];
        }
    }
}, 5 * 60 * 1000);

export const rateLimiter = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    // Initialize or reset if window expired
    if (!requestCounts[ip] || requestCounts[ip].timestamp < now - WINDOW_MS) {
        requestCounts[ip] = {
            count: 1,
            timestamp: now
        };
        next();
        return;
    }
    
    // Increment count if in current window
    requestCounts[ip].count++;
    
    // Check if over limit
    if (requestCounts[ip].count > MAX_REQUESTS) {
        return res.status(429).json({ 
            error: 'Too many requests, please try again later.',
            retryAfter: Math.ceil((requestCounts[ip].timestamp + WINDOW_MS - now) / 1000)
        });
    }
    
    next();
};
