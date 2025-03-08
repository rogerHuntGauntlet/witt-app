import { NextApiRequest, NextApiResponse } from 'next';
import { searchDocumentsWithFilter } from '../../../lib/qdrant/search';

// Interface for search results
interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
}

/**
 * API endpoint to search for Transaction Theory passages
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set headers for CORS and caching
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, collectionName = 'second-brain-docs' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    console.log(`Searching for Transaction Theory passages related to: "${query}"`);
    
    // Create filter for Transaction Theory writings
    const transactionFilter = {
      should: [
        {
          key: 'metadata.namespace',
          match: {
            value: 'transactional'
          }
        },
        {
          key: 'metadata.tags',
          match: {
            any: ['transaction-theory', 'transaction', 'transactions']
          }
        }
      ]
    };
    
    // Search for passages
    const results = await searchDocumentsWithFilter(
      collectionName,
      query,
      transactionFilter,
      3 // Get top 3 most relevant passages
    );
    
    // Format the results with citation information
    const passages = results.map((result: SearchResult, idx: number) => ({
      id: `trans-${idx}`,
      text: result.content,
      source: result.metadata?.source || 'Transaction Theory',
      section: result.metadata?.section || '',
      page: result.metadata?.page || undefined,
      score: result.score
    }));
    
    // Return the formatted passages (even if empty)
    return res.status(200).json({ 
      passages,
      query,
      count: passages.length,
      timestamp: new Date()
    });
    
  } catch (error: any) {
    console.error('Error searching Transaction Theory passages:', error);
    
    return res.status(500).json({ 
      error: 'Failed to search Transaction Theory passages',
      message: error.message || 'Unknown error'
    });
  }
} 