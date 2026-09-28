import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 6006;

app.listen(PORT, () => {
  console.log(`Axon Engine Express running on http://localhost:${PORT}`);
});

export default app;
