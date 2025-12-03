import type { Context, Next } from "hono";
import { z } from "zod";

export function validateBody<T extends z.ZodType>(schema: T) {
	return async (c: Context, next: Next) => {
		try {
			const body = await c.req.json();
			const validated = schema.parse(body);
			c.set("validatedBody", validated);
			await next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return c.json(
					{
						error: "Validation error",
						details: error.issues,
					},
					400
				);
			}
			return c.json({ error: "Invalid request body" }, 400);
		}
	};
}

export function validateQuery<T extends z.ZodType>(schema: T) {
	return async (c: Context, next: Next) => {
		try {
			const queryParams = c.req.query();
			const query: Record<string, string> = {};
			for (const [key, value] of Object.entries(queryParams)) {
				query[key] = value;
			}
			const validated = schema.parse(query);
			c.set("validatedQuery", validated);
			await next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return c.json(
					{
						error: "Validation error",
						details: error.issues,
					},
					400
				);
			}
			return c.json({ error: "Invalid query parameters" }, 400);
		}
	};
}

export function validateParams<T extends z.ZodType>(schema: T) {
	return async (c: Context, next: Next) => {
		try {
			const params = c.req.param();
			const validated = schema.parse(params);
			c.set("validatedParams", validated);
			await next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return c.json(
					{
						error: "Validation error",
						details: error.issues,
					},
					400
				);
			}
			return c.json({ error: "Invalid route parameters" }, 400);
		}
	};
}
