import runExamples from '../lib/qdrant/example-usage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API keys are set
const qdrantApiKey = process.env.QDRANT_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!qdrantApiKey || qdrantApiKey === 'your_qdrant_api_key_here') {
  console.error('Error: QDRANT_API_KEY is not set in .env file');
  process.exit(1);
}

if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here') {
  console.error('Error: OPENAI_API_KEY is not set in .env file');
  process.exit(1);
}

console.log('Starting Qdrant upload examples...');

// Run the examples
runExamples()
  .then(() => {
    console.log('Examples completed successfully');
  })
  .catch((error) => {
    console.error('Error running examples:', error);
    process.exit(1);
  }); 