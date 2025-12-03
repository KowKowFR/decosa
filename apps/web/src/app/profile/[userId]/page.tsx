"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Settings, Flag } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { PostCard } from "@/components/post-card";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";

export default function ProfilePage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = use(params);
	const { user: currentUser } = useAuth();
	const { toast } = useToast();
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState<any>(null);
	const [posts, setPosts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [isOwner, setIsOwner] = useState(false);
	// Le bouton "Edit Profile" n'apparaît que sur la route /profile/me, pas sur /profile/[userId]
	const isMyProfilePage = pathname === "/profile/me" || userId === "me";

	useEffect(() => {
		loadProfile();
	}, [userId, currentUser]);

	const loadProfile = async () => {
		try {
			setLoading(true);
			const userData = await api.users.getById(userId);
			setUser(userData);
			setIsOwner(currentUser?.id === userId);

			// Charger les posts de l'utilisateur
			const postsData = await api.users.getPosts(userId);
			setPosts(postsData.posts || []);
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

	const handleDeletePost = async (postId: string) => {
		try {
			await api.posts.delete(postId);
			toast({
				title: "Success",
				description: "Post deleted successfully",
			});
			loadProfile(); // Recharger les posts
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to delete post",
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-muted-foreground">Loading profile...</p>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-destructive">User not found</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<Header />

			<main className="container mx-auto max-w-4xl px-4 py-8">
				{/* Profile Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="glass rounded-xl p-8 mb-8"
				>
					<div className="flex items-start justify-between mb-6">
						<div className="flex items-center gap-4">
							<Avatar className="h-24 w-24 border-4 border-border/50">
								<AvatarImage
									src={user.image || "/placeholder-user.jpg"}
									alt={user.name}
								/>
								<AvatarFallback className="text-2xl">
									{user.name[0] || "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
									{user.name}
								</h1>
								<p className="text-muted-foreground">
									{posts.length} post{posts.length !== 1 ? "s" : ""}
								</p>
								{user._count && (
									<div className="flex gap-4 text-sm mt-2">
										<span className="text-muted-foreground">
											{user._count.followers || 0} followers
										</span>
										<span className="text-muted-foreground">
											{user._count.following || 0} following
										</span>
									</div>
								)}
							</div>
						</div>

						<div className="flex gap-2">
							{isOwner && isMyProfilePage ? (
								<Link href="/profile/me">
									<Button
										variant="default"
										className="gap-2 bg-gradient-to-br from-primary to-accent"
									>
										<Settings className="h-4 w-4" />
										Edit Profile
									</Button>
								</Link>
							) : isOwner && !isMyProfilePage ? (
								<Link href="/profile/me">
									<Button variant="outline" className="gap-2 bg-transparent">
										View My Profile
									</Button>
								</Link>
							) : currentUser ? (
								<Button
									variant="outline"
									className="gap-2 bg-transparent"
									onClick={async () => {
										try {
											await api.follows.follow(userId);
											toast({
												title: "Success",
												description: "Now following this user",
											});
											loadProfile();
										} catch (err) {
											toast({
												title: "Error",
												description: "Failed to follow user",
												variant: "destructive",
											});
										}
									}}
								>
									<Flag className="h-4 w-4" />
									Follow
								</Button>
							) : null}
						</div>
					</div>

					<p className="text-muted-foreground leading-relaxed">
						{user.bio || "No bio yet"}
					</p>
				</motion.div>

				{/* Posts Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<h2 className="text-2xl font-bold mb-6">
						{isOwner ? "Your Posts" : "Posts"}
					</h2>

					{posts.length === 0 ? (
						<div className="text-center py-12 glass rounded-xl">
							<p className="text-muted-foreground">
								{isOwner
									? "You haven't created any posts yet."
									: "No posts yet."}
							</p>
						</div>
					) : (
						<div className="space-y-6">
							{posts.map((post) => (
								<PostCard
									key={post.id}
									post={{
										id: post.id,
										title: post.title,
										content: post.content,
										image: post.image,
										author: {
											id: user.id,
											name: user.name,
											avatar: user.image || "/placeholder-user.jpg",
										},
										likes: post._count?.likes || 0,
										comments: post._count?.comments || 0,
										isLiked: post.isLiked || false,
										isOwner: isOwner,
									}}
									onDelete={() => handleDeletePost(post.id)}
									onEdit={() => router.push(`/post/${post.id}/edit`)}
								/>
							))}
						</div>
					)}
				</motion.div>
			</main>
		</div>
	);
}
