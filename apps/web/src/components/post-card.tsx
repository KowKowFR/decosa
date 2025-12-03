"use client";

import type React from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
	Heart,
	MessageCircle,
	Flag,
	Trash2,
	ChevronUp,
	Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface PostCardProps {
	post: {
		id: string;
		title: string;
		content: string;
		image?: string;
		author: {
			id: string;
			name: string;
			avatar: string;
		};
		likes: number;
		comments: number;
		isLiked: boolean;
		isOwner?: boolean;
	};
	onLike?: () => void;
	onDelete?: () => void;
	onEdit?: () => void;
	onReport?: () => void;
}

function FloatingHeart({
	x,
	y,
	delay,
}: {
	x: number;
	y: number;
	delay: number;
}) {
	return (
		<motion.div
			initial={{ x, y, opacity: 1, scale: 0 }}
			animate={{
				y: y - 200,
				x: x + (Math.random() - 0.5) * 100,
				opacity: 0,
				scale: [0, 1.5, 1.2, 0],
			}}
			transition={{
				duration: 2,
				delay,
				ease: "easeOut",
			}}
			className="fixed pointer-events-none text-red-500 z-50"
			style={{ left: x, top: y }}
		>
			<Heart className="h-8 w-8 fill-current drop-shadow-lg" />
		</motion.div>
	);
}

