import express from "express";
import logger from "morgan";
import cors from "cors";
import "dotenv/config";

import authRouter from "./routes/api/auth-router.js";
import waterRouter from "./routes/api/water-router.js";
import userRouter from "./routes/api/userRouter.js";

import swaggerUi from "swagger-ui-express";
import swaggerDoc from "./swagger.json" assert { type: "json" };
import multer from "multer";

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/users", userRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use("/api/water", waterRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = err instanceof multer.MulterError
    ? 400
    : 500,
    message = "Server error" } = err;
  res.status(status).json({ message });
});

export default app;
