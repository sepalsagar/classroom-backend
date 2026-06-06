import express from 'express';
import cors from 'cors';
import subjectsRouter from './routes/subject.js';

const app = express();
const port = 8000;

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
  ].filter((origin): origin is string => Boolean(origin))
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json());
app.use('/api/subjects', subjectsRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Classroom API is running.' });
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
