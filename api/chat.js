const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 8000;
const VALID_ROLES = new Set(['user', 'assistant', 'system']);

const LOCAL_DEV_ORIGINS = new Set(['http://localhost:5173', 'http://localhost:4173']);

// This endpoint has no auth and spends a shared Groq API budget on every
// call, so anything not clearly same-origin (or an explicitly configured
// extra origin) is rejected before it can reach Groq.
function isAllowedOrigin(origin, req) {
    if (!origin) return false;
    if (LOCAL_DEV_ORIGINS.has(origin)) return true;
    if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) return true;
    const host = req.headers.host;
    return Boolean(host) && (origin === `https://${host}` || origin === `http://${host}`);
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
// In-memory only: resets on cold start and isn't shared across concurrent
// serverless instances, so this is a best-effort throttle for a low-traffic
// portfolio rather than a hard guarantee. A persistent store (Upstash/Vercel
// KV) would be needed for a real guarantee under meaningful traffic.
const requestLog = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const recent = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    requestLog.set(ip, recent);
    return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function validateMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return 'messages must be a non-empty array';
    }
    if (messages.length > MAX_MESSAGES) {
        return `messages exceeds the ${MAX_MESSAGES}-message limit`;
    }
    let totalLength = 0;
    for (const message of messages) {
        if (!message || typeof message !== 'object') {
            return 'each message must be an object';
        }
        if (!VALID_ROLES.has(message.role)) {
            return 'each message must have a valid role';
        }
        if (typeof message.content !== 'string' || message.content.length === 0) {
            return 'each message must have non-empty string content';
        }
        if (message.content.length > MAX_MESSAGE_LENGTH) {
            return `a message exceeds the ${MAX_MESSAGE_LENGTH}-character limit`;
        }
        totalLength += message.content.length;
    }
    if (totalLength > MAX_TOTAL_LENGTH) {
        return `combined message content exceeds the ${MAX_TOTAL_LENGTH}-character limit`;
    }
    return null;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isAllowedOrigin(req.headers.origin, req)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
        .split(',')[0]
        .trim();
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Too many requests, please slow down' });
    }

    const { messages } = req.body ?? {};
    const validationError = validateMessages(messages);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages,
                model: 'llama-3.3-70b-versatile'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch from Groq');
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Groq API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
