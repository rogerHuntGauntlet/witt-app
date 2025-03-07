import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('=== ENVIRONMENT VARIABLES TEST ===');
console.log('QDRANT_API_KEY:', process.env.QDRANT_API_KEY ? 'Defined (first 10 chars: ' + process.env.QDRANT_API_KEY.substring(0, 10) + '...)' : 'Undefined');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Defined (first 10 chars: ' + process.env.OPENAI_API_KEY.substring(0, 10) + '...)' : 'Undefined'); 