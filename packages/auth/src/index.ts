import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@decosa/db";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3001"],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID || "Ov23liVNP0BBmgkkyPie",
			clientSecret:
				process.env.GITHUB_CLIENT_SECRET ||
				"957787fb28225d5c58adc6ec4acf9df4b9930374",
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: isProduction ? "none" : "lax",
			secure: isProduction,
			httpOnly: true,
		},
	},
});
