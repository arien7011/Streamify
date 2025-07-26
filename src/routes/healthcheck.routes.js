// healthcheck.routes.js ✅ fixed
import { Router } from "express";
import healthCheckResponse from "../controllers/healthcheck.controllers.js";

const router = Router();

router.route('/').get(healthCheckResponse);



export default router;
