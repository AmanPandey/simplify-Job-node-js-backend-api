import express from "express";
import dotenv from "dotenv";
import connection from "./connection/db.js";
import router from "./routes/authRoutes.js";

// config
dotenv.config();
const PORT = process.env.PORT || 8000;

//database
connection();

const app = express();
app.use(express.json());

//routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("<h1> Hello World </h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
