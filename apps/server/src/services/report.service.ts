import prisma from "@decosa/db";

export class ReportService {
	static async createReport(
		data: {
			reason: string;
			type: "POST" | "COMMENT";
			postId?: string;
			commentId?: string;
		},
		reporterId: string
	) {
		// Vérifier que le contenu signalé existe
		if (data.type === "POST" && data.postId) {
			const post = await prisma.post.findFirst({
				where: {
					id: data.postId,
					deletedAt: null,
				},
			});
			if (!post) {
				return null;
			}
		}

		if (data.type === "COMMENT" && data.commentId) {
			const comment = await prisma.comment.findFirst({
				where: {
					id: data.commentId,
					deletedAt: null,
				},
			});
			if (!comment) {
				return null;
			}
		}

		return await prisma.report.create({
			data: {
				reason: data.reason,
				type: data.type,
				postId: data.postId,
				commentId: data.commentId,
				reporterId,
			},
			include: {
				post: {
					select: {
						id: true,
						title: true,
					},
				},
				comment: {
					select: {
						id: true,
						content: true,
					},
				},
				reporter: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	static async getReports(options: {
		page: number;
		limit: number;
		status?: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
	}) {
		const { page, limit, status } = options;
		const skip = (page - 1) * limit;

		const where = {
			...(status && { status }),
		};

		const [reports, total] = await Promise.all([
			prisma.report.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					post: {
						select: {
							id: true,
							title: true,
						},
					},
					comment: {
						select: {
							id: true,
							content: true,
						},
					},
					reporter: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			}),
			prisma.report.count({ where }),
		]);

		return {
			reports,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	static async updateReportStatus(
		reportId: string,
		data: {
			status: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
			notes?: string;
		},
		reviewedBy: string
	) {
		return await prisma.report.update({
			where: { id: reportId },
			data: {
				status: data.status,
				reviewedBy,
				reviewedAt: new Date(),
				notes: data.notes,
			},
			include: {
				post: {
					select: {
						id: true,
						title: true,
					},
				},
				comment: {
					select: {
						id: true,
						content: true,
					},
				},
				reporter: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	}
}
