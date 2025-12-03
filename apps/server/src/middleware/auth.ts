import type { Context, Next } from "hono";
import { auth } from "@decosa/auth";

export async function requireAuth(c: Context, next: Next) {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session?.user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	// Ajouter l'utilisateur au contexte
	c.set("user", session.user);
	if (session.session) {
		c.set("session", session.session);
	}

	await next();
}

export async function optionalAuth(c: Context, next: Next) {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (session?.user) {
		c.set("user", session.user);
		if (session.session) {
			c.set("session", session.session);
		}
	}

	await next();
}
