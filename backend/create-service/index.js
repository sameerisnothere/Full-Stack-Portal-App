// createservice/index.js
import express from 'express';
import dotenv from 'dotenv';
import insertRoutes from './routes/insertRoutes.js';
import attachUser from './middleware/attachUser.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(attachUser);

app.use('/api', insertRoutes);

app.listen(port, () => {
  console.log("create-service running on port", port);
});