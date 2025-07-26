import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
const app = express();

dotenv.config({
  path: "./.env",
});

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded())
app.use(cookieParser());
//import routes
import healthCheckRoutes from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.router.js";
//handle routes

app.use('/api/v1/healthcheck',healthCheckRoutes);
app.use('/api/v1/users',userRouter);
app.use((req, res, next) => {
  console.log(`Unhandled request: ${req.method} ${req.url}`);
  res.status(404).send("Route not found");
});

app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
app.use(errorHandler);

export default app;