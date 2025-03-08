# Contributing to Witt App

Thank you for considering contributing to Witt App! This document outlines the process for contributing to the project and provides guidelines to help make your contribution experience smooth and effective.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project administrators.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the existing issues to see if the problem has already been reported. If it hasn't, create a new issue using the bug report template and include as many details as possible.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Create a new issue using the feature request template and provide the following information:

- A clear and descriptive title
- A detailed description of the suggested enhancement
- Explain why this enhancement would be useful to most users
- List any potential drawbacks or challenges

### Pull Requests

- Fill in the required template
- Follow the [coding guidelines](#coding-guidelines)
- Include relevant tests for your changes
- Update documentation as needed
- Ensure the CI build passes

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/witt-app.git
   cd witt-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to add your API keys (required for full functionality).

5. Run the development server:
   ```bash
   npm run dev
   ```

## Pull Request Process

1. Update the README.md or documentation with details of changes if appropriate
2. Update the version number in package.json following [semantic versioning](https://semver.org/)
3. Submit your pull request with a clear description of the changes
4. Wait for code review and address any requested changes

Your pull request will be merged once it has been approved by a maintainer.

## Coding Guidelines

### TypeScript & React

The project follows best practices for TypeScript and React. Some key points:

- Use functional components with hooks
- Define explicit interfaces for all component props
- Avoid using `any` type where possible
- Follow React best practices for performance optimization
- Keep components focused and small (< 300 lines)

### Component Structure

Components should follow this general structure:

```tsx
// Imports
import React from 'react';
import type { ComponentProps } from './types';

// Component interface
interface Props {
  // Define props here
}

// Component definition
export const ComponentName: React.FC<Props> = ({ 
  // Destructure props here
}) => {
  // 1. Hooks
  // 2. Event handlers
  // 3. Return JSX
  
  return (
    // JSX here
  );
};
```

### CSS/Styling

- Use CSS modules for component-specific styles
- Follow a consistent naming convention for CSS classes
- Use Tailwind utility classes as appropriate

## Commit Message Guidelines

We use conventional commits to make our commit messages more readable and to automate versioning and release processes.

Format: `type(scope): subject`

Types:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

Example:
```
feat(search): add support for filtering by date range
```

---

Thank you for your contributions! 