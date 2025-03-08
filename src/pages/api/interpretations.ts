import { NextApiRequest, NextApiResponse } from 'next';
import { searchDocuments, searchDocumentsWithFilter } from '../../lib/qdrant/search';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Available interpretative frameworks
const frameworks = [
  { id: 'early', name: 'Early Wittgenstein' },
  { id: 'later', name: 'Later Wittgenstein' },
  { id: 'ordinary', name: 'Ordinary Language' },
  { id: 'therapeutic', name: 'Therapeutic Reading' },
  { id: 'resolute', name: 'Resolute Reading' },
  { id: 'metaphysical', name: 'Metaphysical Reading' },
  { id: 'pyrrhonian', name: 'Pyrrhonian Reading' },
  { id: 'transcendental', name: 'Transcendental Reading' },
  { id: 'pragmatic', name: 'Pragmatic Reading' }
];

// At the top of the file, add these type definitions
interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
}

// For TypeScript
interface Citation {
  id: string;
  text: string;
  source: string;
  section?: string;
  page?: string;
}

interface Framework {
  id: string;
  name: string;
  description: string;
  interpretation?: string;
  confidence?: number;
}

/**
 * Generate interpretations using OpenAI's API
 */
async function generateInterpretations(
  query: string,
  wittPassages: Citation[],
  frameworkName: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are a Wittgenstein expert who specializes in interpreting his works through different philosophical frameworks. 
          
Please provide an interpretation of these passages from the "${frameworkName}" perspective, structured as follows:

1. KEY INSIGHTS: 
Identify 2-3 key insights from the provided passages, quoting small portions directly when relevant.

2. INTERPRETATION:
Provide a clear interpretation of these passages from the "${frameworkName}" perspective.
Don't just summarize the passages; offer a substantive philosophical analysis.
Make sure your interpretation directly connects to the specific passages you quoted.

3. IMPLICATIONS: 
Briefly discuss 1-2 broader implications of this interpretation for understanding Wittgenstein or philosophical problems in general.`
        },
        {
          role: 'user',
          content: `Question: ${query}\n\nPassages from Wittgenstein:\n\n${wittPassages.map(p => `"${p.text}"\n- ${p.source} ${p.section || ''} ${p.page || ''}`).join('\n\n')}`
        }
      ],
      max_tokens: 1200
    });

    return response.choices[0].message.content || 'No interpretation generated.';
  } catch (error) {
    console.error('Error generating interpretation:', error);
    return 'Error generating interpretation. Please try again later.';
  }
}

/**
 * Generate transaction theory interpretation
 */
async function generateTransactionalInterpretation(
  query: string,
  wittPassages: Citation[],
  transPassages: Citation[]
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are a philosophical expert who specializes in both Wittgenstein and Transaction Theory.
          
Please provide an interpretation that connects Wittgenstein's ideas to Transaction Theory, structured as follows:

1. KEY CONNECTIONS: 
Identify 2-3 key connections between the Wittgenstein passages and Transaction Theory concepts.

2. TRANSACTIONAL INTERPRETATION:
Provide a clear interpretation of Wittgenstein's ideas through the lens of Transaction Theory.
Don't just summarize the passages; offer a substantive philosophical analysis.
Make sure your interpretation directly connects to the specific passages you quoted.

3. IMPLICATIONS: 
Discuss 2-3 implications or applications of this transactional interpretation.`
        },
        {
          role: 'user',
          content: `Question: ${query}\n\nPassages from Wittgenstein:\n\n${wittPassages.map(p => `"${p.text}"\n- ${p.source} ${p.section || ''} ${p.page || ''}`).join('\n\n')}\n\nTransaction Theory Passages:\n\n${transPassages.map(p => `"${p.text}"\n- ${p.source}`).join('\n\n')}`
        }
      ],
      max_tokens: 1200
    });

    return response.choices[0].message.content || 'No interpretation generated.';
  } catch (error) {
    console.error('Error generating transactional interpretation:', error);
    return 'Error generating interpretation. Please try again later.';
  }
}

/**
 * Main API handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set extended timeout for API
  res.setHeader('Connection', 'keep-alive');
  
  // Handle the request based on method
  if (req.method === 'POST') {
    try {
      const { query, wittPassages, transPassages, frameworks } = req.body;

      if (!query || !wittPassages || !Array.isArray(wittPassages) || wittPassages.length === 0) {
        return res.status(400).json({ error: 'Missing query or Wittgenstein passages' });
      }

      console.log(`Processing interpretation request for: "${query}"`);
      console.log(`Number of frameworks to process: ${frameworks.length}`);

      // Set a processing step header
      res.setHeader('X-Processing-Step', 'generating-all-interpretations');
      
      // Generate all interpretations in parallel
      console.log('Generating all interpretations in one call...');
      
      // 1. First, generate the standard framework interpretations
      const frameworksPromises = frameworks.map((framework: Framework) => 
        generateInterpretations(query, wittPassages, framework.name)
      );
      
      // 2. Also generate the transaction theory interpretation if we have passages
      let transactionPromise = null;
      if (transPassages && transPassages.length > 0) {
        transactionPromise = generateTransactionalInterpretation(
          query, 
          wittPassages,
          transPassages
        );
      }
      
      // Wait for all interpretations to complete
      const interpretationsResults = await Promise.all(frameworksPromises);
      
      // Wait for transaction theory interpretation if applicable
      let transactionalInterpretation = null;
      if (transactionPromise) {
        transactionalInterpretation = await transactionPromise;
      }
      
      // Map the results to framework objects
      const frameworkResults = frameworks.map((framework: Framework, index: number) => ({
        ...framework,
        interpretation: interpretationsResults[index],
        confidence: 0.85
      }));
      
      // If we have a transactional interpretation, add it to the frameworks
      if (transactionalInterpretation) {
        const transactionFramework = {
          id: 'transaction-theory',
          name: 'Transaction Theory',
          description: 'Interpretation based on Transaction Theory',
          interpretation: transactionalInterpretation,
          confidence: 0.85
        };
        frameworkResults.push(transactionFramework);
      }
      
      // Create citations from the search results
      const citations = [
        ...wittPassages.map(passage => ({
          id: passage.id,
          text: passage.text,
          source: passage.source,
          section: passage.section || undefined,
          page: passage.page || undefined
        })),
        ...(transPassages || []).map((passage: Citation) => ({
          id: `trans-${passage.id}`,
          text: passage.text,
          source: passage.source
        }))
      ];
      
      // Log success
      console.log(`Successfully generated ${frameworkResults.length} interpretations`);
      
      // Return the interpretations
      return res.status(200).json({
        frameworks: frameworkResults,
        citations: citations,
      });
      
    } catch (error: any) {
      console.error('Error generating interpretations:', error);
      
      return res.status(500).json({
        error: 'Failed to generate interpretations',
        message: error.message || 'An unexpected error occurred'
      });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
  }
} 