import type React from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const _outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "decosa - Share your thoughts",
	description: "A minimalist social platform for sharing articles and ideas",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`font-outfit antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange={false}
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
