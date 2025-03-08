import React, { useState } from 'react';
import styles from './AboutSection.module.css';

// Types for framework details
interface Author {
  name: string;
  description: string;
  notable_works?: string[];
  link?: string;
}

interface Publication {
  title: string;
  author: string;
  year: string;
  description: string;
}

interface Framework {
  id: string;
  name: string;
  description: string;
  color: string;
  longDescription: string;
  keyAuthors: Author[];
  keyPublications: Publication[];
}

// Detailed frameworks data
const FRAMEWORKS: Framework[] = [
  { 
    id: 'picture-theory',
    name: 'Picture Theory', 
    color: '#4A6D7C',
    description: 'Early Wittgenstein\'s logical atomism from Tractatus',
    longDescription: 'The Picture Theory, central to the early Wittgenstein of the Tractatus Logico-Philosophicus, proposes that language has meaning by picturing states of affairs in the world. According to this view, a proposition is a logical picture of a possible situation, and philosophical problems arise from misunderstanding the logic of our language.',
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
    id: 'language-games',
    name: 'Language Games', 
    color: '#6A8D73',
    description: 'Later Wittgenstein\'s view of language embedded in forms of life',
    longDescription: 'The concept of Language Games is central to later Wittgenstein, primarily in the Philosophical Investigations. This view rejects the picture theory and sees language as a diverse collection of practices or "games" embedded in human activities or "forms of life." Meaning emerges from how words are used within these practices rather than from a relation between words and objects.',
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
        title: 'Wittgenstein: Rules, Grammar and Necessity',
        author: 'Gordon Baker and Peter Hacker',
        year: '1985',
        description: 'Second volume of the comprehensive analytical commentary on the Philosophical Investigations.'
      }
    ]
  },
  { 
    id: 'therapeutic',
    name: 'Therapeutic Reading', 
    color: '#AB8476',
    description: 'Philosophy as therapy for conceptual confusions',
    longDescription: 'The Therapeutic Reading interprets Wittgenstein\'s work as primarily therapeutic rather than theoretical. It emphasizes his goal of treating philosophical problems like illnesses that need to be cured through clarity about language use. This approach is influenced by Wittgenstein\'s remark that "there is not a philosophical method, though there are indeed methods, like different therapies."',
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
    color: '#D8B4A0',
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
    id: 'pragmatic',
    name: 'Pragmatic Reading', 
    color: '#5C4742',
    description: 'Focus on language as a tool for practical purposes',
    longDescription: 'The Pragmatic Reading interprets Wittgenstein\'s philosophy as emphasizing the practical utility of language. This view sees Wittgenstein as highlighting how language functions as a tool within specific contexts and practices, with meaning emerging from its practical use rather than from abstract reference. It connects Wittgenstein\'s ideas to the American pragmatist tradition.',
    keyAuthors: [
      {
        name: 'Richard Rorty',
        description: 'Rorty drew connections between Wittgenstein\'s later philosophy and American pragmatism, emphasizing anti-foundationalism and the utility of language.',
        notable_works: ['Philosophy and the Mirror of Nature (1979)', 'Contingency, Irony, and Solidarity (1989)']
      },
      {
        name: 'Robert Brandom',
        description: 'Brandom developed a reading of Wittgenstein that emphasizes the normative and pragmatic aspects of language use.',
        notable_works: ['Making It Explicit (1994)', 'Tales of the Mighty Dead (2002)']
      }
    ],
    keyPublications: [
      {
        title: 'Philosophy and the Mirror of Nature',
        author: 'Richard Rorty',
        year: '1979',
        description: 'A seminal work that draws on Wittgenstein to challenge representationalist views of knowledge and language.'
      },
      {
        title: 'Philosophical Investigations in Wittgenstein, Sellars, and Brandom',
        author: 'Jeremy Wanderer',
        year: '2008',
        description: 'Explores connections between Wittgenstein\'s approach to language and pragmatist accounts.'
      }
    ]
  },
  { 
    id: 'contextualist',
    name: 'Contextualist Reading', 
    color: '#8D6B94',
    description: 'Meaning determined by context and use',
    longDescription: 'The Contextualist Reading emphasizes Wittgenstein\'s insistence that the meaning of language is determined by its context of use. This approach sees Wittgenstein as highlighting how the same words can have different meanings in different contexts, challenging the view that words have fixed meanings. It connects to contemporary debates in epistemology and philosophy of language about context-sensitivity.',
    keyAuthors: [
      {
        name: 'Charles Travis',
        description: 'Travis developed a Wittgensteinian approach to language that emphasizes occasion-sensitivity and the importance of context.',
        notable_works: ['Occasion-Sensitivity (2008)', 'The Uses of Sense (1989)']
      },
      {
        name: 'Avner Baz',
        description: 'Baz applies Wittgensteinian insights to problems in contemporary epistemology and philosophy of language.',
        notable_works: ['When Words Are Called For (2012)']
      }
    ],
    keyPublications: [
      {
        title: 'Occasion-Sensitivity: Selected Essays',
        author: 'Charles Travis',
        year: '2008',
        description: 'A collection of essays developing a contextualist reading of Wittgenstein and applying it to contemporary problems.'
      },
      {
        title: 'When Words Are Called For',
        author: 'Avner Baz',
        year: '2012',
        description: 'Applies Wittgensteinian contextualism to critiques of contemporary philosophy of language.'
      }
    ]
  },
  { 
    id: 'naturalistic',
    name: 'Naturalistic Reading', 
    color: '#6B7A8F',
    description: 'Connection to empirical psychology and natural science',
    longDescription: 'The Naturalistic Reading interprets Wittgenstein\'s philosophy as compatible with, or even anticipating, approaches in cognitive science and empirical psychology. While Wittgenstein was often critical of scientific approaches to philosophical problems, this reading suggests his insights about language, rule-following, and mind can inform and be informed by natural scientific research.',
    keyAuthors: [
      {
        name: 'P.M.S. Hacker',
        description: 'While critical of some naturalistic approaches, Hacker has explored connections between Wittgenstein\'s philosophy and topics in neuroscience and cognitive psychology.',
        notable_works: ['Philosophical Foundations of Neuroscience (2003, with M.R. Bennett)', 'Human Nature: The Categorical Framework (2007)']
      },
      {
        name: 'Danièle Moyal-Sharrock',
        description: 'Moyal-Sharrock has explored naturalistic themes in Wittgenstein\'s later work, particularly On Certainty.',
        notable_works: ['Understanding Wittgenstein\'s On Certainty (2004)', 'The Third Wittgenstein (2004)']
      }
    ],
    keyPublications: [
      {
        title: 'Philosophical Foundations of Neuroscience',
        author: 'M.R. Bennett and P.M.S. Hacker',
        year: '2003',
        description: 'Applies Wittgensteinian conceptual analysis to contemporary neuroscience.'
      },
      {
        title: 'The Third Wittgenstein: The Post-Investigations Works',
        author: 'Danièle Moyal-Sharrock (ed.)',
        year: '2004',
        description: 'Explores Wittgenstein\'s later writings with attention to naturalistic themes.'
      }
    ]
  },
  { 
    id: 'post-analytic',
    name: 'Post-Analytic Reading', 
    color: '#A37C27',
    description: 'Connecting Wittgenstein to continental philosophy',
    longDescription: 'The Post-Analytic Reading interprets Wittgenstein as bridging the divide between analytic and continental philosophy. This approach draws connections between Wittgenstein\'s work and themes in phenomenology, hermeneutics, critical theory, and poststructuralism. It emphasizes aspects of Wittgenstein\'s thought that exceed narrowly logical or linguistic concerns, such as his interest in practices, forms of life, and the limits of philosophy.',
    keyAuthors: [
      {
        name: 'Richard Rorty',
        description: 'Rorty positioned Wittgenstein as a post-metaphysical thinker who helped move philosophy beyond traditional analytic concerns.',
        notable_works: ['Contingency, Irony, and Solidarity (1989)', 'Essays on Heidegger and Others (1991)']
      },
      {
        name: 'Stanley Cavell',
        description: 'Cavell developed readings of Wittgenstein that engage deeply with literature, film, and continental thought.',
        notable_works: ['The Claim of Reason (1979)', 'This New Yet Unapproachable America (1989)']
      }
    ],
    keyPublications: [
      {
        title: 'The New Wittgenstein',
        author: 'Alice Crary and Rupert Read (eds.)',
        year: '2000',
        description: 'Contains essays that connect Wittgenstein to post-analytic approaches.'
      },
      {
        title: 'The Claim of Reason',
        author: 'Stanley Cavell',
        year: '1979',
        description: 'A landmark work that bridges Wittgensteinian philosophy with broader cultural and continental concerns.'
      }
    ]
  },
  { 
    id: 'ethical',
    name: 'Ethical Reading', 
    color: '#7395AE',
    description: 'Centrality of ethics and the mystical in Wittgenstein\'s thought',
    longDescription: 'The Ethical Reading emphasizes the centrality of ethics in Wittgenstein\'s philosophy, despite his limited explicit writing on ethics. This approach interprets his philosophical method as fundamentally ethical in purpose, aiming to help us see the world "aright" and achieve ethical clarity about our lives. It connects Wittgenstein\'s famous remark that "ethics and aesthetics are one" to his broader philosophical project.',
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
  },
  { 
    id: 'transaction',
    name: 'Transaction Theory', 
    color: '#9CAF88',
    description: 'Understanding meaning creation through transaction processes',
    longDescription: 'Transaction Theory draws on Wittgenstein\'s later philosophy to understand how meaning emerges through transactional processes between agents and their environments. This approach emphasizes the dynamic, contextual, and social nature of meaning-making, seeing linguistic meaning as arising from interactions rather than from static representations or rules. It connects Wittgenstein\'s insights to contemporary work in enactive and embodied cognition.',
    keyAuthors: [
      {
        name: 'John Dewey',
        description: 'Though predating Wittgenstein\'s later work, Dewey\'s transactional approach to experience shares important themes with Wittgenstein\'s philosophy.',
        notable_works: ['Experience and Nature (1925)', 'Knowing and the Known (1949, with Arthur Bentley)']
      },
      {
        name: 'Roger Hunt',
        description:'A Recent Transactionalist depictions of Wittgenstein\'s philosophy', 
          notable_works: ['The Language of Transaction: A Perspective on Wittgenstein (2025)'],
          link: 'https://github.com/rogerHuntGauntlet/Second-Brain/blob/0d833a9d37c7b595c020be83340ea98a688cd487/Witt-Trans/combined_manuscript.md'
      }
    ],
    keyPublications: [
      {
        title: 'Knowing and the Known',
        author: 'John Dewey and Arthur Bentley',
        year: '1949',
        description: 'A foundational work in transaction theory that shares themes with Wittgenstein\'s later philosophy.'
      },
      {
        title: 'The Embodied Mind',
        author: 'Francisco Varela, Evan Thompson, and Eleanor Rosch',
        year: '1991',
        description: 'Connects enactive approaches to cognition with Wittgensteinian themes about language and meaning.'
      }
    ]
  }
];

