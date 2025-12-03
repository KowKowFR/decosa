"use client";

import type React from "react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Settings, Upload, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PostCard } from "@/components/post-card";
import Link from "next/link";

export default function MyProfilePage() {
	const { user: authUser, loading: authLoading } = useAuth("/login");
	const { toast } = useToast();
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [avatar, setAvatar] = useState("");
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [posts, setPosts] = useState<any[]>([]);
	const [postsLoading, setPostsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (authUser) {
			loadProfile();
			loadPosts();
		}
	}, [authUser]);

	const loadProfile = async () => {
		try {
			setLoading(true);
			const userData = await api.users.getCurrent();
			setName(userData.name || "");
			setBio(userData.bio || "");
			setAvatar(userData.image || "");
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to load profile",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const loadPosts = async () => {
		if (!authUser) return;
		try {
			setPostsLoading(true);
			const result = await api.users.getPosts(authUser.id);
			setPosts(result.posts || []);
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to load posts",
				variant: "destructive",
			});
		} finally {
			setPostsLoading(false);
		}
	};

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			// Uploader via le serveur (évite les problèmes CORS)
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "avatar");

			const result = await api.upload.uploadDirect(formData);

			if (!result || !result.url) {
				throw new Error("No URL returned from upload");
			}

			// Stocker l'URL publique simple dans la DB (pas l'URL pré-signée)
			// L'URL pré-signée est retournée pour l'affichage immédiat
			const urlToStore = result.publicUrl || result.url;
			await api.users.update({
				image: urlToStore,
			});

			// Mettre à jour l'état avec l'URL pré-signée pour l'affichage immédiat
			setAvatar(result.url);
			await loadProfile();

			toast({
				title: "Success",
				description: "Image uploaded successfully",
			});
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to upload image",
				variant: "destructive",
			});
		}
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			await api.users.update({
				name,
				bio,
				image: avatar || null,
			});
			toast({
				title: "Success",
				description: "Profile updated successfully!",
			});
			setIsEditOpen(false);
			loadProfile();
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to update profile",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	if (authLoading || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<Header />

			<main className="container mx-auto max-w-5xl px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="glass rounded-xl p-8 mb-8"
				>
					<div className="flex flex-col md:flex-row gap-6 items-start">
						<motion.div
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 300 }}
						>
							<Avatar
								className="h-32 w-32 border-4 border-border/50"
								key={avatar}
							>
								<AvatarImage
									src={avatar || "/placeholder-user.jpg"}
									alt={name}
									onError={(e) => {
										e.currentTarget.src = "/placeholder-user.jpg";
									}}
								/>
								<AvatarFallback className="text-4xl">
									{name[0] || "U"}
								</AvatarFallback>
							</Avatar>
						</motion.div>

						<div className="flex-1">
							<div className="flex items-start justify-between mb-4">
								<div>
									<h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
										{name}
									</h1>
									<p className="text-muted-foreground leading-relaxed">
										{bio || "No bio yet"}
									</p>
									<p className="text-sm text-muted-foreground mt-2">
										{authUser?.email}
									</p>
								</div>

								<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
									<DialogTrigger asChild>
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											<Button variant="outline" className="gap-2">
												<Settings className="h-4 w-4" />
												Edit Profile
											</Button>
										</motion.div>
									</DialogTrigger>
									<DialogContent className="glass-strong max-w-2xl max-h-[90vh] overflow-y-auto">
										<DialogHeader>
											<DialogTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
												Edit Profile
											</DialogTitle>
										</DialogHeader>
										<div className="space-y-6 pt-4">
											{/* Avatar */}
											<div className="flex flex-col items-center gap-4">
												<Avatar
													className="h-24 w-24 border-2 border-border/50"
													key={avatar}
												>
													<AvatarImage
														src={avatar || "/placeholder-user.jpg"}
														alt={name}
														onError={(e) => {
															e.currentTarget.src = "/placeholder-user.jpg";
														}}
													/>
													<AvatarFallback className="text-2xl">
														{name[0] || "U"}
													</AvatarFallback>
												</Avatar>
												<Button
													variant="outline"
													onClick={() => fileInputRef.current?.click()}
													className="gap-2"
												>
													<Upload className="h-4 w-4" />
													Change Avatar
												</Button>
												<input
													ref={fileInputRef}
													type="file"
													accept="image/*"
													className="hidden"
													onChange={handleAvatarChange}
												/>
											</div>

											{/* Name */}
											<div className="space-y-2">
												<Label htmlFor="edit-name">Name</Label>
												<Input
													id="edit-name"
													value={name}
													onChange={(e) => setName(e.target.value)}
													className="glass border-border/50"
												/>
											</div>

											{/* Bio */}
											<div className="space-y-2">
												<Label htmlFor="edit-bio">Bio</Label>
												<Textarea
													id="edit-bio"
													value={bio}
													onChange={(e) => setBio(e.target.value)}
													rows={4}
													className="glass border-border/50 resize-none"
													placeholder="Tell us about yourself..."
												/>
												<p className="text-xs text-muted-foreground">
													{bio.length}/500
												</p>
											</div>

											{/* Actions */}
											<div className="flex gap-3 pt-4">
												<Button
													onClick={handleSave}
													className="flex-1 bg-gradient-to-br from-primary to-accent"
													disabled={saving}
												>
													{saving ? "Saving..." : "Save Changes"}
												</Button>
												<Button
													variant="outline"
													onClick={() => setIsEditOpen(false)}
													className="flex-1 bg-transparent"
												>
													Cancel
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Posts */}
				<div className="space-y-6">
					<h2 className="text-2xl font-bold mb-4">My Posts</h2>
					{postsLoading ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">Loading posts...</p>
						</div>
					) : posts.length === 0 ? (
						<div className="text-center py-12 glass rounded-xl">
							<p className="text-muted-foreground mb-4">
								You haven't created any posts yet.
							</p>
							<Link href="/create">
								<Button className="bg-gradient-to-br from-primary to-accent">
									Create Your First Post
								</Button>
							</Link>
						</div>
					) : (
						posts.map((post) => (
							<PostCard
								key={post.id}
								post={{
									id: post.id,
									title: post.title,
									content: post.content,
									image: post.image,
									author: {
										id: authUser?.id || "",
										name: name,
										avatar: avatar || "/placeholder-user.jpg",
									},
									likes: post._count?.likes || 0,
									comments: post._count?.comments || 0,
									isLiked: post.isLiked || false,
									isOwner: true,
								}}
							/>
						))
					)}
				</div>
			</main>
		</div>
	);
}
