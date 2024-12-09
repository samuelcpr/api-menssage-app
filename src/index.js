require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { KafkaClient, Producer, Consumer } = require("kafka-node");
const Redis = require("ioredis");
const { Client } = require("pg");

const app = express();
app.use(bodyParser.json());

// Configuração do Kafka
const kafkaClient = new KafkaClient({
  kafkaHost: `${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`,
});

const producer = new Producer(kafkaClient);
producer.on("ready", () => {
  console.log("Kafka Producer está pronto.");
});
producer.on("error", (err) => {
  console.error("Erro no Kafka Producer:", err);
});

// Configuração do Consumer
const consumer = new Consumer(
  kafkaClient,
  [{ topic: "test-topic", partition: 0 }],
  { autoCommit: true }
);

consumer.on("message", (message) => {
  console.log("Mensagem recebida do Kafka:", message.value);

  // Salvar no Redis
  redis
    .lpush("messages", message.value)
    .catch((err) => console.error("Erro ao salvar no Redis:", err));

  // Salvar no PostgreSQL
  saveMessageToPostgres(message.value)
    .then(() => console.log("Mensagem salva no PostgreSQL"))
    .catch((err) => console.error("Erro ao salvar no PostgreSQL:", err));
});

consumer.on("error", (err) => {
  console.error("Erro no Kafka Consumer:", err);
});

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => {
  console.log("Conectado ao Redis.");
});

redis.on("error", (err) => {
  console.error("Erro no Redis:", err);
});

// Configuração do PostgreSQL
const pgClient = new Client({
  host: "postgres", // Nome do serviço do PostgreSQL no Docker
  port: 5432,
  user: "admin",
  password: "admin",
  database: "mydatabase",
});

pgClient
  .connect()
  .then(() => console.log("Conectado ao PostgreSQL"))
  .catch((err) => console.error("Erro ao conectar ao PostgreSQL:", err));

// Função para salvar a mensagem no PostgreSQL
const saveMessageToPostgres = async (message) => {
  try {
    const query = "INSERT INTO messages (content) VALUES ($1)";
    await pgClient.query(query, [message]);
  } catch (error) {
    console.error("Erro ao salvar no PostgreSQL:", error);
  }
};

// Endpoint para enviar mensagens para o Kafka
app.post("/send", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const payloads = [{ topic: "test-topic", messages: message }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error("Erro ao enviar mensagem:", err);
      return res.status(500).json({ error: "Erro ao enviar mensagem" });
    }
    console.log("Mensagem enviada:", data);
    return res
      .status(200)
      .json({ message: "Mensagem enviada com sucesso", data });
  });
});

// Endpoint para buscar mensagens do Redis
app.get("/messages", async (req, res) => {
  try {
    const messages = await redis.lrange("messages", 0, -1);
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