interface AboutSectionProps {}

export const AboutSection: React.FC<AboutSectionProps> = () => {
  // State for selected framework and modal
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);

  // Function to handle clicking on a framework
  const handleFrameworkClick = (framework: Framework) => {
    console.log('Framework clicked:', framework.name);
    setSelectedFramework(framework);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedFramework(null);
  };

  return (
    <section id="about" className={styles.aboutSection}>
      <h2 className={styles.sectionTitle}>About the Wittgenstein Interpretation Explorer</h2>
      
      <div className={styles.aboutContent}>
        <div className={styles.aboutCard}>
          <h3 className={styles.cardTitle}>Purpose</h3>
          <p className={styles.cardText}>
            The Wittgenstein Interpretation Explorer provides users with an interactive way to explore
            Wittgenstein's philosophical ideas through multiple interpretative frameworks. By leveraging
            advanced AI technology, the application makes complex philosophical concepts more accessible
            and helps users understand different perspectives on Wittgenstein's work.
          </p>
        </div>
        
        <div className={styles.aboutCard}>
          <h3 className={styles.cardTitle}>How It Works</h3>
          <p className={styles.cardText}>
            When you ask a question, our system processes it through the following steps:
          </p>
          <ol className={styles.processList}>
            <li className={styles.processStep}>
              <strong>Query Processing:</strong> Your question is analyzed to understand the philosophical concepts involved.
            </li>
            <li className={styles.processStep}>
              <strong>Passage Retrieval:</strong> Relevant passages from Wittgenstein's works are found using vector search technology.
            </li>
            <li className={styles.processStep}>
              <strong>Multi-Framework Interpretation:</strong> The passages are interpreted through nine different philosophical frameworks.
            </li>
            <li className={styles.processStep}>
              <strong>Transaction Theory Integration:</strong> Connections to Transaction Theory are identified and highlighted.
            </li>
            <li className={styles.processStep}>
              <strong>Response Synthesis:</strong> The interpretations are summarized and presented in an accessible format.
            </li>
          </ol>
        </div>
        
        <div className={styles.aboutCard}>
          <h3 className={styles.cardTitle}>Technology</h3>
          <p className={styles.cardText}>
            The Wittgenstein Interpretation Explorer combines several advanced technologies:
          </p>
          <ul className={styles.techList}>
            <li className={styles.techItem}>
              <strong>Vector Database:</strong> Stores and retrieves passages using semantic similarity.
            </li>
            <li className={styles.techItem}>
              <strong>Retrieval-Augmented Generation (RAG):</strong> Combines retrieved passages with AI generation for accurate responses.
            </li>
            <li className={styles.techItem}>
              <strong>Large Language Models:</strong> Analyze and interpret philosophical content through multiple frameworks.
            </li>
          </ul>
        </div>
      </div>
      
      <div id="frameworks" className={styles.frameworksSection}>
        <h3 className={styles.frameworksTitle}>Interpretative Frameworks</h3>
        <p className={styles.frameworksDescription}>
          Click on a framework to learn more about different approaches to interpreting Wittgenstein's philosophy:
        </p>
        <div className={styles.frameworksGrid}>
          {FRAMEWORKS.map((framework) => (
            <div 
              key={framework.id} 
              className={styles.frameworkBadge}
              style={{ backgroundColor: framework.color }}
              onClick={() => handleFrameworkClick(framework)}
            >
              {framework.name}
              <span className={styles.viewIndicator}>Click for details</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Framework Details Modal */}
      {selectedFramework && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>×</button>
            <h2 className={styles.modalTitle}>{selectedFramework.name}</h2>
            
            <div className={styles.modalSection}>
              <h3>Overview</h3>
              <p>{selectedFramework.longDescription}</p>
            </div>
            
            <div className={styles.modalSection}>
              <h3>Key Authors</h3>
              <div className={styles.authorsGrid}>
                {selectedFramework.keyAuthors.map((author, index) => (
                  <div key={index} className={styles.authorCard}>
                    <h4>{author.name}</h4>
                    <p>{author.description}</p>
                    {author.notable_works && author.notable_works.length > 0 && (
                      <div>
                        <h5>Notable works:</h5>
                        <ul>
                          {author.notable_works.map((work, idx) => (
                            <li key={idx}>{work}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {author.link && (
                      <div className={styles.authorLinks}>
                        <h5>Links:</h5>
                        <a 
                          href={author.link}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.authorLink}
                        >
                          View Manuscript
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.modalSection}>
              <h3>Key Publications</h3>
              <div className={styles.publicationsGrid}>
                {selectedFramework.keyPublications.map((pub, index) => (
                  <div key={index} className={styles.publicationCard}>
                    <h4>{pub.title} ({pub.year})</h4>
                    <p className={styles.publicationAuthor}>by {pub.author}</p>
                    <p>{pub.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Also export as default for flexibility
export default AboutSection; 