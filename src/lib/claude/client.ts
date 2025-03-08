import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The latest Claude model
export const CLAUDE_MODEL = 'claude-3-7-sonnet-latest';

// Alternative models if needed
export const CLAUDE_MODELS = {
  OPUS: 'claude-3-opus-20240229',
  SONNET: 'claude-3-sonnet-20240229',
  HAIKU: 'claude-3-haiku-20240307'
};

/**
 * Generate an interpretation using Claude with streaming
 * 
 * @param passages - The relevant passages from Wittgenstein's works
 * @param query - The user's query
 * @param frameworks - The interpretative frameworks to use
 * @param onChunk - Optional callback function to process each chunk as it arrives
 * @returns Promise with the generated interpretation text
 */
export async function generateInterpretation(
  passages: any[],
  query: string,
  frameworks: string[] = [],
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    // Create system instructions
    const systemInstructions = `You are a philosopher specializing in Wittgenstein's work and various interpretative frameworks. 
Your task is to interpret the provided passages from Wittgenstein through multiple philosophical frameworks.

For each relevant framework, provide:
1. Key insights from that perspective
2. How this framework illuminates Wittgenstein's thinking
3. Strengths and limitations of this approach for understanding the passage

Focus on these interpretative frameworks:
- Picture Theory
- Language Games
- Therapeutic Reading
- Resolute Reading 
- Pragmatic Reading
- Transaction Theory

Format your response as markdown with clear section headers for each framework.`;

    // Create a prompt with the passages and query
    const passageText = passages.map((p, i) => 
      `PASSAGE ${i + 1}:\n${p.content}\nSource: ${p.metadata?.source || 'Unknown'}\n`
    ).join('\n\n');

    // Combine into the user message
    const userMessage = `Query: ${query}\n\nHere are relevant passages from Wittgenstein's works to interpret:\n\n${passageText}\n\nPlease provide interpretations through multiple frameworks, with special attention to Transaction Theory.`;

    // Make the streaming request to Claude
    const stream = await anthropic.beta.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 64000, // Reduced from 100000 to meet Claude's limit of 64000
      thinking: {
        type: "enabled",
        budget_tokens: 25000 // Reduced from 50000 to be more reasonable
      },
      system: systemInstructions,
      messages: [
        { role: 'user', content: userMessage }
      ],
      temperature: 1.0,
    });

    // Collect the response content
    let fullContent = '';
    
    // Process each message delta as it comes in
    for await (const messageChunk of stream) {
      if (messageChunk.type === 'content_block_delta' && 
          messageChunk.delta.type === 'text_delta') {
        const chunkText = messageChunk.delta.text;
        fullContent += chunkText;
        
        // If a callback was provided, send the chunk
        if (onChunk && chunkText) {
          onChunk(chunkText);
        }
      }
    }

    // Get and process the final message
    const finalMessage = await stream.finalMessage();
    
    if (finalMessage.content.length > 0 && finalMessage.content[0].type === 'text') {
      return finalMessage.content[0].text;
    } else {
      return fullContent || "Error: Empty response";
    }
  } catch (error) {
    console.error('Error generating interpretation with Claude:', error);
    throw error;
  }
}

/**
 * Generate a Transaction Theory perspective specifically
 * 
 * @param interpretation - The interpretations from other frameworks
 * @param query - The user's query
 * @param transactionPassages - Transaction Theory passages from Qdrant
 * @param onChunk - Optional callback function to process each chunk as it arrives
 * @returns Promise with the Transaction Theory perspective
 */
export async function generateTransactionPerspective(
  interpretation: string,
  query: string,
  transactionPassages: any[] = [],
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    const systemInstructions = `You are a philosopher specializing in Transaction Theory, which understands meaning as emerging from interactions rather than fixed representations. 
Your task is to analyze the existing interpretations of Wittgenstein and add a Transaction Theory perspective, using the provided Transaction Theory passages to inform your analysis.`;

    // Create a prompt with the transaction theory passages
    const transactionPassageText = transactionPassages.length > 0 
      ? transactionPassages.map((p, i) => 
        `TRANSACTION THEORY PASSAGE ${i + 1}:\n${p.content}\nSource: ${p.metadata?.source || 'Unknown'}\n`
      ).join('\n\n')
      : "No specific Transaction Theory passages were found.";

    const userMessage = `Here are existing interpretations of Wittgenstein regarding this query: "${query}"\n\n${interpretation}\n\n` +
      `Here are relevant Transaction Theory passages to consider:\n\n${transactionPassageText}\n\n` +
      `Please provide a Transaction Theory perspective that builds on these interpretations and shows how meaning emerges through interactions. ` +
      `Use the Transaction Theory passages to enhance your analysis where relevant.`;

    // Make the streaming request to Claude
    const stream = await anthropic.beta.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 64000, // Reduced from 100000 to meet Claude's limit of 64000
      thinking: {
        type: "enabled",
        budget_tokens: 25000 // Reduced from 50000 to be more reasonable
      },
      system: systemInstructions,
      messages: [
        { role: 'user', content: userMessage }
      ],
      temperature: 1.0, // Must be exactly 1.0 when using thinking
    });

    // Collect the response content
    let fullContent = '';
    
    // Process each message delta as it comes in
    for await (const messageChunk of stream) {
      if (messageChunk.type === 'content_block_delta' && 
          messageChunk.delta.type === 'text_delta') {
        const chunkText = messageChunk.delta.text;
        fullContent += chunkText;
        
        // If a callback was provided, send the chunk
        if (onChunk && chunkText) {
          onChunk(chunkText);
        }
      }
    }

    // Get and process the final message
    const finalMessage = await stream.finalMessage();
    
    if (finalMessage.content.length > 0 && finalMessage.content[0].type === 'text') {
      return finalMessage.content[0].text;
    } else {
      return fullContent || "Error: Empty response";
    }
  } catch (error) {
    console.error('Error Generating Transaction Theory perspective...this make take a minute or two... with Claude:', error);
    throw error;
  }
} 