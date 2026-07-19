// app.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Wires up the Express application: middleware, routes, error handling.
// Kept separate from server.js so the app object can be imported directly
// in tests (supertest) without binding a real port.
// -----------------------------------------------------------------------------
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import audioRoutes from './routes/audio.routes.js';
import historyRoutes from './routes/history.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
