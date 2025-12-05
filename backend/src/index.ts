import type { Express } from 'express';
import cors from 'cors';

import express from 'express';
import routes from './routes';
import { setupSwagger } from './swagger';

const app: Express = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3001";

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use('', routes);
setupSwagger(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});
