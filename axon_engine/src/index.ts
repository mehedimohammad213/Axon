import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Headless Engine Express running on http://localhost:${PORT}`);
});

export default app;
