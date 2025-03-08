import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout';
import styles from '../styles/Home.module.css';

export default function Contribute() {
  return (
    <>
      <Head>
        <title>Contribute - Wittgenstein Interpretation Explorer</title>
        <meta name="description" content="Learn how to contribute to the Wittgenstein Interpretation Explorer project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <section className={styles.heroSection}>
          <h1 className={styles.title}>Contributing to Witt App</h1>
          <p className={styles.description}>
            Help us improve the Wittgenstein Interpretation Explorer by contributing to the project.
            We welcome contributions of all kinds, from code to documentation.
          </p>
        </section>

        <section className={styles.mainContent}>
          <h2>Ways to Contribute</h2>
          <div className={styles.contributionTypes}>
            <div className={styles.contributionCard}>
              <h3>🐛 Report Bugs</h3>
              <p>Found a bug? Open an issue on GitHub with:</p>
              <ul>
                <li>Clear description of the problem</li>
                <li>Steps to reproduce</li>
                <li>Expected vs actual behavior</li>
                <li>Screenshots if applicable</li>
              </ul>
            </div>

            <div className={styles.contributionCard}>
              <h3>💡 Suggest Features</h3>
              <p>Have an idea for improvement? Create a feature request with:</p>
              <ul>
                <li>Clear description of the feature</li>
                <li>Use cases and benefits</li>
                <li>Potential implementation approach</li>
                <li>Impact on existing functionality</li>
              </ul>
            </div>

            <div className={styles.contributionCard}>
              <h3>📝 Improve Documentation</h3>
              <p>Help make our docs better by:</p>
              <ul>
                <li>Fixing typos and errors</li>
                <li>Adding missing information</li>
                <li>Clarifying confusing sections</li>
                <li>Adding examples and use cases</li>
              </ul>
            </div>

            <div className={styles.contributionCard}>
              <h3>💻 Submit Code</h3>
              <p>Want to write code? Here's how:</p>
              <ul>
                <li>Fork the repository</li>
                <li>Create a feature branch</li>
                <li>Write clean, documented code</li>
                <li>Submit a pull request</li>
              </ul>
            </div>
          </div>

          <h2>Development Setup</h2>
          <div className={styles.codeBlock}>
            <pre>
              <code>
{`# Clone the repository
git clone https://github.com/rogerHuntGauntlet/witt-app.git
cd witt-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev`}
              </code>
            </pre>
          </div>

          <h2>Project Structure</h2>
          <div className={styles.codeBlock}>
            <pre>
              <code>
{`witt-app/
├── documentation/    # Project documentation
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   ├── lib/         # Utility functions
│   ├── pages/       # Next.js pages
│   ├── scripts/     # Utility scripts
│   └── styles/      # CSS styles
└── ...`}
              </code>
            </pre>
          </div>

          <h2>Guidelines</h2>
          <div className={styles.guidelines}>
            <h3>Code Style</h3>
            <ul>
              <li>Use TypeScript for type safety</li>
              <li>Follow the existing code style</li>
              <li>Write clear, documented code</li>
              <li>Include tests for new features</li>
            </ul>

            <h3>Commit Messages</h3>
            <p>Follow conventional commits format:</p>
            <ul>
              <li><code>feat: add new feature</code></li>
              <li><code>fix: resolve bug</code></li>
              <li><code>docs: update documentation</code></li>
              <li><code>style: format code</code></li>
            </ul>

            <h3>Pull Requests</h3>
            <ul>
              <li>Create focused, single-purpose PRs</li>
              <li>Include clear descriptions</li>
              <li>Reference related issues</li>
              <li>Update documentation as needed</li>
            </ul>
          </div>

          <div className={styles.getStarted}>
            <h2>Ready to Contribute?</h2>
            <p>
              Check out our <a href="https://github.com/rogerHuntGauntlet/witt-app" target="_blank" rel="noopener noreferrer">GitHub repository</a> to get started.
              Make sure to read our <a href="https://github.com/rogerHuntGauntlet/witt-app/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer">Code of Conduct</a> and
              <a href="https://github.com/rogerHuntGauntlet/witt-app/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contributing Guidelines</a> before making your contribution.
            </p>
          </div>
        </section>
      </Layout>
    </>
  );
} 