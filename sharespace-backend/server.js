import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectToDatabase } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Global middlewares
const corsOptions = {
  origin: true, // reflect request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Root and health checks
app.get('/', (req, res) => {
  return res.status(200).json({ status: 'ok', service: 'sharespace-backend' });
});
// Health check
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok', service: 'sharespace-backend' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  return res.status(404).json({ message: 'Route not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const details = Object.values(err.errors || {}).map((e) => e.message);
    message = details.length ? details.join(', ') : 'Validation error';
  }

  // Mongo duplicate key (e.g., unique email)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already registered';
  }

  if (process.env.NODE_ENV !== 'test') {
    // Only log in non-test environments
    // eslint-disable-next-line no-console
    console.error('Error:', err);
  }
  return res.status(statusCode).json({ message });
});

// Validate required environment variables early
const { PORT = 5000, MONGO_URI, JWT_SECRET } = process.env;
if (!MONGO_URI) {
  // eslint-disable-next-line no-console
  console.error('Environment error: MONGO_URI is not set. Create a .env with MONGO_URI.');
  process.exit(1);
}
if (!JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.error('Environment error: JWT_SECRET is not set. Create a .env with JWT_SECRET.');
  process.exit(1);
}

// Start server after DB connection
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server due to DB error:', error);
    process.exit(1);
  });

export default app;

