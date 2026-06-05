import express from 'express';
import cors from 'cors';
import subjectsRouter from './routes/subject.js';

const app = express();
const port = 8000;

if(!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL is not set in .env file');
}

app.use(cors({
  origin: process.env.FRONTEND_URL,
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
