import runSearchExamples from '../lib/qdrant/search-example';
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

console.log('Starting Qdrant search examples...');

// Run the search examples
runSearchExamples()
  .then(() => {
    console.log('Search examples completed successfully');
  })
  .catch((error) => {
    console.error('Error running search examples:', error);
    process.exit(1);
  }); 