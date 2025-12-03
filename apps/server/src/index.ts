import "dotenv/config";
import { auth } from "@decosa/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import routes from "./routes";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3001",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowHeaders: [
			"Content-Type",
			"Authorization",
			"Cookie",
			"Set-Cookie",
			"X-Requested-With",
		],
		credentials: true,
		exposeHeaders: ["Set-Cookie"],
	})
);

// Routes d'authentification better-auth
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Routes API
app.route("/api", routes);

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
