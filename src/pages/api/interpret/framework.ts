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
    // Map framework IDs to their proper names
    const frameworkNameMap: { [key: string]: string } = {
      'picture-theory': 'Early Wittgenstein (Picture Theory)',
      'language-games': 'Later Wittgenstein (Language Games)',
      'therapeutic': 'Therapeutic Reading',
      'resolute': 'Resolute Reading',
      'pragmatic': 'Pragmatic Reading',
      'contextualist': 'Contextualist Reading',
      'naturalistic': 'Naturalistic Reading',
      'post-analytic': 'Post-Analytic Reading',
      'ethical': 'Ethical Reading',
      'metaphysical': 'Metaphysical Reading',
      'pyrrhonian': 'Pyrrhonian Reading',
      'transcendental': 'Transcendental Reading'
    };

    // Get the proper framework name
    const frameworkName = frameworkNameMap[framework.toLowerCase()] || framework;

    // Limit the number of passages to avoid timeouts
    const limitedPassages = passages.slice(0, 3); // Only use top 3 passages

    // Create a more structured prompt
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `You are a Wittgenstein expert. Provide a detailed interpretation from the ${frameworkName} perspective. 
          Structure your response in JSON format with the following keys:
          - mainInterpretation: A concise summary (2-3 paragraphs)
          - keyInsights: 2-3 key insights as bullet points (array of strings)
          - relevantQuotes: 1-2 direct quotes from the passages with your explanation of their significance (array of objects with 'text' and 'explanation' keys)`
        },
        {
          role: 'user',
          content: `Question: ${query}\n\nPassages: ${limitedPassages.map(p => `"${p.text.substring(0, 250)}..."`).join('\n\n')}\n\nProvide a structured interpretation from the ${frameworkName} perspective. Focus on key insights and their implications.`
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
    // Check for API key first
    const apiKey = req.headers.authorization?.replace('Bearer ', '') || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(401).json({
        message: 'API key required',
        code: 'no_api_key',
        details: 'Please provide your OpenAI API key to use this feature.'
      });
    }

    // Initialize OpenAI client
    const openaiClient = new OpenAI({ apiKey });
    
    const { query, passages, framework } = req.body;
    
    if (!query || !passages || !framework) {
      return res.status(400).json({ 
        message: 'Missing required parameters',
        code: 'missing_params'
      });
    }

    try {
      const result = await generateFrameworkInterpretation(query, passages, framework, openaiClient);
      res.status(200).json(result);
    } catch (interpretError: any) {
      // Handle OpenAI API specific errors
      if (interpretError.response?.status === 401 || 
          interpretError.message?.toLowerCase().includes('api key')) {
        return res.status(401).json({
          message: 'Invalid API key',
          code: 'invalid_api_key',
          details: 'The provided API key was rejected by OpenAI.'
        });
      }
      
      // Handle rate limits
      if (interpretError.response?.status === 429 || 
          interpretError.message?.toLowerCase().includes('rate limit')) {
        return res.status(429).json({
          message: 'Rate limit exceeded',
          code: 'rate_limit',
          details: 'Too many requests. Please try again later.'
        });
      }
      
      throw interpretError; // Re-throw for general error handling
    }
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Return appropriate error response
    if (error.response?.status === 401 || 
        error.message?.toLowerCase().includes('api key')) {
      return res.status(401).json({
        message: 'API key error',
        code: 'api_key_error',
        details: 'Please check your API key or provide a valid OpenAI API key.'
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred.'
    });
  }
} 