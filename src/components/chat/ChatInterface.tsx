import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatInterface.module.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';

// Types for our chat messages and interpretation frameworks
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  interpretation?: string;
  confidence?: number;
  longDescription?: string;
  keyAuthors?: Author[];
  keyPublications?: Publication[];
  isLoading?: boolean;
  error?: boolean;
  keyInsights?: string[];
  relevantQuotes?: RelevantQuote[];
  referencePassages?: Citation[];
}

// New interfaces for authors and publications
export interface Author {
  name: string;
  description: string;
  notable_works?: string[];
}

export interface Publication {
  title: string;
  author: string;
  year: string;
  description: string;
}

export interface Interpretation {
  question: string;
  frameworks: Framework[];
  citations: Citation[];
  timestamp: Date;
}

export interface Citation {
  id: string;
  text: string;
  source: string;
  section?: string;
  page?: string;
}

export interface RelevantQuote {
  text: string;
  explanation: string;
  isWittgenstein?: boolean; // For Transaction Theory, indicates if the quote is from Wittgenstein or Transaction Theory
}

// List of available interpretative frameworks with enhanced information
const FRAMEWORKS: Omit<Framework, 'interpretation' | 'confidence'>[] = [
  {
    id: 'early',
    name: 'Early Wittgenstein',
    description: 'Logical atomism from the Tractatus period',
    longDescription: 'The Early Wittgenstein is characterized by his work in the Tractatus Logico-Philosophicus, where he develops a picture theory of language and meaning. In this view, language has meaning by picturing states of affairs in the world, and philosophical problems arise from misunderstanding the logic of our language.',
    keyAuthors: [
      {
        name: 'Elizabeth Anscombe',
        description: 'Anscombe was an influential philosopher and student of Wittgenstein who provided one of the first comprehensive interpretations of the Tractatus.',
        notable_works: ['An Introduction to Wittgenstein\'s Tractatus (1959)']
      },
      {
        name: 'David Pears',
        description: 'Pears was a leading interpreter of Wittgenstein\'s early philosophy, focusing on the logical structure of the Tractatus.',
        notable_works: ['The False Prison: A Study of the Development of Wittgenstein\'s Philosophy (1987)']
      }
    ],
    keyPublications: [
      {
        title: 'Tractatus Logico-Philosophicus',
        author: 'Ludwig Wittgenstein',
        year: '1921',
        description: 'Wittgenstein\'s first major work, presenting a logical-atomistic picture of language and reality.'
      },
      {
        title: 'An Introduction to Wittgenstein\'s Tractatus',
        author: 'Elizabeth Anscombe',
        year: '1959',
        description: 'A classic commentary on the Tractatus that helped establish its significance in analytic philosophy.'
      }
    ]
  },
  {
    id: 'later',
    name: 'Later Wittgenstein',
    description: 'Language games and forms of life from Philosophical Investigations',
    longDescription: 'The Later Wittgenstein, primarily represented in the Philosophical Investigations, rejects many of his earlier views and develops concepts like "language games," "family resemblance," and "forms of life." He views language as a diverse set of practices embedded in human activities rather than a logical picture of reality.',
    keyAuthors: [
      {
        name: 'Peter Hacker',
        description: 'Hacker is among the most influential commentators on Wittgenstein\'s later philosophy, known for his detailed analytical commentary.',
        notable_works: ['Insight and Illusion (1972)', 'Wittgenstein: Understanding and Meaning (1980)']
      },
      {
        name: 'Gordon Baker',
        description: 'Baker collaborated with Hacker on extensive commentaries on Philosophical Investigations before developing his own therapeutic reading of Wittgenstein.',
        notable_works: ['Wittgenstein: Understanding and Meaning (1980)', 'Wittgenstein\'s Method: Neglected Aspects (2004)']
      }
    ],
    keyPublications: [
      {
        title: 'Philosophical Investigations',
        author: 'Ludwig Wittgenstein',
        year: '1953',
        description: 'Wittgenstein\'s second major work, published posthumously, presenting his mature philosophy of language.'
      },
      {
        title: 'Wittgenstein: Understanding and Meaning',
        author: 'Gordon Baker and Peter Hacker',
        year: '1980',
        description: 'First volume of the comprehensive analytical commentary on the Philosophical Investigations.'
      }
    ]
  },
  {
    id: 'ordinary',
    name: 'Ordinary Language',
    description: 'Focus on everyday language use and dissolution of philosophical problems',
    longDescription: 'The Ordinary Language reading interprets Wittgenstein as showing how philosophical problems arise when we misuse everyday language or remove it from its practical contexts. This approach emphasizes returning words from their metaphysical to their everyday use to dissolve philosophical problems.',
    keyAuthors: [
      {
        name: 'John Austin',
        description: 'Though not strictly a Wittgenstein scholar, Austin developed ordinary language philosophy in ways influenced by and parallel to Wittgenstein\'s later work.',
        notable_works: ['How to Do Things With Words (1962)']
      },
      {
        name: 'Oswald Hanfling',
        description: 'Hanfling applied Wittgenstein\'s ordinary language approach to various philosophical problems.',
        notable_works: ['Wittgenstein\'s Later Philosophy (1989)']
      }
    ],
    keyPublications: [
      {
        title: 'The Blue and Brown Books',
        author: 'Ludwig Wittgenstein',
        year: '1958',
        description: 'Preliminary studies for the Philosophical Investigations, showing Wittgenstein\'s transition to ordinary language philosophy.'
      },
      {
        title: 'Philosophical Troubles: Collected Papers, Volume 1',
        author: 'Saul Kripke',
        year: '2011',
        description: 'Contains influential papers on Wittgenstein\'s approach to rule-following and meaning.'
      }
    ]
  },
  {
    id: 'therapeutic',
    name: 'Therapeutic Reading',
    description: 'Philosophy as therapy for conceptual confusions',
    longDescription: 'The Therapeutic Reading sees Wittgenstein\'s work as primarily therapeutic rather than theoretical. It emphasizes his goal of treating philosophical problems like illnesses that need to be cured through clarity about language use. This reading is influenced by Wittgenstein\'s remark that "there is not a philosophical method, though there are indeed methods, like different therapies."',
    keyAuthors: [
      {
        name: 'Stanley Cavell',
        description: 'Cavell developed a distinctive reading of Wittgenstein that emphasizes the therapeutic and ethical dimensions of his philosophy.',
        notable_works: ['The Claim of Reason (1979)', 'Must We Mean What We Say? (1969)']
      },
      {
        name: 'Gordon Baker',
        description: 'In his later work, Baker developed an influential therapeutic reading of Wittgenstein that departed from his earlier analytical approach.',
        notable_works: ['Wittgenstein\'s Method: Neglected Aspects (2004)']
      }
    ],
    keyPublications: [
      {
        title: 'The Claim of Reason',
        author: 'Stanley Cavell',
        year: '1979',
        description: 'A landmark work applying Wittgenstein\'s philosophy to skepticism, ethics, and aesthetics.'
      },
      {
        title: 'Wittgenstein\'s Method: Neglected Aspects',
        author: 'Gordon Baker',
        year: '2004',
        description: 'A collection of essays presenting Baker\'s therapeutic reading of Wittgenstein\'s philosophy.'
      }
    ]
  },
  {
    id: 'resolute',
    name: 'Resolute Reading',
    description: 'Emphasis on nonsense and the ladder metaphor',
    longDescription: 'The Resolute Reading, also known as the "New Wittgenstein," argues that both early and late Wittgenstein aimed to show that philosophical statements are not false but nonsensical. It takes seriously Wittgenstein\'s ladder metaphor, suggesting we must throw away the ladder of the Tractatus after climbing it, recognizing its propositions as nonsense.',
    keyAuthors: [
      {
        name: 'Cora Diamond',
        description: 'Diamond is a key proponent of the resolute reading, arguing that Wittgenstein intended readers to recognize the Tractatus itself as nonsensical.',
        notable_works: ['The Realistic Spirit (1991)', 'Reading Wittgenstein with Anscombe, Going On to Ethics (2019)']
      },
      {
        name: 'James Conant',
        description: 'Conant, often working with Diamond, developed the resolute reading approach to both early and later Wittgenstein.',
        notable_works: ['The Method of the Tractatus (2000)', 'Elucidation and Nonsense in Frege and Early Wittgenstein (2000)']
      }
    ],
    keyPublications: [
      {
        title: 'The New Wittgenstein',
        author: 'Alice Crary and Rupert Read (eds.)',
        year: '2000',
        description: 'A collection of essays presenting the resolute reading approach to Wittgenstein\'s philosophy.'
      },
      {
        title: 'The Realistic Spirit',
        author: 'Cora Diamond',
        year: '1991',
        description: 'Essays developing a resolute reading of Wittgenstein that emphasizes the ethical dimensions of his work.'
      }
    ]
  },
  {
    id: 'metaphysical',
    name: 'Metaphysical Reading',
    description: 'Extracting positive philosophical theses from Wittgenstein\'s work',
    longDescription: 'The Metaphysical Reading interprets Wittgenstein as offering positive philosophical theses about the nature of reality, language, and mind, despite his disavowal of theory-building. This approach is more common in interpretations of the Tractatus but can also be applied to later works like Philosophical Investigations.',
    keyAuthors: [
      {
        name: 'Peter Hacker',
        description: 'While not strictly advocating a metaphysical reading, Hacker\'s analytical approach extracts systematic philosophical positions from Wittgenstein\'s work.',
        notable_works: ['Insight and Illusion (1972)', 'Wittgenstein: Meaning and Mind (1990)']
      },
      {
        name: 'David Pears',
        description: 'Pears developed interpretations of Wittgenstein that emphasize the philosophical content and implications of his work.',
        notable_works: ['The False Prison (1987-1988)']
      }
    ],
    keyPublications: [
      {
        title: 'The False Prison: A Study of the Development of Wittgenstein\'s Philosophy',
        author: 'David Pears',
        year: '1987-1988',
        description: 'A two-volume work examining the development of Wittgenstein\'s thought with attention to its philosophical content.'
      },
      {
        title: 'Wittgenstein: Rules, Grammar and Necessity',
        author: 'Gordon Baker and Peter Hacker',
        year: '1985',
        description: 'Second volume of the analytical commentary that systematizes Wittgenstein\'s views on rules and grammar.'
      }
    ]
  },
  {
    id: 'pyrrhonian',
    name: 'Pyrrhonian Reading',
    description: 'Wittgenstein as a skeptic in the ancient tradition',
    longDescription: 'The Pyrrhonian Reading interprets Wittgenstein as a philosophical skeptic in the tradition of ancient Pyrrhonism. This view sees him as suspending judgment about philosophical problems rather than solving them, aiming for a kind of peace of mind (ataraxia) that comes from recognizing the limits of philosophical reasoning.',
    keyAuthors: [
      {
        name: 'Robert Fogelin',
        description: 'Fogelin is the primary advocate of the Pyrrhonian reading, seeing Wittgenstein\'s approach as similar to ancient skepticism.',
        notable_works: ['Wittgenstein (1976)', 'Taking Wittgenstein at His Word (2009)']
      },
      {
        name: 'Duncan Pritchard',
        description: 'Pritchard has explored connections between Wittgenstein\'s On Certainty and Pyrrhonian skepticism.',
        notable_works: ['Wittgenstein on Skepticism (2011)']
      }
    ],
    keyPublications: [
      {
        title: 'Taking Wittgenstein at His Word: A Textual Study',
        author: 'Robert Fogelin',
        year: '2009',
        description: 'A detailed argument for the Pyrrhonian interpretation of Wittgenstein\'s philosophy.'
      },
      {
        title: 'Wittgenstein',
        author: 'Robert Fogelin',
        year: '1976',
        description: 'An influential study presenting Wittgenstein as a neo-Pyrrhonian skeptic.'
      }
    ]
  },
  {
    id: 'transcendental',
    name: 'Transcendental Reading',
    description: 'Focusing on the conditions for the possibility of meaning',
    longDescription: 'The Transcendental Reading interprets Wittgenstein as investigating the necessary conditions for the possibility of meaning and sense, similar to Kant\'s transcendental philosophy. This approach sees him as revealing the logical or grammatical structures that make language and thought possible.',
    keyAuthors: [
      {
        name: 'A.C. Grayling',
        description: 'Grayling has developed interpretations of Wittgenstein that emphasize transcendental aspects of his philosophy.',
        notable_works: ['Wittgenstein: A Very Short Introduction (1988)']
      },
      {
        name: 'Bernard Williams',
        description: 'Williams explored transcendental themes in Wittgenstein\'s approach to certainty and knowledge.',
        notable_works: ['Wittgenstein and Idealism (1973)']
      }
    ],
    keyPublications: [
      {
        title: 'Wittgenstein: A Very Short Introduction',
        author: 'A.C. Grayling',
        year: '1988',
        description: 'A concise introduction that highlights transcendental aspects of Wittgenstein\'s philosophy.'
      },
      {
        title: 'Wittgenstein and Idealism',
        author: 'Bernard Williams',
        year: '1973',
        description: 'An influential essay examining transcendental themes in Wittgenstein\'s philosophy.'
      }
    ]
  },
  {
    id: 'ethical',
    name: 'Ethical Reading',
    description: 'Centrality of ethics and the mystical in Wittgenstein\'s thought',
    longDescription: 'The Ethical Reading emphasizes the centrality of ethics and the mystical in Wittgenstein\'s philosophy, despite his limited explicit writing on ethics. This approach interprets his philosophical method as fundamentally ethical in purpose, aiming to help us see the world "aright" and achieve a kind of ethical clarity about our lives.',
    keyAuthors: [
      {
        name: 'Cora Diamond',
        description: 'Diamond has emphasized the ethical dimensions of Wittgenstein\'s work, particularly in relation to the Tractatus.',
        notable_works: ['The Realistic Spirit (1991)', 'Reading Wittgenstein with Anscombe, Going On to Ethics (2019)']
      },
      {
        name: 'James Edwards',
        description: 'Edwards has developed ethical interpretations of Wittgenstein that emphasize the mystical dimensions of his thought.',
        notable_works: ['Ethics Without Philosophy: Wittgenstein and the Moral Life (1982)']
      }
    ],
    keyPublications: [
      {
        title: 'Ethics Without Philosophy: Wittgenstein and the Moral Life',
        author: 'James Edwards',
        year: '1982',
        description: 'A pioneering study of the ethical dimensions of Wittgenstein\'s philosophy.'
      },
      {
        title: 'Reading Wittgenstein with Anscombe, Going On to Ethics',
        author: 'Cora Diamond',
        year: '2019',
        description: 'A recent work exploring the ethical implications of Wittgenstein\'s philosophy.'
      }
    ]
  }
];

