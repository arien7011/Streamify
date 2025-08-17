// healthcheck.routes.js ✅ fixed
import { Router } from "express";
import healthCheckResponse from "../controllers/healthcheck.controllers.js";

const healthCheckRoutes = Router();

router.route('/').get(healthCheckResponse);



export default healthCheckRoutes;
