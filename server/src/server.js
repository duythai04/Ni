import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { getPool } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Ensure DB connection is established
    await getPool();

    const server = app.listen(PORT, () => {
      console.log(`🌸 Nihongo N5 Backend running on port ${PORT}`);
      console.log(`🌸 Healthcheck: http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, gracefully shutting down...`);
        server.close(async () => {
          const pool = await getPool();
          if (pool.end) await pool.end();
          console.log('HTTP server closed.');
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error('Fatal error during server bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();
