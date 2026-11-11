const fs = require("fs");
const path = require("path");
const pool = require("./pool");

async function migrate() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(sql);
    console.log("MIRAGE: tablas preparadas");
  } finally {
    await pool.end();
  }
}

migrate().catch(error => {
  console.error("Error preparando las tablas:", error.message);
  process.exitCode = 1;
});
