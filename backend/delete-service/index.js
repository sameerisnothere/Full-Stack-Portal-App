// deleteservice/index.js
import express from 'express';
import dotenv from 'dotenv';
import deleteRoutes from './routes/deleteRoutes.js';
import attachUser from './middleware/attachUser.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(attachUser);

app.use('/api', deleteRoutes);

app.listen(port, () => {
  console.log("delete-service running on port", port);
});