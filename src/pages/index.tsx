import React, { useState } from 'react';
import Head from 'next/head';
import { ChatInterface } from '../components/chat';
import Layout from '../components/layout';
import { AboutSection } from '../components/about';
import ApiKeyInput from '../components/ApiKeyInput';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);

  const handleApiKeyChange = (apiKey: string | null) => {
    setCustomApiKey(apiKey);
  };

  return (
    <>
      <Head>
        <title>Wittgenstein Interpretation Explorer</title>
        <meta name="description" content="Explore Wittgenstein's ideas through multiple interpretative frameworks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <section className={styles.heroSection}>
          <h1 className={styles.title}>Wittgenstein Interpretation Explorer</h1>
          <p className={styles.description}>
            Explore Wittgenstein's philosophical ideas through multiple interpretative frameworks,
            powered by advanced AI and vector search technology.
          </p>
          <div className={styles.processDiagram}>
            <p className={styles.processSummary}>
              Ask questions about Wittgenstein's philosophy and receive interpretations through different frameworks.
            </p>
            <div className={styles.privacyNote}>
              <p>
                This application uses a vector database embedded with Wittgenstein's writings.
                <strong> We do not track or store any user data or queries.</strong>
              </p>
            </div>
          </div>
        </section>
        
        <AboutSection />
        <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
        <ChatInterface customApiKey={customApiKey} />
      </Layout>
    </>
  );
} 