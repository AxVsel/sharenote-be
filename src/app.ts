import express from "express";
import dotenv from "dotenv";
import auth from "./routes/auth-route";
import todo from "./routes/todo-route";
import sharetodo from "./routes/todoshare-route";
import cookieParser from "cookie-parser";
import corsMiddleware from "./middlewares/cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2200;

app.use(cookieParser());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/auth", auth);
app.use("/todo", todo);
app.use("/share-todo", sharetodo);

app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
