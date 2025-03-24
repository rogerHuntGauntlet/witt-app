import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client with API key from request header or environment
const getOpenAIClient = (req: NextApiRequest) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '') || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Please provide your own API key or try again later when the default key is available.');
  }
  
  return new OpenAI({ apiKey });
};

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
  framework: string,
  openaiClient: OpenAI
): Promise<{interpretation: InterpretationResponse, referencePassages: any[]}> {
  try {
    // Limit the number of passages to avoid timeouts
    const limitedPassages = passages.slice(0, 3); // Only use top 3 passages

    // Create a more structured prompt
    const response = await openaiClient.chat.completions.create({
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const openaiClient = getOpenAIClient(req);
    
    const { query, passages, framework } = req.body;
    
    if (!query || !passages || !framework) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const result = await generateFrameworkInterpretation(query, passages, framework, openaiClient);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle specific OpenAI API errors
    if (error.message?.toLowerCase().includes('api key')) {
      return res.status(401).json({ 
        message: 'Invalid or missing API key. Please provide a valid OpenAI API key.'
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'An error occurred while processing your request'
    });
  }
} 