export function PostCard({
	post,
	onLike,
	onDelete,
	onEdit,
	onReport,
}: PostCardProps) {
	const { toast } = useToast();
	const { user: currentUser } = useAuth();
	const [isLiked, setIsLiked] = useState(post.isLiked);
	const [likesCount, setLikesCount] = useState(post.likes);
	const [showComments, setShowComments] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState<any[]>([]);
	const [loadingComments, setLoadingComments] = useState(false);
	const [hearts, setHearts] = useState<
		Array<{ id: number; x: number; y: number; delay: number }>
	>([]);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	useEffect(() => {
		if (showComments) {
			loadComments();
		}
	}, [showComments, post.id]);

	const loadComments = async () => {
		try {
			setLoadingComments(true);
			const result = await api.comments.getByPostId(post.id);
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

	const handleLike = async (e: React.MouseEvent) => {
		try {
			const x = e.clientX;
			const y = e.clientY;

			const result = await api.likes.togglePost(post.id);
			setIsLiked(result.liked);
			setLikesCount(result.liked ? likesCount + 1 : likesCount - 1);

			if (result.liked) {
				const newHearts = Array.from({ length: 12 }, (_, i) => ({
					id: Date.now() + i,
					x,
					y,
					delay: i * 0.04,
				}));
				setHearts(newHearts);
				setTimeout(() => setHearts([]), 2500);
			}

			onLike?.();
		} catch (err) {
			toast({
				title: "Error",
				description: "Failed to like post",
				variant: "destructive",
			});
		}
	};

	const handleAddComment = async () => {
		if (!newComment.trim()) return;

		try {
			const comment = await api.comments.create(post.id, {
				content: newComment,
			});
			setComments([comment, ...comments]);
			setNewComment("");
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

	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.3 }}
			className="glass rounded-xl p-6 hover:bg-card/80 transition-all relative"
		>
			{/* Header */}
			<div className="flex items-start justify-between mb-4">
				<Link
					href={`/profile/${post.author.id}`}
					className="flex items-center gap-3 group"
				>
					<motion.div
						whileHover={{ scale: 1.1 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
					>
						<Avatar className="h-10 w-10 border-2 border-border/50">
							<AvatarImage
								src={post.author.avatar || "/placeholder.svg"}
								alt={post.author.name}
							/>
							<AvatarFallback>{post.author.name[0]}</AvatarFallback>
						</Avatar>
					</motion.div>
					<div>
						<p className="font-medium group-hover:text-primary transition-colors">
							{post.author.name}
						</p>
						<p className="text-xs text-muted-foreground">2 hours ago</p>
					</div>
				</Link>

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
						{post.isOwner && (
							<>
								{onEdit && (
									<DropdownMenuItem onClick={onEdit}>
										<Edit className="h-4 w-4 mr-2" />
										Edit post
									</DropdownMenuItem>
								)}
								{onDelete && (
									<DropdownMenuItem
										onClick={() => setIsDeleteDialogOpen(true)}
										className="text-destructive"
									>
										<Trash2 className="h-4 w-4 mr-2" />
										Delete post
									</DropdownMenuItem>
								)}
							</>
						)}
						{onReport && (
							<DropdownMenuItem onClick={onReport}>
								<Flag className="h-4 w-4 mr-2" />
								Report
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Content */}
			<Link href={`/post/${post.id}`}>
				<motion.div
					whileHover={{ x: 2 }}
					transition={{ type: "spring", stiffness: 400, damping: 17 }}
				>
					<div className="space-y-3 mb-4">
						<h2 className="text-xl font-semibold text-balance hover:text-primary transition-colors">
							{post.title}
						</h2>
						<p className="text-muted-foreground leading-relaxed text-pretty line-clamp-3">
							{post.content}
						</p>
						{post.image && (
							<motion.div
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
							>
								<div className="relative w-full h-64 rounded-lg overflow-hidden border border-border/50">
									<Image
										src={post.image || "/placeholder.svg"}
										alt={post.title}
										fill
										className="object-cover"
									/>
								</div>
							</motion.div>
						)}
					</div>
				</motion.div>
			</Link>

			<div className="flex items-center gap-1 pt-3 border-t border-border/50">
				<motion.div whileTap={{ scale: 0.9 }} className="relative">
					<Button
						variant="ghost"
						size="sm"
						className={`gap-1 h-7 rounded-full px-2 ${
							isLiked ? "text-red-500" : ""
						}`}
						onClick={handleLike}
					>
						<motion.div
							animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
							transition={{ duration: 0.3, ease: "easeOut" }}
						>
							<Heart
								className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`}
							/>
						</motion.div>
						<span className="text-xs font-medium">{likesCount}</span>
					</Button>
				</motion.div>

				<motion.div whileTap={{ scale: 0.9 }}>
					<Button
						variant="ghost"
						size="sm"
						className="gap-1 h-7 rounded-full px-2"
						onClick={() => setShowComments(!showComments)}
					>
						{showComments ? (
							<ChevronUp className="h-3.5 w-3.5" />
						) : (
							<MessageCircle className="h-3.5 w-3.5" />
						)}
						<span className="text-xs font-medium">{post.comments}</span>
					</Button>
				</motion.div>
			</div>

			<AnimatePresence>
				{showComments && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						<div className="mt-4 space-y-4 border-t border-border/50 pt-4">
							{/* Add comment */}
							{currentUser && (
								<div className="flex gap-2">
									<Avatar className="h-8 w-8 border border-border/50">
										<AvatarImage
											src={currentUser.image || "/placeholder-user.jpg"}
											alt={currentUser.name || "You"}
										/>
										<AvatarFallback>
											{(currentUser.name || "Y")[0]}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 flex gap-2">
										<Textarea
											value={newComment}
											onChange={(e) => setNewComment(e.target.value)}
											placeholder="Add a comment..."
											className="min-h-[60px] glass border-border/50 resize-none text-sm"
										/>
										<Button
											size="sm"
											onClick={handleAddComment}
											className="bg-gradient-to-br from-primary to-accent h-fit"
										>
											Post
										</Button>
									</div>
								</div>
							)}

							{loadingComments ? (
								<div className="text-center py-4">
									<p className="text-sm text-muted-foreground">
										Loading comments...
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{comments.map((comment, index) => {
										const isCommentOwner =
											currentUser?.id === comment.author?.id;
										return (
											<motion.div
												key={comment.id}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.05 }}
												className="flex gap-2 group"
											>
												<Avatar className="h-7 w-7 border border-border/50">
													<AvatarImage
														src={
															comment.author?.image ||
															comment.author?.avatar ||
															"/placeholder-user.jpg"
														}
														alt={comment.author?.name || "User"}
													/>
													<AvatarFallback>
														{(comment.author?.name || "U")[0]}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 glass-strong rounded-lg p-3 relative">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-xs font-medium">
															{comment.author?.name || "Unknown"}
														</span>
														<span className="text-xs text-muted-foreground">
															{comment.createdAt
																? new Date(
																		comment.createdAt
																  ).toLocaleDateString()
																: ""}
														</span>
													</div>
													<p className="text-sm leading-relaxed">
														{comment.content}
													</p>
													{isCommentOwner && (
														<Button
															variant="ghost"
															size="icon"
															className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
															onClick={() => handleDeleteComment(comment.id)}
														>
															<Trash2 className="h-3 w-3 text-destructive" />
														</Button>
													)}
												</div>
											</motion.div>
										);
									})}
									{comments.length === 0 && (
										<p className="text-sm text-muted-foreground text-center py-4">
											No comments yet. Be the first to comment!
										</p>
									)}
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

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
							onClick={() => {
								onDelete?.();
								setIsDeleteDialogOpen(false);
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</motion.article>
	);
}
