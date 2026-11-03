import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ======================================================

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// ======================================================
// BOOTSTRAP SERVER
// ======================================================

async function bootstrap() {
  try {
    // Import modules after dotenv configuration
    const { default: app } = await import("./app.js");

    const { getPool } = await import("./config/db.js");

    const PORT = process.env.PORT || 5000;

    // Initialize database connection
    await getPool();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log("\n====================================");
      console.log("🌸 NIHONGO N5 BACKEND");
      console.log("====================================");

      console.log(`🚀 Server: http://localhost:${PORT}`);

      console.log(`💚 Health: http://localhost:${PORT}/api/health`);

      console.log(
        `🌐 Client: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
      );

      console.log("====================================\n");
    });

    // ==================================================
    // GRACEFUL SHUTDOWN
    // ==================================================

    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}, shutting down...`);

      server.close(async () => {
        try {
          const pool = await getPool();

          if (pool.end) {
            await pool.end();
          }

          console.log("HTTP server closed.");

          process.exit(0);
        } catch (error) {
          console.error("Shutdown error:", error);

          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Fatal error during server bootstrap:", error);

    process.exit(1);
  }
}

bootstrap();
