"use client";

import type React from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Home, User, Moon, Sun, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

interface HeaderProps {
	onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
	const { theme, setTheme } = useTheme();
	const { user, signOut } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");
	const [mounted, setMounted] = useState(false);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	// Prevent hydration mismatch by only rendering theme toggle after mount
	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);

		// Debounce: annuler le timer précédent
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		// Créer un nouveau timer
		debounceTimer.current = setTimeout(() => {
			onSearch?.(query);
		}, 500); // Attendre 500ms après la dernière frappe
	};

	// Nettoyer le timer au démontage
	useEffect(() => {
		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		};
	}, []);

	return (
		<motion.header
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="sticky top-0 z-50 w-full glass-strong border-b border-border/50"
		>
			<div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
				{/* Logo */}
				<Link href="/">
					<img src="/logo.png" alt="decosa" width={100} height={100} />
				</Link>

				<div className="flex-1 max-w-md mx-8 hidden md:block">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							value={searchQuery}
							onChange={handleSearchChange}
							placeholder="Search posts..."
							className="pl-9 glass border-border/50"
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<Link href="/">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button variant="ghost" size="icon" className="rounded-full">
								<Home className="h-5 w-5" />
							</Button>
						</motion.div>
					</Link>

					<Link href="/create">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="default"
								size="icon"
								className="rounded-full bg-gradient-to-br from-primary to-accent"
							>
								<PenSquare className="h-5 w-5" />
							</Button>
						</motion.div>
					</Link>

					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Button variant="ghost" size="icon" className="rounded-full">
										<User className="h-5 w-5" />
									</Button>
								</motion.div>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="glass-strong">
								<DropdownMenuItem asChild>
									<Link href="/profile/me">My Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={signOut}
									className="text-destructive"
								>
									<LogOut className="h-4 w-4 mr-2" />
									Sign Out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Link href="/login">
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Button variant="ghost" size="icon" className="rounded-full">
									<User className="h-5 w-5" />
								</Button>
							</motion.div>
						</Link>
					)}

					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full relative"
							onClick={toggleTheme}
						>
							{mounted ? (
								<AnimatePresence mode="wait" initial={false}>
									{theme === "dark" ? (
										<motion.div
											key="moon"
											initial={{ rotate: 90, scale: 0 }}
											animate={{ rotate: 0, scale: 1 }}
											exit={{ rotate: -90, scale: 0 }}
											transition={{ duration: 0.2 }}
										>
											<Moon className="h-5 w-5" />
										</motion.div>
									) : (
										<motion.div
											key="sun"
											initial={{ rotate: -90, scale: 0 }}
											animate={{ rotate: 0, scale: 1 }}
											exit={{ rotate: 90, scale: 0 }}
											transition={{ duration: 0.2 }}
										>
											<Sun className="h-5 w-5" />
										</motion.div>
									)}
								</AnimatePresence>
							) : (
								<div className="h-5 w-5" />
							)}
						</Button>
					</motion.div>
				</div>
			</div>
		</motion.header>
	);
}