// Suggested starter questions
const STARTER_QUESTIONS = [
  "What did Wittgenstein mean by 'the limits of my language mean the limits of my world'?",
  "How does Wittgenstein's concept of language games work?",
  "What is the difference between saying and showing in Wittgenstein's philosophy?",
  "How did Wittgenstein's views on meaning change from early to later work?",
  "What is Wittgenstein's private language argument?"
];

// Expanded list of starter questions
const ADDITIONAL_QUESTIONS = [
  "How does Wittgenstein's concept of 'family resemblance' challenge traditional theories of meaning?",
  "What role does context play in Wittgenstein's later philosophy?",
  "How does Wittgenstein's view of mathematics differ from Platonism?",
  "What is the significance of rule-following in Wittgenstein's philosophy?",
  "How does Wittgenstein's approach to philosophical problems differ from traditional metaphysics?",
  "What is Wittgenstein's view on the relationship between thought and language?",
  "How does Wittgenstein's concept of 'forms of life' relate to language games?",
  "What is Wittgenstein's critique of Augustine's picture of language?",
  "How does Wittgenstein address the problem of other minds?",
  "What is the role of certainty in Wittgenstein's later philosophy?"
];

// Question Former interface
interface QuestionFormerResponse {
  improvedQuestion: string;
  explanation: string;
}

