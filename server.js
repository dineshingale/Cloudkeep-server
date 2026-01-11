// Shim for Render deployment
// Render defaults to 'node server.js' if not configured otherwise.
// This redirects to the compiled TypeScript output.
require('./dist/server.js');
