"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
	const [forgotEmail, setForgotEmail] = useState("");
	const [forgotLoading, setForgotLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			await authClient.signIn.email({
				email,
				password,
			});
			toast({
				title: "Success",
				description: "Logged in successfully!",
			});
			router.push("/");
		} catch (err) {
			toast({
				title: "Error",
				description: err instanceof Error ? err.message : "Failed to login",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleGitHubLogin = async () => {
		try {
			await authClient.signIn.social({
				provider: "github",
				callbackURL: `${window.location.origin}/`,
			});
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to login with GitHub",
				variant: "destructive",
			});
		}
	};

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setForgotLoading(true);
			await authClient.requestPasswordReset({
				email: forgotEmail,
				redirectTo: `${window.location.origin}/reset-password`,
			});
			toast({
				title: "Success",
				description: "Password reset email sent!",
			});
			setIsForgotPasswordOpen(false);
			setForgotEmail("");
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to send reset email",
				variant: "destructive",
			});
		} finally {
			setForgotLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
			{/* Background Gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

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
							whileHover={{ scale: 1.05, rotate: 5 }}
							transition={{ type: "spring", stiffness: 300 }}
							className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4"
						>
							<span className="text-primary-foreground font-bold text-3xl">
								d
							</span>
						</motion.div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Welcome to decosa
						</h1>
						<p className="text-muted-foreground mt-2 text-center">
							Sign in to share your thoughts with the community
						</p>
					</div>

					{/* Social Login */}
					<div className="mb-6">
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button
								variant="outline"
								className="w-full gap-2 h-11 bg-transparent"
								size="lg"
								onClick={handleGitHubLogin}
							>
								<Github className="h-5 w-5" />
								Continue with GitHub
							</Button>
						</motion.div>
					</div>

					<div className="relative mb-6">
						<Separator />
						<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
							or continue with email
						</span>
					</div>

					{/* Email Login Form */}
					<form onSubmit={handleLogin} className="space-y-4">
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
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<button
									type="button"
									onClick={() => setIsForgotPasswordOpen(true)}
									className="text-xs text-primary hover:underline"
								>
									Forgot password?
								</button>
							</div>
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

						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button
								type="submit"
								className="w-full h-11 bg-gradient-to-br from-primary to-accent"
								size="lg"
								disabled={loading}
							>
								{loading ? "Signing in..." : "Sign In"}
							</Button>
						</motion.div>
					</form>

					{/* Sign Up Link */}
					<p className="text-center text-sm text-muted-foreground mt-6">
						Don't have an account?{" "}
						<Link
							href="/register"
							className="text-primary hover:underline font-medium"
						>
							Sign up
						</Link>
					</p>
				</div>
			</motion.div>

			<Dialog
				open={isForgotPasswordOpen}
				onOpenChange={setIsForgotPasswordOpen}
			>
				<DialogContent className="glass-strong max-w-md">
					<DialogHeader>
						<DialogTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Reset Password
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleForgotPassword} className="space-y-4 pt-4">
						<p className="text-sm text-muted-foreground">
							Enter your email address and we'll send you a link to reset your
							password.
						</p>
						<div className="space-y-2">
							<Label htmlFor="forgot-email">Email</Label>
							<Input
								id="forgot-email"
								type="email"
								value={forgotEmail}
								onChange={(e) => setForgotEmail(e.target.value)}
								placeholder="you@example.com"
								className="glass border-border/50 h-11"
								required
							/>
						</div>
						<div className="flex gap-3">
							<Button
								type="submit"
								className="flex-1 bg-gradient-to-br from-primary to-accent"
								disabled={forgotLoading}
							>
								{forgotLoading ? "Sending..." : "Send Reset Link"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsForgotPasswordOpen(false)}
								className="flex-1 bg-transparent"
							>
								Cancel
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
