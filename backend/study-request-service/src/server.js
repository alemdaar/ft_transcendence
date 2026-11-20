import  express from "express";
import 'dotenv/config';
import {routeMe} from './routes/appRouter.js'

const PORT = 3000;

const app = express();

app.use(express.json());


app.use('/', routeMe)


app.listen(PORT, () => {
    console.log('server connected on PORT 3000')
})

