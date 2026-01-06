// authservice/index.js on port 4005
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import "./tokenCleanup.js";
// import session from "express-session";
// import connectMySQL from "express-mysql-session";

// const MySQLStore = connectMySQL(session);

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Configure MySQL session store
// const sessionStore = new MySQLStore({
//   host: process.env.DB_HOSTNAME,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// app.use(
//   session({
//     key: "sid",
//     secret: process.env.SESSION_SECRET || "supersecret!!",
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: false, // set true in production with HTTPS
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 60, // 1 hour
//     },
//   })
// );

// ✅ Mount auth routes
app.use("/api", authRoutes);

app.listen(port, () => {
  console.log("auth-service running on port", port);
});
