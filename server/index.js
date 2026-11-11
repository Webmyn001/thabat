import './config/env.js';
import express from 'express';
import cors from 'cors';
import { initStore } from './data/store.js';
import authRoutes from './routes/auth.js';
import programRoutes from './routes/program.js';
import inspirationsRoutes from './routes/inspirations.js';
import certificatesRoutes from './routes/certificates.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize store and database
initStore();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/program', programRoutes);
app.use('/api/inspirations', inspirationsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    app: "THABĀT | ثبات",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[THABĀT Server] Running on http://localhost:${PORT}`);
});

export default app;
