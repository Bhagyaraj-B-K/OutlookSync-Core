const fs = require('fs');
const path = require('path');
const promisePool = require("./db");
const runMigrations = async () => {
  try {
    const sqlFilePath = path.join(__dirname, "migrations", "create_tables.sql");
    const sql = fs.readFileSync(sqlFilePath, "utf8");

    // Execute the SQL commands
    await promisePool.query(sql);
    console.log("Migrations applied successfully");
  } catch (error) {
    console.error("Error applying migrations:", error);
  }
};

module.exports = runMigrations;
