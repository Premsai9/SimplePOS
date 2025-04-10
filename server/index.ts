import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve on port 5000 first, then fallback to other ports if needed
  // this serves both the API and the client.
  let port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const alternativePorts = [3000, 8000, 8080, 4000];
  
  const startServer = (portToUse: number, portIndex = 0) => {
    server.listen(portToUse, () => {
      log(`serving on port ${portToUse}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' && portIndex < alternativePorts.length) {
        // Try the next port in the list
        const nextPort = alternativePorts[portIndex];
        log(`Port ${portToUse} in use, trying ${nextPort}...`);
        startServer(nextPort, portIndex + 1);
      } else {
        log(`Failed to start server: ${err.message}`);
        process.exit(1);
      }
    });
  };
  
  startServer(port);
})();
