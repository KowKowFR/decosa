import type { Context } from "hono";
import { ReportService } from "../services/report.service";

export class ReportController {
	static async create(c: Context) {
		const user = c.get("user");
		const body = c.get("validatedBody") as {
			reason: string;
			type: "POST" | "COMMENT";
			postId?: string;
			commentId?: string;
		};

		const report = await ReportService.createReport(body, user.id);

		if (!report) {
			return c.json({ error: "Content not found" }, 404);
		}

		return c.json(report, 201);
	}

	static async getAll(c: Context) {
		const query = c.get("validatedQuery") as {
			page: number;
			limit: number;
			status?: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
		};

		const result = await ReportService.getReports(query);

		return c.json(result);
	}

	static async updateStatus(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { reportId: string };
		const body = c.get("validatedBody") as {
			status: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";
			notes?: string;
		};

		const report = await ReportService.updateReportStatus(
			params.reportId,
			body,
			user.id
		);

		return c.json(report);
	}
}
