require('dotenv').config()
const { Pool } = require('pg');
var pool = null

try {
    pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false  // Render necesita SSL, y esto evita errores
    }
    });
    console.log(process.env.PGPASSWORD)


}catch (error) {
    console.log(error)
}

module.exports = pool;