// Helper function to parse LLM response into structured format
const parseLLMResponse = (responseText: string, query: string): {frameworks: Framework[], citations: Citation[]} => {
  // This is a simplified parser - in a production environment, you would want 
  // to implement more robust parsing logic based on your LLM's output structure
  
  // Default result with empty arrays
  const result: {frameworks: Framework[], citations: Citation[]} = {
    frameworks: [],
    citations: []
  };
  
  // Extract frameworks
  FRAMEWORKS.forEach(framework => {
    // Look for sections that mention this framework's name
    const regex = new RegExp(`## ${framework.name}.*?(?=## |$)`, 'is');
    const match = responseText.match(regex);
    
    if (match) {
      result.frameworks.push({
        ...framework,
        interpretation: match[0],
        confidence: 0.8, // Default confidence
      });
    } else {
      // Fallback in case the exact heading isn't found
      result.frameworks.push({
        ...framework,
        interpretation: `No specific interpretation from ${framework.name} perspective was found.`,
        confidence: 0.5,
      });
    }
  });
  
  // Try to extract citations - this looks for quoted text
  const citationRegex = /"([^"]+)"\s*—\s*([^,]+)(?:,\s*([^)]+))?/g;
  let citationMatch;
  let citationId = 1;
  
  while ((citationMatch = citationRegex.exec(responseText)) !== null) {
    const [_, text, source, page] = citationMatch;
    result.citations.push({
      id: citationId.toString(),
      text,
      source,
      page: page || undefined,
    });
    citationId++;
  }
  
  return result;
};

// Update the processing step type to match our simplified flow
type ProcessingStep = 
  | 'idle'
  | 'searching-wittgenstein'
  | 'searching-transaction'
  | 'generating-interpretations' 
  | 'finalizing';

// Define a simple framework type for our frameworksData array
interface SimpleFramework {
  id: string;
  name: string;
}

