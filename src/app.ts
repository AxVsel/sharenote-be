import express from "express";
import dotenv from "dotenv";
import auth from "./routes/auth-route";
import corsMiddleware from "./middlewares/cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2200;

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/auth", auth);

app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
