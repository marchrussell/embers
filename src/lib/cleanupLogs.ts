/**
 * Utility to remove all console.logs in production
 * This significantly improves performance by removing I/O operations
 */

// Override console methods in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  // Keep console.warn and console.error for important messages
}

export {}; // Make this a module
