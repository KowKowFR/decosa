"use client";

import { Header } from "@/components/header";
import { PostCard } from "@/components/post-card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
	const router = useRouter();
	const { toast } = useToast();
	const [searchQuery, setSearchQuery] = useState("");
	const [posts, setPosts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadPosts();
	}, [searchQuery]);

	const loadPosts = async () => {
		try {
			setLoading(true);
			const result = await api.posts.getAll({
				search: searchQuery || undefined,
				limit: 20,
			});
			setPosts(result.posts || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load posts");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen">
			<Header onSearch={setSearchQuery} />

			<main className="container mx-auto max-w-2xl px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-8"
				>
					<h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
						Your Feed
					</h1>
					<p className="text-muted-foreground">
						Discover the latest articles from the community
					</p>
				</motion.div>

				{searchQuery && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-4 text-sm text-muted-foreground"
					>
						Found {posts.length} result{posts.length !== 1 ? "s" : ""} for "
						{searchQuery}"
					</motion.div>
				)}

				{loading && (
					<div className="text-center py-12">
						<p className="text-muted-foreground">Loading posts...</p>
					</div>
				)}

				{error && (
					<div className="text-center py-12">
						<p className="text-destructive">Error: {error}</p>
					</div>
				)}

				{!loading && !error && (
					<div className="space-y-6">
						<AnimatePresence mode="popLayout">
							{posts.map((post, index) => (
								<motion.div
									key={post.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -100 }}
									transition={{
										duration: 0.3,
										delay: searchQuery ? 0 : index * 0.1,
									}}
									layout
								>
									<PostCard
										post={{
											id: post.id,
											title: post.title,
											content: post.content,
											image: post.image,
											author: {
												id: post.author.id,
												name: post.author.name,
												avatar: post.author.image || "/placeholder-user.jpg",
											},
											likes: post._count?.likes || 0,
											comments: post._count?.comments || 0,
											isLiked: post.isLiked || false,
											isOwner: post.isOwner || false,
										}}
										onDelete={async () => {
											try {
												await api.posts.delete(post.id);
												toast({
													title: "Success",
													description: "Post deleted successfully",
												});
												loadPosts();
											} catch (err) {
												toast({
													title: "Error",
													description: "Failed to delete post",
													variant: "destructive",
												});
											}
										}}
										onEdit={() => router.push(`/post/${post.id}/edit`)}
									/>
								</motion.div>
							))}
						</AnimatePresence>

						{posts.length === 0 && !searchQuery && (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-center py-12"
							>
								<p className="text-muted-foreground">
									No posts yet. Be the first to share something!
								</p>
							</motion.div>
						)}

						{posts.length === 0 && searchQuery && (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-center py-12"
							>
								<p className="text-muted-foreground">
									No posts found matching "{searchQuery}"
								</p>
							</motion.div>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
