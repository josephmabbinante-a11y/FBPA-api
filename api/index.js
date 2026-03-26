// Vercel serverless function entry point.
// Re-exports the Express app so Vercel recognises this as a function
// (functions must live in the api/ directory to be auto-detected by Vercel).
export { default } from '../index.js';
