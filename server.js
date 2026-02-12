import express from 'express';
import app from './backend/app.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const port = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/dist')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
} else {
  app.get('/', (req, res) => res.send('API is running...'));
}

app.listen(port, () => console.log('Server is running on port ' + port));
