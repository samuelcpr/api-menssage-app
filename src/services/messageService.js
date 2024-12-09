import { Producer, KafkaClient } from "kafka-node";
import Redis from "ioredis";
import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";
require("dotenv").config();

// Configuração do Kafka
const kafkaClient = new KafkaClient({ kafkaHost: process.env.KAFKA_HOST });
const producer = new Producer(kafkaClient);

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// Configuração do PostgreSQL
const pgClient = new Client({
  host: process.env.POSTGRES_HOST || "postgres",
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || "admin",
  password: process.env.POSTGRES_PASSWORD || "admin",
  database: process.env.POSTGRES_DB || "mydatabase",
});

// Kafka Producer: Tratamento de erros e mensagens
producer.on("ready", () => console.log("Kafka Producer está pronto"));
producer.on("error", (err) => console.error("Erro no Kafka Producer:", err));

// Conectar ao PostgreSQL com tratamento de erros
pgClient
  .connect()
  .then(() => console.log("Conectado ao PostgreSQL"))
  .catch((err) => console.error("Erro ao conectar ao PostgreSQL:", err));

// Função para enviar a mensagem ao Kafka
const sendMessage = async (message) => {
  const messageId = uuidv4();
  const payloads = [
    {
      topic: "test-topic",
      messages: JSON.stringify({ messageId, content: message }),
    },
  ];

  try {
    return new Promise((resolve, reject) => {
      producer.send(payloads, (err, data) => {
        if (err) return reject(err);
        console.log("Mensagem enviada:", data);
        resolve({ messageId });
      });
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem para Kafka:", error);
    throw error;
  }
};

// Função para salvar a mensagem no Redis e PostgreSQL
const saveMessage = async (messageId, message) => {
  try {
    // Salvar no Redis
    await redis.lpush(
      "messages",
      JSON.stringify({ messageId, content: message })
    );

    // Salvar no PostgreSQL
    const query = "INSERT INTO messages (id, content) VALUES ($1, $2)";
    await pgClient.query(query, [messageId, message]);

    console.log("Mensagem salva no Redis e PostgreSQL");
  } catch (error) {
    console.error("Erro ao salvar no Redis ou PostgreSQL:", error);
    throw error;
  }
};

// Função para buscar mensagens do Redis
const getMessages = async () => {
  try {
    const messages = await redis.lrange("messages", 0, -1);
    return messages.map((msg) => JSON.parse(msg));
  } catch (error) {
    console.error("Erro ao buscar mensagens do Redis:", error);
    throw new Error("Erro ao buscar mensagens do Redis");
  }
};

export default { sendMessage, saveMessage, getMessages };
