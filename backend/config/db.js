import { Pool } from "pg";
import "dotenv/config";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

const pool = new Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
});

pool.on("connect", () => {
    console.log("Connected to the database");
})

pool.on("error", (err)=> {
    console.error("Database error:", err);
})

export default pool;