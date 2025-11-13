import express from "express";
import dotenv from "dotenv";
import connection from "./connection/db.js";
import router from "./routes/authRoutes.js";
import cors from "cors";

// config
dotenv.config();
const PORT = process.env.PORT || 8000;

//database
connection();

const app = express();

// ✅ Allow all origins and methods
app.use(cors());

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Middleware
app.use(express.json());

//routes
app.use("/api", router);

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get("/", (req, res) => {
  res.send("<h1> Hello World </h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
