const { Client } = require("pg");

const pgClient = new Client({
  host: "postgres",
  port: 5432,
  user: "admin",
  password: "admin",
  database: "mydatabase",
});

pgClient
  .connect()
  .catch((err) => console.error("Erro ao conectar ao PostgreSQL:", err));

module.exports = pgClient;
