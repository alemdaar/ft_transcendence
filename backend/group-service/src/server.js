import express from 'express';
import "dotenv/config";
import { appRouter } from './appRouter/appRouter.js';

const PORT = 8080

const app = express()

app.use(express.json());

app.use(appRouter)
app.listen(PORT, ()=>console.log(`server connected on port: ${PORT}`))