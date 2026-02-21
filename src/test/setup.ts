/**
 * Test Setup
 * ===========
 *
 * Global test configuration and utilities.
 * Runs before every test file.
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup React components after each test
afterEach(() => {
  cleanup();
});

// Extend Vitest matchers with jest-dom
expect.extend({});
