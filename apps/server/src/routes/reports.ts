import { Hono } from "hono";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import {
	validateBody,
	validateQuery,
	validateParams,
} from "../middleware/validation";
import {
	createReportSchema,
	updateReportStatusSchema,
	reportIdSchema,
} from "../schemas/report";
import { ReportController } from "../controllers/report.controller";

const reports = new Hono();

const getReportsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(10),
	status: z.enum(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"]).optional(),
});

// Créer un signalement (authentifié)
reports.post(
	"/",
	requireAuth,
	validateBody(createReportSchema),
	ReportController.create
);

// Récupérer tous les signalements (authentifié, admin uniquement - à implémenter)
reports.get(
	"/",
	requireAuth,
	validateQuery(getReportsQuerySchema),
	ReportController.getAll
);

// Mettre à jour le statut d'un signalement (authentifié, admin uniquement)
reports.put(
	"/:reportId",
	requireAuth,
	validateParams(reportIdSchema),
	validateBody(updateReportStatusSchema),
	ReportController.updateStatus
);

export default reports;
