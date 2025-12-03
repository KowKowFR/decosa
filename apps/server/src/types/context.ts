import type { User, Session } from "better-auth/types";

declare module "hono" {
	interface ContextVariableMap {
		user: User;
		session?: Session;
		validatedBody: unknown;
		validatedQuery: unknown;
		validatedParams: unknown;
	}
}
