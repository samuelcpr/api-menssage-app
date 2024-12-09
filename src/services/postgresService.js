import { Client } from "pg";
require("dotenv").config();

const pgClient = new Client({
  host: process.env.POSTGRES_HOST || "postgres", // endereço do host do PostgreSQL
  port: process.env.POSTGRES_PORT || 5432, // porta do PostgreSQL
  user: process.env.POSTGRES_USER || "admin", // usuário para autenticação
  password: process.env.POSTGRES_PASSWORD || "admin", // senha do usuário
  database: process.env.POSTGRES_DB || "mydatabase", // nome do banco de dados
});

// Conectando ao PostgreSQL e tratando possíveis erros
const connectToDatabase = async () => {
  try {
    await pgClient.connect();
    console.log("Conectado ao PostgreSQL");
  } catch (error) {
    console.error("Erro ao conectar ao PostgreSQL:", error);
    process.exit(1); // Se a conexão falhar, o processo é encerrado
  }
};

const saveMessage = async (messageId, message) => {
  const query = "INSERT INTO messages (id, content) VALUES ($1, $2)";

  try {
    await pgClient.query(query, [messageId, message]);
    console.log(`Mensagem com ID ${messageId} salva com sucesso!`);
  } catch (error) {
    console.error("Erro ao salvar a mensagem:", error);
  }
};

// Chama a função para conectar ao banco e realizar operações
connectToDatabase();

export default {
  saveMessage,
};
