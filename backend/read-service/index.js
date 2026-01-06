// readservice/index.js
import express from 'express';
import dotenv from 'dotenv';
import readRoutes from './routes/readRoutes.js';
import cors from 'cors';
import attachUser from './middleware/attachUser.js';

dotenv.config();

const app = express();
 
app.use(attachUser);
app.use(cors());
const port = process.env.PORT;

app.use(express.json());

app.use('/api', readRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log("Read-service running on port ", port);
});
