import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { createServer, setupSocket } from './server';

// This is the final and complete configuration for your development environment.
export default defineConfig({
  plugins: [
    react(),
    // This custom plugin runs your Express.js API and your React app
    // together in a single server during development.
    {
      name: 'express-server',
      configureServer: async (server) => {
        server.middlewares.use(createServer());
        // Initialize Socket.io with Vite's HTTP server
        if (server.httpServer) {
          setupSocket(server.httpServer);
        }
      },
    },
  ],
  resolve: {
    alias: {
      // Make sure this path points to your source code folder (e.g., 'src' or 'client')
      "@": path.resolve(__dirname, "./client"),
    },
  },
  // FIX: This section restores your original server settings.
  server: {
    port: 8080, // This sets the port back to 8080.
    host: true,   // This makes the "Network" URL available again.
  },
});