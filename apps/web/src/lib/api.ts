const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
	const response = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		credentials: "include",
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: "Unknown error" }));
		throw new Error(error.error || `HTTP error! status: ${response.status}`);
	}

	return response.json();
}

export const api = {
	// Posts
	posts: {
		getAll: (params?: {
			page?: number;
			limit?: number;
			authorId?: string;
			search?: string;
		}) => {
			const query = new URLSearchParams();
			if (params?.page) query.append("page", params.page.toString());
			if (params?.limit) query.append("limit", params.limit.toString());
			if (params?.authorId) query.append("authorId", params.authorId);
			if (params?.search) query.append("search", params.search);
			return fetchAPI(`/api/posts?${query.toString()}`);
		},
		getById: (postId: string) => fetchAPI(`/api/posts/${postId}`),
		create: (data: { title: string; content: string; image?: string }) =>
			fetchAPI("/api/posts", {
				method: "POST",
				body: JSON.stringify(data),
			}),
		update: (
			postId: string,
			data: { title?: string; content?: string; image?: string | null }
		) =>
			fetchAPI(`/api/posts/${postId}`, {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		delete: (postId: string) =>
			fetchAPI(`/api/posts/${postId}`, {
				method: "DELETE",
			}),
	},

	// Comments
	comments: {
		getByPostId: (
			postId: string,
			params?: { page?: number; limit?: number }
		) => {
			const query = new URLSearchParams();
			if (params?.page) query.append("page", params.page.toString());
			if (params?.limit) query.append("limit", params.limit.toString());
			return fetchAPI(`/api/comments/posts/${postId}?${query.toString()}`);
		},
		create: (postId: string, data: { content: string }) =>
			fetchAPI(`/api/comments/posts/${postId}`, {
				method: "POST",
				body: JSON.stringify(data),
			}),
		update: (commentId: string, data: { content: string }) =>
			fetchAPI(`/api/comments/${commentId}`, {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		delete: (commentId: string) =>
			fetchAPI(`/api/comments/${commentId}`, {
				method: "DELETE",
			}),
	},

	// Likes
	likes: {
		togglePost: (postId: string) =>
			fetchAPI(`/api/likes/posts/${postId}`, {
				method: "POST",
			}),
		toggleComment: (commentId: string) =>
			fetchAPI(`/api/likes/comments/${commentId}`, {
				method: "POST",
			}),
	},

	// Reports
	reports: {
		create: (data: {
			reason: string;
			type: "POST" | "COMMENT";
			postId?: string;
			commentId?: string;
		}) =>
			fetchAPI("/api/reports", {
				method: "POST",
				body: JSON.stringify(data),
			}),
	},

	// Follows
	follows: {
		follow: (userId: string) =>
			fetchAPI(`/api/follows/${userId}`, {
				method: "POST",
			}),
		unfollow: (userId: string) =>
			fetchAPI(`/api/follows/${userId}`, {
				method: "DELETE",
			}),
		getFollowers: (
			userId: string,
			params?: { page?: number; limit?: number }
		) => {
			const query = new URLSearchParams();
			if (params?.page) query.append("page", params.page.toString());
			if (params?.limit) query.append("limit", params.limit.toString());
			return fetchAPI(`/api/follows/${userId}/followers?${query.toString()}`);
		},
		getFollowing: (
			userId: string,
			params?: { page?: number; limit?: number }
		) => {
			const query = new URLSearchParams();
			if (params?.page) query.append("page", params.page.toString());
			if (params?.limit) query.append("limit", params.limit.toString());
			return fetchAPI(`/api/follows/${userId}/following?${query.toString()}`);
		},
		check: (userId: string) => fetchAPI(`/api/follows/${userId}/check`),
	},

	// Users
	users: {
		getCurrent: () => fetchAPI("/api/users/me"),
		getById: (userId: string) => fetchAPI(`/api/users/${userId}`),
		update: (data: { name?: string; bio?: string; image?: string | null }) =>
			fetchAPI("/api/users/me", {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		getPosts: (userId: string, params?: { page?: number; limit?: number }) => {
			const query = new URLSearchParams();
			if (params?.page) query.append("page", params.page.toString());
			if (params?.limit) query.append("limit", params.limit.toString());
			return fetchAPI(`/api/users/${userId}/posts?${query.toString()}`);
		},
	},

	// Upload
	upload: {
		getPresignedUrl: (data: {
			filename: string;
			contentType: string;
			type: "avatar" | "post";
			postId?: string;
		}) =>
			fetchAPI("/api/upload/presigned-url", {
				method: "POST",
				body: JSON.stringify(data),
			}),
		uploadDirect: (formData: FormData) => {
			return fetch(`${API_URL}/api/upload/direct`, {
				method: "POST",
				body: formData,
				credentials: "include",
			}).then((res) => {
				if (!res.ok) {
					return res.json().then((err) => {
						throw new Error(err.error || `HTTP error! status: ${res.status}`);
					});
				}
				return res.json();
			});
		},
	},
};
