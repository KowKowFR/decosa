import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.s3.*.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "*.s3.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "decosa-storage.s3.eu-west-3.amazonaws.com",
			},
		],
	},
};

export default nextConfig;
