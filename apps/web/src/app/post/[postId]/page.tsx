"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
	Heart,
	MessageCircle,
	ArrowLeft,
	Flag,
	Trash2,
	Send,
	Edit,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function PostPage({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = use(params) as { postId: string };
	const router = useRouter();
	const { toast } = useToast();
	const { user: currentUser } = useAuth();
	const [post, setPost] = useState<any>(null);
	const [isLiked, setIsLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(0);
	const [commentText, setCommentText] = useState("");
	const [comments, setComments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingComments, setLoadingComments] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	useEffect(() => {
		loadPost();
		loadComments();
	}, [postId]);

	const loadPost = async () => {
		try {
			setLoading(true);
			const postData = await api.posts.getById(postId);
			setPost(postData);
			setIsLiked(postData.isLiked || false);
			setLikesCount(postData._count?.likes || 0);
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to load post",
				variant: "destructive",
			});
			router.push("/");
		} finally {
			setLoading(false);
		}
	};

	const loadComments = async () => {
		try {
			setLoadingComments(true);
			const result = await api.comments.getByPostId(postId);
			setComments(result.comments || []);
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to load comments",
				variant: "destructive",
			});
		} finally {
			setLoadingComments(false);
		}
	};

	const handleLike = async () => {
		if (!currentUser) {
			router.push("/login");
			return;
		}
		try {
			const result = await api.likes.togglePost(postId);
			setIsLiked(result.liked);
			setLikesCount(result.liked ? likesCount + 1 : likesCount - 1);
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to like post",
				variant: "destructive",
			});
		}
	};

	const handleAddComment = async () => {
		if (!currentUser) {
			router.push("/login");
			return;
		}
		if (!commentText.trim()) return;

		try {
			const comment = await api.comments.create(postId, {
				content: commentText,
			});
			setComments([comment, ...comments]);
			setCommentText("");
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to add comment",
				variant: "destructive",
			});
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		try {
			await api.comments.delete(commentId);
			setComments(comments.filter((c) => c.id !== commentId));
			toast({
				title: "Success",
				description: "Comment deleted successfully",
			});
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to delete comment",
				variant: "destructive",
			});
		}
	};

	const handleDeletePost = async () => {
		try {
			await api.posts.delete(postId);
			toast({
				title: "Success",
				description: "Post deleted successfully",
			});
			setIsDeleteDialogOpen(false);
			router.push("/");
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
				<p className="text-muted-foreground">Loading post...</p>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-destructive">Post not found</p>
			</div>
		);
	}

	const createdAt = new Date(post.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className="min-h-screen">
			<Header />

			<main className="container mx-auto max-w-3xl px-4 py-8">
				<Link href="/">
					<Button variant="ghost" className="gap-2 mb-6">
						<ArrowLeft className="h-4 w-4" />
						Back to Feed
					</Button>
				</Link>

				{/* Post */}
				<motion.article
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="glass rounded-xl p-8 mb-8"
				>
					{/* Header */}
					<div className="flex items-start justify-between mb-6">
						<Link
							href={`/profile/${post.author.id}`}
							className="flex items-center gap-3 group"
						>
							<Avatar className="h-12 w-12 border-2 border-border/50">
								<AvatarImage
									src={post.author.image || "/placeholder-user.jpg"}
									alt={post.author.name}
								/>
								<AvatarFallback>{post.author.name[0]}</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium group-hover:text-primary transition-colors">
									{post.author.name}
								</p>
								<p className="text-xs text-muted-foreground">{createdAt}</p>
							</div>
						</Link>

						{post.isOwner && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-full"
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="glass-strong">
									<DropdownMenuItem
										onClick={() => router.push(`/post/${postId}/edit`)}
									>
										<Edit className="h-4 w-4 mr-2" />
										Edit post
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={handleDeletePost}
										className="text-destructive"
									>
										<Trash2 className="h-4 w-4 mr-2" />
										Delete post
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>

					{/* Content */}
					<div className="space-y-6 mb-6">
						<h1 className="text-4xl font-bold text-balance">{post.title}</h1>

						{post.image && (
							<div className="relative w-full h-96 rounded-xl overflow-hidden border border-border/50">
								<Image
									src={post.image || "/placeholder.svg"}
									alt={post.title}
									fill
									className="object-cover"
								/>
							</div>
						)}

						<p className="text-muted-foreground leading-relaxed text-pretty text-lg">
							{post.content}
						</p>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2 pt-6 border-t border-border/50">
						<motion.div whileTap={{ scale: 0.9 }}>
							<Button
								variant="ghost"
								size="sm"
								className={`gap-2 h-9 rounded-full ${
									isLiked ? "text-red-500" : ""
								}`}
								onClick={handleLike}
							>
								<motion.div
									animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
									transition={{ duration: 0.3, ease: "easeOut" }}
								>
									<Heart
										className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
									/>
								</motion.div>
								<span className="font-medium">{likesCount}</span>
							</Button>
						</motion.div>

						<Button
							variant="ghost"
							size="sm"
							className="gap-2 h-9 rounded-full"
						>
							<MessageCircle className="h-5 w-5" />
							<span className="font-medium">{comments.length}</span>
						</Button>
					</div>
				</motion.article>

				{/* Comments Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="space-y-6"
				>
					<h2 className="text-2xl font-bold">Comments</h2>

					{/* Add Comment */}
					{currentUser && (
						<div className="glass rounded-xl p-6">
							<div className="flex gap-3">
								<Avatar className="h-10 w-10 border-2 border-border/50">
									<AvatarImage
										src={currentUser.image || "/placeholder-user.jpg"}
										alt={currentUser.name || "You"}
									/>
									<AvatarFallback>
										{(currentUser.name || "Y")[0]}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 space-y-3">
									<Textarea
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										placeholder="Share your thoughts..."
										rows={3}
										className="glass border-border/50 resize-none"
									/>
									<Button
										onClick={handleAddComment}
										disabled={!commentText.trim()}
										className="gap-2 bg-gradient-to-br from-primary to-accent ml-auto"
										size="sm"
									>
										<Send className="h-4 w-4" />
										Comment
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* Comments List */}
					{loadingComments ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">Loading comments...</p>
						</div>
					) : comments.length === 0 ? (
						<div className="text-center py-8 glass rounded-xl">
							<p className="text-muted-foreground">
								No comments yet. Be the first to comment!
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{comments.map((comment, index) => {
								const isCommentOwner = currentUser?.id === comment.author?.id;
								return (
									<motion.div
										key={comment.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										className="glass rounded-xl p-6 relative group"
									>
										<div className="flex gap-3">
											<Link href={`/profile/${comment.author?.id || ""}`}>
												<Avatar className="h-10 w-10 border-2 border-border/50">
													<AvatarImage
														src={
															comment.author?.image || "/placeholder-user.jpg"
														}
														alt={comment.author?.name || "User"}
													/>
													<AvatarFallback>
														{(comment.author?.name || "U")[0]}
													</AvatarFallback>
												</Avatar>
											</Link>
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<Link href={`/profile/${comment.author?.id || ""}`}>
														<p className="font-medium hover:text-primary transition-colors">
															{comment.author?.name || "Unknown"}
														</p>
													</Link>
													<span className="text-xs text-muted-foreground">
														{comment.createdAt
															? new Date(comment.createdAt).toLocaleDateString()
															: ""}
													</span>
												</div>
												<p className="text-muted-foreground leading-relaxed">
													{comment.content}
												</p>
											</div>
										</div>
										{isCommentOwner && (
											<Button
												variant="ghost"
												size="icon"
												className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={() => handleDeleteComment(comment.id)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										)}
									</motion.div>
								);
							})}
						</div>
					)}
				</motion.div>
			</main>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent className="glass-strong">
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Post</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this post? This action cannot be
							undone and all comments and likes will be permanently removed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeletePost}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
