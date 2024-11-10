require('dotenv').config();
const { Pool } = require('pg');

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'postgres',
//     password: '88321656',
//     port: 5432,
//     ssl: {
//         rejectUnauthorized: false
//     } 
// });

const user = process.env.DB_USER;
const host = process.env.DB_LOCALHOST;
const database = process.env.DB_DATABASE;
const password = process.env.DB_PASSWORD;
const port = process.env.DB_PORT;

const pool = new Pool({
    user,
    host,
    database,
    password,
    port,
    ssl:{
        rejectUnauthorized: false
    }

});



const query = (text, param) => {
    return pool.query(text, param);
}

module.exports = {
    query
}

