"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleGitHubRegister = async () => {
		try {
			await authClient.signIn.social({
				provider: "github",
				callbackURL: "/",
			});
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to register with GitHub",
				variant: "destructive",
			});
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast({
				title: "Error",
				description: "Passwords don't match!",
				variant: "destructive",
			});
			return;
		}
		try {
			setLoading(true);
			await authClient.signUp.email({
				email,
				password,
				name,
			});
			toast({
				title: "Success",
				description: "Account created successfully!",
			});
			router.push("/");
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to create account",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
			{/* Background Gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/10" />

			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="relative w-full max-w-md"
			>
				<div className="glass-strong rounded-2xl p-8 shadow-2xl">
					{/* Logo */}
					<div className="flex flex-col items-center mb-8">
						<motion.div
							whileHover={{ scale: 1.05, rotate: -5 }}
							transition={{ type: "spring", stiffness: 300 }}
							className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4"
						>
							<span className="text-primary-foreground font-bold text-3xl">
								d
							</span>
						</motion.div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Join decosa
						</h1>
						<p className="text-muted-foreground mt-2 text-center">
							Create your account and start sharing
						</p>
					</div>

					{/* Social Register */}
					<div className="mb-6">
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button
								variant="outline"
								className="w-full gap-2 h-11 bg-transparent"
								size="lg"
								onClick={handleGitHubRegister}
							>
								<Github className="h-5 w-5" />
								Continue with GitHub
							</Button>
						</motion.div>
					</div>

					<div className="relative mb-6">
						<Separator />
						<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
							or register with email
						</span>
					</div>

					{/* Register Form */}
					<form onSubmit={handleRegister} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Your Name"
								className="glass border-border/50 h-11"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="glass border-border/50 h-11"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="glass border-border/50 h-11"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm Password</Label>
							<Input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="••••••••"
								className="glass border-border/50 h-11"
								required
							/>
						</div>

						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button
								type="submit"
								className="w-full h-11 bg-gradient-to-br from-primary to-accent"
								size="lg"
								disabled={loading}
							>
								{loading ? "Creating account..." : "Create Account"}
							</Button>
						</motion.div>
					</form>

					{/* Sign In Link */}
					<p className="text-center text-sm text-muted-foreground mt-6">
						Already have an account?{" "}
						<Link
							href="/login"
							className="text-primary hover:underline font-medium"
						>
							Sign in
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
