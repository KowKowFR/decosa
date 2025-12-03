"use client";

import type React from "react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { X, ArrowLeft, ImageIcon } from "lucide-react";
import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function EditPostPage({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = use(params) as { postId: string };
	const router = useRouter();
	const { toast } = useToast();
	const { user, loading: authLoading } = useAuth("/login");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [image, setImage] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingPost, setLoadingPost] = useState(true);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (user) {
			loadPost();
		}
	}, [postId, user]);

	const loadPost = async () => {
		try {
			setLoadingPost(true);
			const post = await api.posts.getById(postId);
			if (!post.isOwner) {
				toast({
					title: "Error",
					description: "You don't have permission to edit this post",
					variant: "destructive",
				});
				router.push(`/post/${postId}`);
				return;
			}
			setTitle(post.title);
			setContent(post.content);
			setImage(post.image || null);
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to load post",
				variant: "destructive",
			});
			router.push(`/post/${postId}`);
		} finally {
			setLoadingPost(false);
		}
	};

	const handleImageChange = async (file: File) => {
		if (!file || !file.type.startsWith("image/")) return;

		try {
			// Uploader via le serveur (évite les problèmes CORS)
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "post");
			formData.append("postId", postId);

			const result = await api.upload.uploadDirect(formData);

			// Mettre à jour l'état avec l'URL publique
			setImage(result.url);
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

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) handleImageChange(file);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleSubmit = async () => {
		if (!title || !content) return;

		try {
			setLoading(true);
			await api.posts.update(postId, {
				title,
				content,
				image: image || null,
			});
			toast({
				title: "Success",
				description: "Post updated successfully!",
			});
			router.push(`/post/${postId}`);
		} catch (err) {
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to update post",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	if (authLoading || loadingPost) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<Header />

			<main className="container mx-auto max-w-2xl px-4 py-8">
				<Link href={`/post/${postId}`}>
					<Button variant="ghost" className="gap-2 mb-6">
						<ArrowLeft className="h-4 w-4" />
						Back to Post
					</Button>
				</Link>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="glass rounded-xl p-8"
				>
					<h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
						Edit Post
					</h1>

					<div className="space-y-6">
						{/* Title */}
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Give your post a title..."
								className="glass border-border/50 text-lg"
							/>
						</div>

						{/* Content */}
						<div className="space-y-2">
							<Label htmlFor="content">Content</Label>
							<Textarea
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Share your thoughts..."
								rows={8}
								className="glass border-border/50 resize-none"
							/>
							<p className="text-xs text-muted-foreground">
								{content.length} characters
							</p>
						</div>

						{/* Image Upload */}
						<div className="space-y-2">
							<Label>Image (Optional)</Label>

							{image ? (
								<div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-border/50">
									<img
										src={image || "/placeholder.svg"}
										alt="Upload preview"
										className="w-full h-full object-cover"
									/>
									<Button
										variant="destructive"
										size="icon"
										className="absolute top-2 right-2 rounded-full"
										onClick={() => setImage(null)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<div
									onDrop={handleDrop}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									className={`relative w-full h-48 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
										isDragging
											? "border-primary bg-primary/5"
											: "border-border/50 hover:border-primary/50 hover:bg-muted/30"
									}`}
									onClick={() => fileInputRef.current?.click()}
								>
									<div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
										<div className="p-4 rounded-full bg-muted">
											<ImageIcon className="h-8 w-8 text-muted-foreground" />
										</div>
										<div className="text-center">
											<p className="font-medium mb-1">
												Drop your image here, or click to browse
											</p>
											<p className="text-xs text-muted-foreground">
												PNG, JPG, GIF up to 10MB
											</p>
										</div>
									</div>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) handleImageChange(file);
										}}
									/>
								</div>
							)}
						</div>

						{/* Actions */}
						<div className="flex gap-3 pt-4">
							<Button
								className="flex-1 bg-gradient-to-br from-primary to-accent"
								onClick={handleSubmit}
								disabled={!title || !content || loading}
							>
								{loading ? "Updating..." : "Update Post"}
							</Button>
							<Link href={`/post/${postId}`} className="flex-1">
								<Button variant="outline" className="w-full bg-transparent">
									Cancel
								</Button>
							</Link>
						</div>
					</div>
				</motion.div>
			</main>
		</div>
	);
}
