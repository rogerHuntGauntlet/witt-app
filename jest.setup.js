// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => require('next-router-mock'))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
}) 