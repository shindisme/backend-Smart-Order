import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppRouter } from './routes/index.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://frontend-smart-order.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

AppRouter(app);

app.get('/', (req, res) => {
    res.send('<h1>Hello</h1>');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server đang chạy ${port}`);
});
