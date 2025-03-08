import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Custom API key handling
    const apiKey = req.headers.authorization?.split(' ')[1];
    const openaiClient = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    // Prompt for improving the question
    const prompt = `You are an expert in Wittgenstein's philosophy. A user has asked the following question:

"${question}"

Please improve this question to make it more precise and likely to generate insightful responses about Wittgenstein's philosophy. Consider:
1. Philosophical accuracy and terminology
2. Specificity and focus
3. Connection to key themes in Wittgenstein's work
4. Potential for meaningful philosophical discussion

Provide your response in the following JSON format:
{
  "improvedQuestion": "The improved version of the question",
  "explanation": "A brief explanation of why this version is better"
}`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in Wittgenstein's philosophy, helping users formulate better questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsedResponse = JSON.parse(response);
      return res.status(200).json(parsedResponse);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return res.status(500).json({ 
        message: 'Error parsing the improved question',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Error in form-question API:', error);
    return res.status(500).json({ 
      message: 'Error improving the question',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 