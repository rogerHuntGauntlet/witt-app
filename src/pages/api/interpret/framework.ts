import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Interface for a better structured response
interface InterpretationResponse {
  mainInterpretation: string;
  keyInsights: string[];
  relevantQuotes: Array<{
    text: string;
    explanation: string;
  }>;
}

/**
 * Generate a framework-specific interpretation using OpenAI
 */
async function generateFrameworkInterpretation(
  query: string,
  passages: any[],
  framework: string
): Promise<{interpretation: InterpretationResponse, referencePassages: any[]}> {
  try {
    // Limit the number of passages to avoid timeouts
    const limitedPassages = passages.slice(0, 3); // Only use top 3 passages

    // Create a more structured prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 1000, // Increased max tokens for more detailed response
      messages: [
        {
          role: 'system',
          content: `You are a Wittgenstein expert. Provide a detailed interpretation from the ${framework} perspective. 
          Structure your response in JSON format with the following keys:
          - mainInterpretation: A concise summary (2-3 paragraphs)
          - keyInsights: 2-3 key insights as bullet points (array of strings)
          - relevantQuotes: 1-2 direct quotes from the passages with your explanation of their significance (array of objects with 'text' and 'explanation' keys)`
        },
        {
          role: 'user',
          content: `Question: ${query}\n\nPassages: ${limitedPassages.map(p => `"${p.text.substring(0, 250)}..."`).join('\n\n')}\n\nProvide a structured interpretation from the ${framework} perspective. Focus on key insights and their implications.`
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
          explanation: "No explanation provided."
        }];
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      interpretationJson = {
        mainInterpretation: interpretationText,
        keyInsights: ["Could not extract structured insights."],
        relevantQuotes: [{
          text: "No structured quotes available.",
          explanation: "Response format error."
        }]
      };
    }

    return {
      interpretation: interpretationJson,
      referencePassages: limitedPassages.map(p => ({
        id: p.id,
        text: p.text,
        source: p.source || p.metadata?.source || 'Unknown source',
        section: p.section || p.metadata?.section || '',
        page: p.page || p.metadata?.page || ''
      }))
    };
  } catch (error: any) {
    console.error('Error generating framework interpretation:', error);
    throw error;
  }
}

/**
 * API endpoint to generate a framework-specific interpretation
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle new interpretation requests
  if (req.method === 'POST') {
    try {
      const { query, passages, framework } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Missing query' });
      }

      if (!passages || !Array.isArray(passages) || passages.length === 0) {
        return res.status(400).json({ error: 'Missing passages' });
      }

      if (!framework) {
        return res.status(400).json({ error: 'Missing framework' });
      }

      console.log(`Generating interpretation for ${framework} framework`);
      
      // Generate interpretation directly
      const result = await generateFrameworkInterpretation(query, passages, framework);
      
      // Return the interpretation immediately
      return res.status(200).json({ 
        interpretation: result.interpretation.mainInterpretation,
        structuredInterpretation: result.interpretation,
        referencePassages: result.referencePassages,
        framework
      });
      
    } catch (error: any) {
      console.error('Error in interpretation endpoint:', error);
      
      return res.status(500).json({
        error: 'Failed to generate interpretation',
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', 'POST');
  res.status(405).json({ error: 'Method not allowed' });
} 