interface ChatInterfaceProps {
  customApiKey?: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ customApiKey }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [currentInterpretation, setCurrentInterpretation] = useState<Interpretation | null>(null);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [rateLimitedMessage, setRateLimitedMessage] = useState<string | null>(null);
  
  // Modal state for framework details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFramework, setActiveFramework] = useState<Framework | null>(null);
  
  // Replace the activeFramework string state with a Framework object state
  const [expandedFrameworks, setExpandedFrameworks] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Add a new state to track individual framework loading states
  const [frameworkStatuses, setFrameworkStatuses] = useState<Record<string, 'loading' | 'complete' | 'error'>>({});

  // Add new state for modals and question former
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showQuestionFormer, setShowQuestionFormer] = useState(false);
  const [formingQuestion, setFormingQuestion] = useState('');
  const [improvedQuestion, setImprovedQuestion] = useState<QuestionFormerResponse | null>(null);
  const [isFormingQuestion, setIsFormingQuestion] = useState(false);

  // Update the handleSubmit function to process each framework independently
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Check rate limiting - only allow one request per minute
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    
    if (lastSubmissionTime > 0 && timeSinceLastSubmission < 60000) {
      const timeRemaining = Math.ceil((60000 - timeSinceLastSubmission) / 1000);
      const message = `Please wait ${timeRemaining} seconds before submitting another question.`;
      setRateLimitedMessage(message);
      setTimeout(() => setRateLimitedMessage(null), 5000); // Clear message after 5 seconds
      return;
    }
    
    // Update last submission time
    setLastSubmissionTime(now);
    // Clear any rate limit messages
    setRateLimitedMessage(null);
    
    // Store the question
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    
    // Update UI
    setMessages(prev => [...prev, userMessage]);
    // Don't clear the input so the user can still see their question
    // setInput('');
    setIsLoading(true);
    setProcessingStep('searching-wittgenstein');
    
    // Reset all framework statuses
    setFrameworkStatuses({});

    // Reset current interpretation (we'll build it incrementally)
    setCurrentInterpretation({
      question: userMessage.content,
      frameworks: [],
      citations: [],
      timestamp: new Date()
    });
    
    try {
      // Create a temporary loading message
      const tempAssistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Analyzing your question and generating interpretations...',
        timestamp: new Date()
      };
      
      // Add the temporary message to the chat
      setMessages(prev => [...prev, tempAssistantMessage]);
      
      // Helper function to handle API errors
      const handleApiError = (error: any) => {
        const errorData = error.response?.data || {};
        
        // Handle API key errors
        if (error.response?.status === 401 || errorData.code?.includes('api_key')) {
          setMessages(prev => [
            ...prev.slice(0, -1), // Remove the loading message
            {
              id: uuidv4(),
              role: 'assistant',
              content: '⚠️ API Key Required\n\nTo use this feature, you need to provide your own OpenAI API key:\n\n1. Click the checkbox above labeled "Use my own OpenAI API key"\n2. Get an API key from [OpenAI\'s platform](https://platform.openai.com/api-keys)\n3. Paste your API key in the input field\n4. Try your question again\n\nThis is required because the default API key is currently unavailable.',
              timestamp: new Date()
            }
          ]);
          return true;
        }
        
        // Handle rate limit errors
        if (error.response?.status === 429 || errorData.code === 'rate_limit') {
          setMessages(prev => [
            ...prev.slice(0, -1),
            {
              id: uuidv4(),
              role: 'assistant',
              content: '⏳ Rate Limit Exceeded\n\nThe server is currently experiencing high traffic. Please wait a moment and try again.',
              timestamp: new Date()
            }
          ]);
          return true;
        }
        
        return false;
      };
      
      // Step 2: Search for Wittgenstein passages
      console.log("Step 2: Searching for Wittgenstein passages...");
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add custom API key to headers if provided
      if (customApiKey) {
        headers['Authorization'] = `Bearer ${customApiKey}`;
      }

      try {
        const wittSearchResponse = await fetch('/api/search/wittgenstein', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: userMessage.content,
            collectionName: 'second-brain-docs',
          }),
        });
        
        if (!wittSearchResponse.ok) {
          const errorData = await wittSearchResponse.json();
          if (handleApiError({ response: { status: wittSearchResponse.status, data: errorData } })) {
            setIsLoading(false);
            setProcessingStep('idle');
            return;
          }
          throw new Error(errorData.message || 'Failed to search Wittgenstein passages');
        }
        
        const wittSearchData = await wittSearchResponse.json();
        const wittPassages = wittSearchData.passages;
        
        if (!wittPassages || wittPassages.length === 0) {
          throw new Error('No relevant Wittgenstein passages found. Try a different query.');
        }

        // Update citations with Wittgenstein passages
        setCurrentInterpretation(prev => {
          if (!prev) return {
            question: userMessage.content,
            frameworks: [],
            citations: [...wittPassages],
            timestamp: new Date()
          };
          return {
            ...prev,
            citations: [...wittPassages]
          };
        });
        
        // Step 3: Search for Transaction Theory passages
        setProcessingStep('searching-transaction');
        console.log("Step 3: Searching for Transaction Theory passages...");
        
        const transSearchResponse = await fetch('/api/search/transaction', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: userMessage.content,
            collectionName: 'second-brain-docs',
          }),
        });
        
        let transPassages: any[] = [];
        if (transSearchResponse.ok) {
          const transSearchData = await transSearchResponse.json();
          transPassages = transSearchData.passages || [];
          
          // Update citations with Transaction Theory passages
          setCurrentInterpretation(prev => {
            if (!prev) return {
              question: userMessage.content,
              frameworks: [],
              citations: [...wittPassages, ...transPassages],
              timestamp: new Date()
            };
            return {
              ...prev,
              citations: [...(prev.citations || []), ...transPassages]
            };
          });
        }
        
        // Place the progressMessage declaration here before it's used in the later sections
        let progressMessage: Message;
        
        // Update the progress message
        progressMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'I\'m analyzing your question through multiple philosophical frameworks. Interpretations will appear progressively as they are generated.',
          timestamp: new Date()
        };
        
        // Replace the temporary message with the progress message
        setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantMessage.id ? progressMessage : msg
        ));
        
        // Step 4: Prepare framework data - use all the frameworks
        const frameworksData: SimpleFramework[] = [
          { id: 'early', name: 'Early Wittgenstein' },
          { id: 'later', name: 'Later Wittgenstein' },
          { id: 'ordinary', name: 'Ordinary Language' },
          { id: 'therapeutic', name: 'Therapeutic Reading' },
          { id: 'resolute', name: 'Resolute Reading' },
          { id: 'pragmatic', name: 'Pragmatic Reading' },
          { id: 'contextualist', name: 'Contextualist Reading' },
          { id: 'naturalistic', name: 'Naturalistic Reading' },
          { id: 'post-analytic', name: 'Post-Analytic Reading' },
          { id: 'ethical', name: 'Ethical Reading' },
          { id: 'metaphysical', name: 'Metaphysical Reading' },
          { id: 'pyrrhonian', name: 'Pyrrhonian Reading' },
          { id: 'transcendental', name: 'Transcendental Reading' },
          { id: 'transactional', name: 'Transaction Theory' }
        ];
        
        // Initialize all frameworks as loading
        const initialStatuses: Record<string, 'loading' | 'complete' | 'error'> = {};
        frameworksData.forEach(framework => {
          initialStatuses[framework.id] = 'loading';
        });
        setFrameworkStatuses(initialStatuses);
        
        // Add empty framework placeholders to the interpretation state
        setCurrentInterpretation(prev => {
          if (!prev) return {
            question: userMessage.content,
            frameworks: frameworksData.map(framework => ({
              id: framework.id,
              name: framework.name,
              description: framework.id,
              interpretation: 'Loading interpretation...',
              isLoading: true
            })),
            citations: [],
            timestamp: new Date()
          };
          return {
            ...prev,
            frameworks: frameworksData.map(framework => ({
              id: framework.id,
              name: framework.name,
              description: framework.id,
              interpretation: 'Loading interpretation...',
              isLoading: true
            }))
          };
        });
        
        // Step 5: Set the overall processing step to generating interpretations
        setProcessingStep('generating-interpretations');
        
        // Step 6: Process interpretations with multiple parallel API calls
        setProcessingStep('generating-interpretations');
        console.log("Step 3: Generating interpretations in parallel...");
        
        try {
          // Create requests for each framework individually
          const frameworkPromises = frameworksData.map(async (framework: SimpleFramework) => {
            try {
              console.log(`Starting interpretation for ${framework.name}...`);
              
              // Update the framework status to loading
              setFrameworkStatuses(prev => ({ 
                ...prev, 
                [framework.id]: 'loading' 
              }));
              
              // Start the framework generation (returns a job ID immediately)
              const startResponse = await fetch(`/api/interpret/${framework.id === 'transactional' ? 'transaction' : 'framework'}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(
                  framework.id === 'transactional'
                    ? {
                        query: userMessage.content,
                        wittPassages,
                        transPassages
                      }
                    : {
                        query: userMessage.content,
                        passages: wittPassages,
                        framework: framework.id
                      }
                ),
              });
              
              if (!startResponse.ok) {
                throw new Error(`Failed to start ${framework.name} interpretation job`);
              }
              
              const startData = await startResponse.json();
              
              // Enhanced debug logging to better understand the response
              console.log(`${framework.name} API response:`, {
                hasInterpretation: !!startData.interpretation,
                hasJobId: !!startData.jobId,
                responseKeys: Object.keys(startData),
                responseType: typeof startData,
                responseValue: JSON.stringify(startData)
              });
              
              // Check if the response has a direct interpretation (non-job mode)
              if (startData.interpretation) {
                console.log(`Received direct interpretation for ${framework.name}`);
                
                // Update the framework with the interpretation and structured data
                setCurrentInterpretation(prev => {
                  if (!prev) return prev;
                  
                  return {
                    ...prev,
                    frameworks: prev.frameworks.map(fw =>
                      fw.id === framework.id
                        ? {
                            ...fw,
                            interpretation: startData.interpretation.mainInterpretation,
                            keyInsights: startData.interpretation.keyInsights,
                            relevantQuotes: startData.interpretation.relevantQuotes,
                            referencePassages: startData.referencePassages,
                            isLoading: false,
                            error: false
                          }
                        : fw
                    )
                  };
                });

                // Update framework status
                setFrameworkStatuses(prev => ({
                  ...prev,
                  [framework.id]: 'complete'
                }));

                return { framework, success: true };
              }
              
              // If no direct interpretation, look for job ID for polling
              const jobId = startData.jobId;
              
              if (!jobId) {
                console.error(`No job ID returned for ${framework.name} - server response:`, JSON.stringify(startData));
                
                // Try to extract any useful information from the response
                let errorMessage = `Unable to generate interpretation for ${framework.name}. `;
                
                // Check if there's an error field in the response
                if (startData.error) {
                  errorMessage += `Error: ${startData.error}`;
                } 
                // If we have content in another field, try to use that
                else if (startData.result) {
                  // If we have a result field but no interpretation, try to use that
                  setCurrentInterpretation(prev => {
                    if (!prev) return prev;
                    
                    return {
                      ...prev,
                      frameworks: prev.frameworks.map(fw => 
                        fw.id === framework.id 
                          ? { 
                              ...fw, 
                              interpretation: typeof startData.result === 'string' ? startData.result : JSON.stringify(startData.result),
                              isLoading: false,
                              error: false
                            } 
                          : fw
                      )
                    };
                  });
                  
                  // Update framework status
                  setFrameworkStatuses(prev => ({ 
                    ...prev, 
                    [framework.id]: 'complete' 
                  }));
                  
                  return { framework, success: true };
                }
                else {
                  errorMessage += 'The server provided a response but in an unexpected format. Try again or contact support.';
                }
                
                // Update the framework with a useful error message
                setCurrentInterpretation(prev => {
                  if (!prev) return prev;
                  
                  return {
                    ...prev,
                    frameworks: prev.frameworks.map(fw => 
                      fw.id === framework.id 
                        ? { 
                            ...fw, 
                            interpretation: errorMessage,
                            isLoading: false,
                            error: true
                          } 
                        : fw
                    )
                  };
                });
                
                // Update framework status
                setFrameworkStatuses(prev => ({ 
                  ...prev, 
                  [framework.id]: 'error' 
                }));
                
                throw new Error('No job ID returned from server');
              }
            } catch (error) {
              console.error(`Error generating interpretation for ${framework.name}:`, error);
              
              // Update the framework with error state
              setCurrentInterpretation(prev => {
                if (!prev) return prev;
                
                return {
                  ...prev,
                  frameworks: prev.frameworks.map(fw => 
                    fw.id === framework.id 
                      ? { 
                          ...fw, 
                          interpretation: `Failed to generate interpretation for ${framework.name}. The server may be busy or the request timed out. You can try again using the retry button.`,
                          isLoading: false,
                          error: true
                        } 
                      : fw
                  )
                };
              });
              
              // Update framework status
              setFrameworkStatuses(prev => ({ 
                ...prev, 
                [framework.id]: 'error' 
              }));
              
              return { framework, success: false, error: error as Error };
            }
          });
          
          // Wait for all frameworks to complete (regardless of success/failure)
          const results = await Promise.allSettled(frameworkPromises);
          
          console.log(`Completed ${results.filter(r => r.status === 'fulfilled' && (r.value as any)?.success).length} of ${frameworksData.length} interpretations`);
          
          // Set the final processing step
          setProcessingStep('finalizing');
          
          // Get the last assistant message to update
          const lastMessages = [...messages];
          const lastAssistantMessageIndex = lastMessages.findIndex(m => m.role === 'assistant');
          
          // When all interpretations are complete, update the message
          if (lastAssistantMessageIndex !== -1) {
            // Create updated message
            const updatedMessage: Message = {
              id: lastMessages[lastAssistantMessageIndex].id,
              role: 'assistant',
              content: 'Here are interpretations of your question about Wittgenstein from various philosophical traditions. I\'ve analyzed the passages through multiple interpretative lenses to provide you with comprehensive insights.',
              timestamp: new Date()
            };
            
            // Update the message
            lastMessages[lastAssistantMessageIndex] = updatedMessage;
            setMessages(lastMessages);
          }
        } catch (error: any) {
          console.error('Error:', error);
          
          // Even if something unexpected happens, we should still show any interpretations that did load
          const completedFrameworks = Object.entries(frameworkStatuses)
            .filter(([_, status]) => status === 'complete')
            .map(([id]) => id);
          
          // Get the last assistant message to update
          const lastMessages = [...messages];
          const lastAssistantMessageIndex = lastMessages.findIndex(m => m.role === 'assistant');
          
          if (lastAssistantMessageIndex !== -1) {
            // Create error message or partial success message
            const updatedMessage: Message = {
              id: lastMessages[lastAssistantMessageIndex].id,
              role: 'assistant',
              content: completedFrameworks.length > 0
                ? `I was able to generate some interpretations of your question about Wittgenstein, though not all frameworks completed successfully. Here are the interpretations that were successfully generated.`
                : `Sorry, I encountered an error while generating interpretations. ${error.message || 'Please try again with a simpler question or try again later.'}`,
              timestamp: new Date()
            };
            
            // Update the message
            lastMessages[lastAssistantMessageIndex] = updatedMessage;
            setMessages(lastMessages);
          }
        } finally {
          setIsLoading(false);
          setProcessingStep('idle');
        }
      } catch (error: any) {
        console.error('Error:', error);
        
        // Even if something unexpected happens, we should still show any interpretations that did load
        const completedFrameworks = Object.entries(frameworkStatuses)
          .filter(([_, status]) => status === 'complete')
          .map(([id]) => id);
        
        // Get the last assistant message to update
        const lastMessages = [...messages];
        const lastAssistantMessageIndex = lastMessages.findIndex(m => m.role === 'assistant');
        
        if (lastAssistantMessageIndex !== -1) {
          // Create error message or partial success message
          const updatedMessage: Message = {
            id: lastMessages[lastAssistantMessageIndex].id,
            role: 'assistant',
            content: completedFrameworks.length > 0
              ? `I was able to generate some interpretations of your question about Wittgenstein, though not all frameworks completed successfully. Here are the interpretations that were successfully generated.`
              : `Sorry, I encountered an error while generating interpretations. ${error.message || 'Please try again with a simpler question or try again later.'}`,
            timestamp: new Date()
          };
          
          // Update the message
          lastMessages[lastAssistantMessageIndex] = updatedMessage;
          setMessages(lastMessages);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      // Even if something unexpected happens, we should still show any interpretations that did load
      const completedFrameworks = Object.entries(frameworkStatuses)
        .filter(([_, status]) => status === 'complete')
        .map(([id]) => id);
      
      // Get the last assistant message to update
      const lastMessages = [...messages];
      const lastAssistantMessageIndex = lastMessages.findIndex(m => m.role === 'assistant');
      
      if (lastAssistantMessageIndex !== -1) {
        // Create error message or partial success message
        const updatedMessage: Message = {
          id: lastMessages[lastAssistantMessageIndex].id,
          role: 'assistant',
          content: completedFrameworks.length > 0
            ? `I was able to generate some interpretations of your question about Wittgenstein, though not all frameworks completed successfully. Here are the interpretations that were successfully generated.`
            : `Sorry, I encountered an error while generating interpretations. ${error.message || 'Please try again with a simpler question or try again later.'}`,
          timestamp: new Date()
        };
        
        // Update the message
        lastMessages[lastAssistantMessageIndex] = updatedMessage;
        setMessages(lastMessages);
      }
    }
  };

  // Handle textarea input resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  // Add reset function after handleInputChange
  const handleReset = () => {
    setInput('');
    setMessages([]);
    setCurrentInterpretation(null);
    setIsLoading(false);
    setProcessingStep('idle');
    setFrameworkStatuses({});
    setRateLimitedMessage(null);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  // Handle starter question click
  const handleStarterQuestionClick = (question: string) => {
    setInput(question);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  // Fix framework item clicking - modify to toggle expansion instead of showing modal
  const toggleFramework = (framework: Framework) => {
    console.log('Framework clicked:', framework.name); // Debug log
    
    // Toggle the framework expansion (close if already expanded, open if not)
    setExpandedFrameworks(prevFrameworks => 
      prevFrameworks.includes(framework.id) ? prevFrameworks.filter(id => id !== framework.id) : [...prevFrameworks, framework.id]
    );
  };

  // Function to close expanded framework
  const closeFrameworkDetails = () => {
    setExpandedFrameworks([]);
  };

  // Then update the loading UI to show the current step
  
  // Loading indicator with step information
  const LoadingIndicator = () => {
    const getStepNumber = () => {
      switch (processingStep) {
        case 'searching-wittgenstein': return 1;
        case 'searching-transaction': return 2;
        case 'generating-interpretations': return 3;
        case 'finalizing': return 4;
        default: return 0;
      }
    };
    
    const stepNumber = getStepNumber();
    const totalSteps = 4;
    
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingHeader}>
          <h3>Processing your question...</h3>
          <div className={styles.loadingProgress}>
            <div className={styles.progressText}>Step {stepNumber} of {totalSteps}</div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressBarFill} 
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className={styles.loadingSteps}>
          <div className={`${styles.loadingStep} ${processingStep === 'searching-wittgenstein' ? styles.active : ''} ${getStepNumber() > 1 ? styles.completed : ''}`}>
            <div className={styles.stepIcon}>1</div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>Finding relevant Wittgenstein passages</div>
              <div className={styles.stepDescription}>Searching through Wittgenstein's works for passages that relate to your question.</div>
            </div>
          </div>
          
          <div className={`${styles.loadingStep} ${processingStep === 'searching-transaction' ? styles.active : ''} ${getStepNumber() > 2 ? styles.completed : ''}`}>
            <div className={styles.stepIcon}>2</div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>Finding Transaction Theory passages</div>
              <div className={styles.stepDescription}>Identifying relevant Transaction Theory concepts and connections.</div>
            </div>
          </div>
          
          <div className={`${styles.loadingStep} ${processingStep === 'generating-interpretations' ? styles.active : ''} ${getStepNumber() > 3 ? styles.completed : ''}`}>
            <div className={styles.stepIcon}>3</div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>Generating philosophical interpretations</div>
              <div className={styles.stepDescription}>Analyzing passages through multiple philosophical frameworks.</div>
            </div>
          </div>
          
          <div className={`${styles.loadingStep} ${processingStep === 'finalizing' ? styles.active : ''} ${getStepNumber() > 4 ? styles.completed : ''}`}>
            <div className={styles.stepIcon}>4</div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>Finalizing results</div>
              <div className={styles.stepDescription}>Organizing interpretations and preparing a comprehensive response.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // And finally update the loading UI in the main render
  // Replace the simple loading indicator with our new one
  {/* Loading indicator */}
  {isLoading && (
    <div className={styles.loading}>
      <LoadingIndicator />
    </div>
  )}

  // First, create a separate FrameworkItem component
  // Add this above the renderFramework function

  // Component for each individual framework item to properly handle state
  const FrameworkItem: React.FC<{
    framework: Framework,
    onRetry: (framework: Framework) => void
  }> = ({ framework, onRetry }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLoading = framework.isLoading || frameworkStatuses[framework.id] === 'loading';
    const hasError = framework.error || frameworkStatuses[framework.id] === 'error';
    
    const handleExpandClick = () => {
      if (!isLoading) {
        setIsExpanded(!isExpanded);
        console.log(`Framework clicked: ${framework.name}`);
      }
    };
    
    const handleRetry = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent the click from expanding the framework
      onRetry(framework);
    };

    return (
      <div 
        key={framework.id} 
        className={`${styles.framework} ${isExpanded ? styles.expanded : ''} ${hasError ? styles.error : ''}`}
        onClick={handleExpandClick}
      >
        <div className={styles.frameworkHeader}>
          <h3>{framework.name}</h3>
          
          {hasError ? (
            <div className={styles.errorIndicator}>
              <span className={styles.errorIcon}>⚠️</span>
              <button
                className={styles.retryButton}
                onClick={handleRetry}
                title="Retry this interpretation"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className={styles.loadingSpinner}>
              <span>Generating interpretation...</span>
            </div>
          ) : (
            <div className={styles.expandIcon}>
              {isExpanded ? '▼' : '▶'}
            </div>
          )}
        </div>
        
        {isExpanded && (
          <div className={styles.frameworkContent}>
            {hasError ? (
              <div className={styles.errorMessage}>
                <p>Unable to load this interpretation. The server returned the following error:</p>
                <p className={styles.errorDetail}>
                  {framework.interpretation?.includes('Failed to generate') 
                    ? framework.interpretation 
                    : "The server may be unavailable or the API endpoint is not configured correctly."}
                </p>
                <p>You can:</p>
                <ul>
                  <li>Retry just this framework using the retry button above</li>
                  <li>Try a simpler or more specific question</li>
                  <li>Check if the server has been properly deployed with all required endpoints</li>
                </ul>
              </div>
            ) : framework.interpretation && !isLoading ? (
              <div className={styles.structuredInterpretation}>
                {/* Main interpretation */}
                <div className={styles.interpretationSection}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {framework.interpretation}
                  </ReactMarkdown>
                </div>
                
                {/* Key Insights */}
                {framework.keyInsights && framework.keyInsights.length > 0 && (
                  <div className={styles.insightsSection}>
                    <h4>Key Insights</h4>
                    <ul className={styles.insightsList}>
                      {framework.keyInsights.map((insight, index) => (
                        <li key={index} className={styles.insightItem}>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Relevant Quotes */}
                {framework.relevantQuotes && framework.relevantQuotes.length > 0 && (
                  <div className={styles.quotesSection}>
                    <h4>Relevant Passages</h4>
                    {framework.relevantQuotes.map((quote, index) => (
                      <div key={index} className={styles.quoteItem}>
                        <blockquote className={styles.quoteText}>
                          <p>{quote.text}</p>
                        </blockquote>
                        <div className={styles.quoteExplanation}>
                          {quote.isWittgenstein !== undefined && (
                            <span className={styles.quoteSource}>
                              {quote.isWittgenstein ? 'Wittgenstein' : 'Transaction Theory'}
                            </span>
                          )}
                          <p>{quote.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reference Passages */}
                {framework.referencePassages && framework.referencePassages.length > 0 && (
                  <div className={styles.referencesSection}>
                    <h4>Reference Passages</h4>
                    <div className={styles.referencesList}>
                      {framework.referencePassages.map((passage, index) => (
                        <div key={index} className={styles.referenceItem}>
                          <blockquote>
                            <p>{passage.text}</p>
                          </blockquote>
                          <div className={styles.sourceInfo}>
                            <span className={styles.sourceName}>{passage.source}</span>
                            {passage.section && (
                              <span className={styles.sourceSection}>{passage.section}</span>
                            )}
                            {passage.page && (
                              <span className={styles.sourcePage}>p. {passage.page}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.loading}>Loading interpretation...</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Then, simplify the renderFramework function to use the FrameworkItem component
  const renderFramework = (framework: Framework) => {
    return (
      <FrameworkItem 
        key={framework.id}
        framework={framework}
        onRetry={handleSingleFrameworkRequest}
      />
    );
  };

  // Handler for retrying a single framework
  const handleSingleFrameworkRequest = async (framework: Framework) => {
    try {
      // Update the framework status to loading
      setFrameworkStatuses(prev => ({ 
        ...prev, 
        [framework.id]: 'loading' 
      }));
      
      // Update the framework in the state to show loading
      setCurrentInterpretation(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          frameworks: prev.frameworks.map(fw => 
            fw.id === framework.id 
              ? { 
                  ...fw, 
                  isLoading: true,
                  error: false
                } 
              : fw
          )
        };
      });
      
      console.log(`Requesting interpretation for ${framework.name} with ID ${framework.id}...`);
      
      // Make a direct API call for the interpretation
      const response = await fetch(`/api/interpret/${framework.id === 'transactional' ? 'transaction' : 'framework'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey && { 'Authorization': `Bearer ${customApiKey}` })
        },
        body: JSON.stringify(
          framework.id === 'transactional'
            ? {
                query: currentInterpretation?.question || '',
                wittPassages: currentInterpretation?.citations.filter(c => !c.id.startsWith('trans-')) || [],
                transPassages: currentInterpretation?.citations.filter(c => c.id.startsWith('trans-')) || []
              }
            : {
                query: currentInterpretation?.question || '',
                passages: currentInterpretation?.citations.filter(c => !c.id.startsWith('trans-')) || [],
                framework: framework.id
              }
        ),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get ${framework.name} interpretation: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if we have an interpretation
      if (!data.interpretation) {
        throw new Error(`No interpretation returned for ${framework.name}`);
      }
      
      // Update the framework with the interpretation and structured data
      setCurrentInterpretation(prev => {
        if (!prev) return prev;
        
        // Process reference passages if they exist
        let updatedCitations = [...(prev.citations || [])];
        
        // For Transaction Theory, handle both Wittgenstein and Transaction passages
        if (framework.id === 'transactional') {
          if (data.wittReferencePassages && Array.isArray(data.wittReferencePassages)) {
            // Add any new Wittgenstein passages
            data.wittReferencePassages.forEach((passage: Citation) => {
              if (!updatedCitations.some(c => c.id === passage.id)) {
                updatedCitations.push(passage);
              }
            });
          }
          
          if (data.transReferencePassages && Array.isArray(data.transReferencePassages)) {
            // Add any new Transaction passages
            data.transReferencePassages.forEach((passage: Citation) => {
              if (!updatedCitations.some(c => c.id === passage.id)) {
                updatedCitations.push(passage);
              }
            });
          }
        } 
        // For other frameworks, handle regular reference passages
        else if (data.referencePassages && Array.isArray(data.referencePassages)) {
          data.referencePassages.forEach((passage: Citation) => {
            if (!updatedCitations.some(c => c.id === passage.id)) {
              updatedCitations.push(passage);
            }
          });
        }
        
        return {
          ...prev,
          citations: updatedCitations,
          frameworks: prev.frameworks.map(fw => 
            fw.id === framework.id 
              ? { 
                  ...fw, 
                  interpretation: data.interpretation,
                  keyInsights: data.structuredInterpretation?.keyInsights || [],
                  relevantQuotes: data.structuredInterpretation?.relevantQuotes || [],
                  referencePassages: framework.id === 'transactional' 
                    ? [...(data.wittReferencePassages || []), ...(data.transReferencePassages || [])]
                    : data.referencePassages || [],
                  isLoading: false,
                  error: false
                } 
              : fw
          )
        };
      });
      
      // Update framework status
      setFrameworkStatuses(prev => ({ 
        ...prev, 
        [framework.id]: 'complete' 
      }));
      
      console.log(`Successfully received ${framework.name} interpretation`);
      
      return { framework, success: true };
    } catch (error) {
      console.error(`Error getting interpretation for ${framework.name}:`, error);
      
      // Update the framework with an error message
      setCurrentInterpretation(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          frameworks: prev.frameworks.map(fw => 
            fw.id === framework.id 
              ? { 
                  ...fw, 
                  interpretation: `Error generating interpretation: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                  isLoading: false,
                  error: true
                } 
              : fw
          )
        };
      });
      
      // Update framework status
      setFrameworkStatuses(prev => ({ 
        ...prev, 
        [framework.id]: 'error' 
      }));
      
      return { framework, success: false, error: error as Error };
    }
  };

  // Function to handle question forming
  const handleFormQuestion = async () => {
    if (!formingQuestion.trim()) return;
    
    setIsFormingQuestion(true);
    try {
      const response = await fetch('/api/form-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey && { 'Authorization': `Bearer ${customApiKey}` })
        },
        body: JSON.stringify({ question: formingQuestion })
      });
      
      if (!response.ok) {
        throw new Error('Failed to form question');
      }
      
      const data = await response.json();
      setImprovedQuestion(data);
    } catch (error) {
      console.error('Error forming question:', error);
    } finally {
      setIsFormingQuestion(false);
    }
  };

  // Function to use improved question
  const useImprovedQuestion = () => {
    if (improvedQuestion) {
      setInput(improvedQuestion.improvedQuestion);
      setShowQuestionFormer(false);
      setImprovedQuestion(null);
      setFormingQuestion('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className={styles.plainLayout}>
      <div className={styles.inputSection}>
        {messages.length === 0 && (
          <div className={styles.suggestions}>
            <p>Try asking about:</p>
            <div className={styles.suggestionButtons}>
              {STARTER_QUESTIONS.map((question, index) => (
                <button 
                  key={index}
                  className={styles.suggestion}
                  onClick={() => handleStarterQuestionClick(question)}
                >
                  {question}
                </button>
              ))}
              <button 
                className={`${styles.suggestion} ${styles.moreQuestionsBtn}`}
                onClick={() => setShowQuestionsModal(true)}
              >
                More Questions...
              </button>
            </div>
            <div className={styles.sourceInfo}>
              <a 
                href="https://github.com/rogerHuntGauntlet/Second-Brain/tree/0d833a9d37c7b595c020be83340ea98a688cd487/Witt-Trans/sections/ch8"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceLink}
              >
                📚 View Source Materials from Wittgenstein's Writings
              </a>
              <p className={styles.sourceDescription}>
                Access the complete collection of texts and translations used in this application.
              </p>
            </div>
            <button 
              className={styles.questionFormerBtn}
              onClick={() => setShowQuestionFormer(true)}
            >
              💡 Help me form a better question
            </button>
          </div>
        )}

        {/* More Questions Modal */}
        {showQuestionsModal && (
          <div className={styles.modal} onClick={() => setShowQuestionsModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setShowQuestionsModal(false)}>×</button>
              <h2>More Questions About Wittgenstein</h2>
              <div className={styles.modalQuestions}>
                {ADDITIONAL_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    className={styles.modalQuestion}
                    onClick={() => {
                      handleStarterQuestionClick(question);
                      setShowQuestionsModal(false);
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Question Former Modal */}
        {showQuestionFormer && (
          <div className={styles.modal} onClick={() => setShowQuestionFormer(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setShowQuestionFormer(false)}>×</button>
              <h2>Question Former</h2>
              <p className={styles.questionFormerDesc}>
                Let me help you form your question in a way that will get the most insightful and philosophically rich response.
              </p>
              <div className={styles.questionFormerInput}>
                <textarea
                  value={formingQuestion}
                  onChange={(e) => setFormingQuestion(e.target.value)}
                  placeholder="Enter your philosophical question here..."
                  rows={4}
                />
                <button
                  onClick={handleFormQuestion}
                  disabled={isFormingQuestion || !formingQuestion.trim()}
                >
                  {isFormingQuestion ? 'Analyzing question...' : 'Improve my question'}
                </button>
              </div>
              {improvedQuestion && (
                <div className={styles.improvedQuestion}>
                  <h3>Improved Question</h3>
                  <p>{improvedQuestion.improvedQuestion}</p>
                  <div className={styles.explanation}>
                    <h4>Why this is better:</h4>
                    <p>{improvedQuestion.explanation}</p>
                  </div>
                  <button onClick={useImprovedQuestion}>Use this improved question</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Ask a question about Wittgenstein's philosophy..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
              rows={3}
            />
            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.button}
                disabled={isLoading || !input.trim()}
              >
                Ask
              </button>
              {messages.length > 0 && (
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    <path d="M15 9l-6 6M9 9l6 6"/>
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </form>
          
          {/* Rate limit message */}
          {rateLimitedMessage && (
            <div className={styles.rateLimitMessage}>
              {rateLimitedMessage}
            </div>
          )}
        </div>
      </div>

      {/* Question and interpretations flowing down naturally */}
      {messages.length > 0 && (
        <div className={styles.results}>
          {/* Loading indicator */}
          {isLoading && (
            <div className={styles.loading}>
              <LoadingIndicator />
            </div>
          )}

          {/* Interpretations */}
          {currentInterpretation && (
            <div className={styles.interpretations}>
              <h2>Interpretations</h2>
              <div className={styles.frameworksList}>
                {currentInterpretation.frameworks.map(framework => renderFramework(framework))}
              </div>

              {/* Citations */}
              {currentInterpretation.citations.length > 0 && (
                <div className={styles.citations}>
                  <h2>Key Passages from Wittgenstein</h2>
                  <div className={styles.citationsGrid}>
                    {currentInterpretation.citations
                      .filter(citation => !citation.id.startsWith('trans-'))
                      .map(citation => (
                        <div key={citation.id} className={styles.citation}>
                          <div className={styles.citationContent}>
                            <div className={styles.citationText}>
                              <blockquote>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {citation.text}
                                </ReactMarkdown>
                              </blockquote>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Transaction Theory Citations */}
              {currentInterpretation?.citations?.some(citation => citation.id.startsWith('trans-')) && (
                <div className={styles.citations}>
                  <h2>Transaction Theory Passages</h2>
                  <div className={styles.citationsGrid}>
                    {currentInterpretation.citations
                      .filter(citation => citation.id.startsWith('trans-'))
                      .map(citation => (
                        <div key={citation.id} className={styles.citation}>
                          <div className={styles.citationContent}>
                            <div className={styles.citationText}>
                              <blockquote>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {citation.text}
                                </ReactMarkdown>
                              </blockquote>
                            </div>
                            <div className={styles.citationSource}>
                              <span className={styles.sourceIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                              </span>
                              <span className={styles.sourceName}>
                                {citation.source}
                                {citation.section && <span className={styles.sourceSection}>{citation.section}</span>}
                                {citation.page && <span className={styles.sourcePage}>p. {citation.page}</span>}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Also export as default for flexibility
export default ChatInterface; 