import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

interface ApiKeyInputProps {
  onApiKeyChange: (key: string | null) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isUsingCustomKey, setIsUsingCustomKey] = useState(false);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    onApiKeyChange(newKey || null);
  };

  const handleToggleCustomKey = () => {
    const newIsUsingCustomKey = !isUsingCustomKey;
    setIsUsingCustomKey(newIsUsingCustomKey);
    if (!newIsUsingCustomKey) {
      setApiKey('');
      onApiKeyChange(null); // Reset to default API key
    }
  };

  return (
    <div className={styles.apiKeySection}>
      <div className={styles.apiKeyInfo}>
        <h3>API Key Configuration</h3>
        <p>
          By default, we use a shared API key from <a href="https://gauntletai.com" target="_blank" rel="noopener noreferrer">GauntletAI</a> for the language model.
          
        </p>
        <div className={styles.privacyNote}>
          <p>
            <strong>Privacy Note:</strong> We do not store, track, or log any API keys or queries.
            Your key is only used for the current session and is never saved.
          </p>
        </div>
      </div>

      <div className={styles.apiKeyToggle}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={isUsingCustomKey}
            onChange={handleToggleCustomKey}
            className={styles.toggleCheckbox}
          />
          Use my own OpenAI API key
        </label>
      </div>

      {isUsingCustomKey && (
        <div className={styles.apiKeyInput}>
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your OpenAI API key"
            className={styles.input}
            spellCheck="false"
            autoComplete="off"
          />
          <p className={styles.apiKeyHint}>
            Get your API key from{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              OpenAI's platform
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput; 