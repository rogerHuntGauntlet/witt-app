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
 * API endpoint to search for Wittgenstein passages
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

    console.log(`Searching for Wittgenstein passages related to: "${query}"`);
    
    // Create filter for Wittgenstein writings
    const wittFilter = {
      should: [
        {
          key: 'metadata.namespace',
          match: {
            value: 'witt-writings'
          }
        },
        {
          key: 'metadata.tags',
          match: {
            any: ['wittgenstein', 'philosophy']
          }
        }
      ]
    };
    
    // Search for passages
    const results = await searchDocumentsWithFilter(
      collectionName,
      query,
      wittFilter,
      5 // Get top 5 most relevant passages
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'No relevant Wittgenstein passages found',
        message: 'Try a different query or check if Wittgenstein writings are properly indexed.'
      });
    }
    
    // Format the results with citation information
    const passages = results.map((result: SearchResult, idx: number) => {
      // Try to extract section information from metadata or content
      let section = result.metadata?.section || '';
      let page = result.metadata?.page || '';
      
      // If there's a book/section pattern in the content or source, try to extract it
      const sourceInfo = result.metadata?.source || 'Wittgenstein\'s Works';
      
      // Extract section numbers or names if present in the pattern "Section X.Y" or similar
      const sectionMatch = sourceInfo.match(/§\s*(\d+(\.\d+)*)/i) || 
                           sourceInfo.match(/section\s*(\d+(\.\d+)*)/i) ||
                           result.content.match(/§\s*(\d+(\.\d+)*)/i);
      
      if (sectionMatch && !section) {
        section = `§${sectionMatch[1]}`;
      }
      
      // Clean up the text to remove any unwanted markers or numbering
      const cleanedText = result.content
        .replace(/^\d+\.\s+/, '') // Remove leading numbers
        .trim();
        
      return {
        id: `witt-${idx}`,
        text: cleanedText,
        source: sourceInfo,
        section: section,
        page: page || undefined,
        score: result.score
      };
    });
    
    // Return the formatted passages
    return res.status(200).json({ 
      passages,
      query,
      count: passages.length,
      timestamp: new Date()
    });
    
  } catch (error: any) {
    console.error('Error searching Wittgenstein passages:', error);
    
    return res.status(500).json({ 
      error: 'Failed to search Wittgenstein passages',
      message: error.message || 'Unknown error'
    });
  }
} 