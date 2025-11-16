import express from 'express';
import dotenv from 'dotenv';

import { AppRouter } from './routes/index.js';

dotenv.config();

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;
const hostname = process.env.HOSTNAME || 'localhost'


AppRouter(app);
app.get('/', (req, res) => {
    res.send('<h1>Hello</h1>')
})

app.listen(port, hostname, () => {
    console.log(`Server đang chạy http://${hostname}:${port}`)
});