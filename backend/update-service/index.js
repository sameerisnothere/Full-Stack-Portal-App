// updateservice/index
import express from "express";
import dotenv from "dotenv";
import updateRoutes from "./routes/updateRoutes.js";
import attachUser from "./middleware/attachUser.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(attachUser);

app.use("/api", updateRoutes);

app.listen(process.env.PORT, () => {
  console.log("update-service running on port", process.env.PORT);
});
