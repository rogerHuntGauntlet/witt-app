import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Wittgenstein Explorer</span>
        </Link>
        
        <button 
          className={styles.menuToggle} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
          <span className={styles.menuBar}></span>
        </button>
        
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/contribute" className={styles.navLink}>
                Contribute
              </Link>
            </li>
            <li className={styles.navItem}>
              <a 
                href="mailto:rhunt@bentley.edu" 
                className={styles.navLink}
                title="Contact Me"
                onClick={(e) => {
                  // Ensure proper opening of email client
                  const email = "rhunt@bentley.edu";
                  const mailtoLink = `mailto:${email}?subject=Question about Wittgenstein Explorer`;
                  window.location.href = mailtoLink;
                  e.preventDefault(); // Prevent default to ensure our custom mailto works
                }}
              >
                Contact Me
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

// Also export as default for flexibility
export default Header; 