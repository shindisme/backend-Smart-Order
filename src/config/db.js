import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'smart-order',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,

});

// check
pool.getConnection()
    .then(() => {
        console.log('Kết nối MYSQL thành công!');
    })
    .catch(err => {
        console.log('Lỗi kết nối MYSQL: ', err.message);
    })

export default pool;