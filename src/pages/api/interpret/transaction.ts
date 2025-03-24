import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// We'll initialize the OpenAI client in the handler function to use the correct API key

// Interface for a better structured response
interface InterpretationResponse {
  mainInterpretation: string;
  keyInsights: string[];
  relevantQuotes: Array<{
    text: string;
    explanation: string;
    isWittgenstein?: boolean; // Indicates if the quote is from Wittgenstein or Transaction Theory
  }>;
}

/**
 * Generate transaction theory interpretation
 */
async function generateTransactionalInterpretation(
  query: string,
  wittPassages: any[],
  transPassages: any[],
  apiKey: string
): Promise<{interpretation: InterpretationResponse, wittReferencePassages: any[], transReferencePassages: any[]}> {
  try {
    // Initialize OpenAI client with the provided API key
    const openai = new OpenAI({ apiKey });
    
    // Limit the number of passages to avoid timeouts
    const limitedWittPassages = wittPassages.slice(0, 2); // Only use top 2 Wittgenstein passages
    const limitedTransPassages = transPassages.slice(0, 2); // Only use top 2 Transaction Theory passages

    // Create a more structured prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000, // Increased max tokens for more detailed response
      messages: [
        {
          role: 'system',
          content: `You are an expert on both Wittgenstein and Transaction Theory. Provide a detailed interpretation connecting these two perspectives.
          Structure your response in JSON format with the following keys:
          - mainInterpretation: A concise summary (2-3 paragraphs) showing how Transaction Theory relates to Wittgenstein's ideas
          - keyInsights: 2-3 key connections as bullet points (array of strings)
          - relevantQuotes: 2-3 direct quotes with your explanation of their significance (array of objects with 'text', 'explanation', and 'isWittgenstein' keys)`
        },
        {
          role: 'user',
          content: `Question: ${query}\n\nWittgenstein Passages: ${limitedWittPassages.map(p => `"${p.text.substring(0, 200)}..."`).join('\n\n')}\n\nTransaction Theory Passages: ${limitedTransPassages.map(p => `"${p.text.substring(0, 200)}..."`).join('\n\n')}\n\nProvide a structured Transaction Theory interpretation connecting to these Wittgenstein passages. Highlight key connections and their implications.`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const interpretationText = response.choices[0].message.content || '{}';
    let interpretationJson: InterpretationResponse;
    
    try {
      interpretationJson = JSON.parse(interpretationText) as InterpretationResponse;
      
      // Validate and provide defaults for missing properties
      if (!interpretationJson.mainInterpretation) {
        interpretationJson.mainInterpretation = "No main interpretation generated.";
      }
      
      if (!interpretationJson.keyInsights || !Array.isArray(interpretationJson.keyInsights)) {
        interpretationJson.keyInsights = ["No key insights generated."];
      }
      
      if (!interpretationJson.relevantQuotes || !Array.isArray(interpretationJson.relevantQuotes)) {
        interpretationJson.relevantQuotes = [{
          text: "No relevant quotes identified.",
          explanation: "No explanation provided.",
          isWittgenstein: false
        }];
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      interpretationJson = {
        mainInterpretation: interpretationText,
        keyInsights: ["Could not extract structured insights."],
        relevantQuotes: [{
          text: "No structured quotes available.",
          explanation: "Response format error.",
          isWittgenstein: false
        }]
      };
    }

    return {
      interpretation: interpretationJson,
      wittReferencePassages: limitedWittPassages.map(p => ({
        id: p.id,
        text: p.text,
        source: p.source || p.metadata?.source || 'Unknown source',
        section: p.section || p.metadata?.section || '',
        page: p.page || p.metadata?.page || ''
      })),
      transReferencePassages: limitedTransPassages.map(p => ({
        id: p.id,
        text: p.text,
        source: p.source || p.metadata?.source || 'Unknown source',
        section: p.section || p.metadata?.section || '',
        page: p.page || p.metadata?.page || ''
      }))
    };
  } catch (error: any) {
    console.error('Error generating transactional interpretation:', error);
    throw error;
  }
}

/**
 * API endpoint to generate a Transaction Theory interpretation
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle new interpretation requests
  if (req.method === 'POST') {
    try {
      const { query, wittPassages, transPassages } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Missing query' });
      }

      if (!wittPassages || !Array.isArray(wittPassages) || wittPassages.length === 0) {
        return res.status(400).json({ error: 'Missing Wittgenstein passages' });
      }
      
      if (!transPassages || !Array.isArray(transPassages)) {
        return res.status(400).json({ error: 'Missing Transaction Theory passages' });
      }

      // Get API key from header or environment
      const apiKey = req.headers.authorization?.replace('Bearer ', '') || process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return res.status(401).json({
          error: 'API key required',
          message: 'Please provide your OpenAI API key to use this feature.'
        });
      }

      console.log(`Generating Transaction Theory interpretation`);
      console.log('API key detected (starts with):', apiKey.substring(0, 10) + '...');
      
      // Generate interpretation directly
      const result = await generateTransactionalInterpretation(query, wittPassages, transPassages, apiKey);
      
      // Return the interpretation immediately
      return res.status(200).json({ 
        interpretation: result.interpretation.mainInterpretation,
        structuredInterpretation: result.interpretation,
        wittReferencePassages: result.wittReferencePassages,
        transReferencePassages: result.transReferencePassages,
        framework: 'Transaction Theory'
      });
      
    } catch (error: any) {
      console.error('Error in transaction interpretation endpoint:', error);
      
      return res.status(500).json({
        error: 'Failed to generate Transaction Theory interpretation',
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', 'POST');
  res.status(405).json({ error: 'Method not allowed' });
} 