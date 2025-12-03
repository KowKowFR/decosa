export interface User {
	id: string;
	name: string;
	avatar: string;
	bio: string;
}

export interface Article {
	id: string;
	title: string;
	content: string;
	image?: string;
	authorId: string;
	author: User;
	likes: number;
	createdAt: string;
	likedByMe: boolean;
}
