import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const hostname = process.env.HOSTNAME || 'localhost'

app.get('/', (req, res) => {
    res.send('<h1>Hello</h1>')
})

app.listen(port, hostname, () => {
    console.log(`Server đang chạy http://${hostname}:${port}`)
});