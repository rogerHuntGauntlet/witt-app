import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Wittgenstein Interpretation Explorer</h3>
            <p className={styles.footerText}>
              Explore Wittgenstein's philosophical ideas through multiple interpretative frameworks,
              powered by advanced AI and vector search technology.
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Technology</h3>
            <p className={styles.footerText}>
              This application uses a vector database embedded with Wittgenstein's writings for semantic search capabilities.
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Privacy</h3>
            <p className={styles.footerText}>
              We respect your privacy. We do not track, store, or share any user data or queries.
              All interactions are processed locally.
            </p>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} Wittgenstein Interpretation Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Also export as default for flexibility
export default Footer; 