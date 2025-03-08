import { NextApiRequest, NextApiResponse } from 'next';
import { searchDocuments, searchDocumentsWithFilter } from '../../lib/qdrant/search';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple rate limiting implementation
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute
const rateLimitMap = new Map<string, RateLimitEntry>();

// Helper function to get client IP
const getClientIp = (req: NextApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(/, /)[0] 
    : req.socket.remoteAddress || 'unknown';
  return ip || 'unknown';
};

// Check rate limit for a client
const checkRateLimit = (clientIp: string): { allowed: boolean; resetTime?: number } => {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);
  
  if (!entry) {
    // First request from this client
    rateLimitMap.set(clientIp, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }
  
  if (now > entry.resetTime) {
    // Rate limit window has passed, reset counter
    rateLimitMap.set(clientIp, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }
  
  if (entry.count < RATE_LIMIT_MAX_REQUESTS) {
    // Increment counter
    entry.count += 1;
    rateLimitMap.set(clientIp, entry);
    return { allowed: true };
  }
  
  // Rate limit exceeded
  return { 
    allowed: false,
    resetTime: entry.resetTime
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check rate limit
  const clientIp = getClientIp(req);
  const rateLimitCheck = checkRateLimit(clientIp);
  
  if (!rateLimitCheck.allowed) {
    const resetInSeconds = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitCheck.resetTime! / 1000).toString());
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      message: `Too many requests, please try again in ${resetInSeconds} seconds`
    });
  }

  try {
    const { query, collectionName, filter, limit = 5, embeddingModel } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing query' });
    }

    if (!collectionName) {
      return res.status(400).json({ error: 'Missing collectionName' });
    }

    // Log the search request
    console.log(`Searching for: "${query}" in collection "${collectionName}"`);

    let results;
    
    // If filter is provided, use the filtered search
    if (filter) {
      results = await searchDocumentsWithFilter(
        collectionName,
        query,
        filter,
        limit,
        embeddingModel
      );
    } else {
      // Otherwise, use the regular search
      results = await searchDocuments(
        collectionName,
        query,
        limit,
        embeddingModel
      );
    }

    return res.status(200).json({ results });
  } catch (error: any) {
    console.error('Error in search operation:', error);
    
    // Handle API errors gracefully
    if (error.response) {
      const status = error.response.status || 500;
      const message = error.response.data?.message || 'Unknown API error';
      return res.status(status).json({ error: message });
    }
    
    return res.status(500).json({ 
      error: 'Failed to perform search operation',
      message: error.message || 'Unknown error'
    });
  }
} 