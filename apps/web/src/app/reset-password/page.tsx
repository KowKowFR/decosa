"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const tokenParam = searchParams.get("token");
		if (tokenParam) {
			setToken(tokenParam);
		}
	}, [searchParams]);

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			toast({
				title: "Error",
				description: "Passwords don't match!",
				variant: "destructive",
			});
			return;
		}
		if (!token) {
			toast({
				title: "Error",
				description: "Invalid reset token",
				variant: "destructive",
			});
			return;
		}
		try {
			setLoading(true);
			await authClient.resetPassword({
				token,
				newPassword: password,
			});
			setIsSuccess(true);
			toast({
				title: "Success",
				description: "Password reset successfully!",
			});
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to reset password",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="relative w-full max-w-md text-center"
				>
					<div className="glass-strong rounded-2xl p-12">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
							className="flex justify-center mb-6"
						>
							<CheckCircle2 className="h-20 w-20 text-primary" />
						</motion.div>
						<h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Password Reset Successful!
						</h1>
						<p className="text-muted-foreground mb-6">
							Your password has been successfully reset. Redirecting to login...
						</p>
					</div>
				</motion.div>
			</div>
		);
	}

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
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 300 }}
							className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4"
						>
							<span className="text-primary-foreground font-bold text-3xl">
								d
							</span>
						</motion.div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Reset Password
						</h1>
						<p className="text-muted-foreground mt-2 text-center">
							Enter your new password below
						</p>
					</div>

					{/* Reset Password Form */}
					<form onSubmit={handleResetPassword} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password">New Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="glass border-border/50 h-11"
								required
								minLength={8}
							/>
							<p className="text-xs text-muted-foreground">
								Must be at least 8 characters
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm New Password</Label>
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
								disabled={loading || !token}
							>
								{loading ? "Resetting..." : "Reset Password"}
							</Button>
						</motion.div>
					</form>

					{/* Back to Login Link */}
					<p className="text-center text-sm text-muted-foreground mt-6">
						Remember your password?{" "}
						<Link
							href="/login"
							className="text-primary hover:underline font-medium"
						>
							Back to login
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
