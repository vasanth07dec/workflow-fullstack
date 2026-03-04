import express from "express";
import routes from "./routes/routes.js";
import { initDB } from "./config/initDB.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
app.use("/api", routes);


const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });