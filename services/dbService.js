const db = require("../db"); // Import the MySQL connection

const dbService = {
  // Find a record in a table by condition
  find: async function (table, conditions) {
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const query = `SELECT * FROM ${table} WHERE ${conditionKeys
      .map((key) => `${key} = ?`)
      .join(" AND ")}`;
    const [rows] = await db.query(query, conditionValues);
    return rows;
  },

  // Find a single record by condition
  findOne: async function (table, conditions) {
    const rows = await this.find(table, conditions);
    return rows.length > 0 ? rows[0] : null;
  },

  // Insert a new record into a table
  create: async function (table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys
      .map(() => "?")
      .join(", ")})`;
    const [result] = await db.query(query, values);
    return result.insertId;
  },

  // Update a record in a table by condition
  update: async function (table, data, conditions) {
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const query = `UPDATE ${table} SET ${dataKeys
      .map((key) => `${key} = ?`)
      .join(", ")} WHERE ${conditionKeys
      .map((key) => `${key} = ?`)
      .join(" AND ")}`;
    const [result] = await db.query(query, [...dataValues, ...conditionValues]);
    return result.affectedRows;
  },

  // Delete a record from a table by condition
  delete: async function (table, conditions) {
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const query = `DELETE FROM ${table} WHERE ${conditionKeys
      .map((key) => `${key} = ?`)
      .join(" AND ")}`;
    const [result] = await db.query(query, conditionValues);
    return result.affectedRows;
  },

  findOrCreate: async function (table, conditions, data) {
    const record = await this.findOne(table, conditions);
    if (record) {
      return record; // Return the found record
    } else {
      const insertId = await this.create(table, { ...conditions, ...data });
      return await this.findOne(table, { id: insertId });
    }
  },
};

module.exports = dbService;
