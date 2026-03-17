import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import apiRouter from './routes';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

dotenv.config();

// Export the io instance so it can be used in controllers
export let io: Server;

// Export setupSocket so it can be used by Vite dev server
export function setupSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow all origins for development
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function createServer() {
  connectDatabase();
  const app = express();

  // Create HTTP server to attach Socket.io (for production)
  const httpServer = createHttpServer(app);

  // Initialize Socket.io (this will be overwritten in dev mode by setupSocket called from vite.config)
  setupSocket(httpServer);

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api', apiRouter);

  // Error Handling Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
  });

  // Attach httpServer to app for production usage
  (app as any).httpServer = httpServer;

  return app;
}