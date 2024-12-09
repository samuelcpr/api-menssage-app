import Redis from "ioredis";
require("dotenv").config();

// Conexão com o Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// Verificando a conexão com o Redis
redis.on("connect", () => {
  console.log("Conectado ao Redis");
});

redis.on("error", (err) => {
  console.error("Erro de conexão com o Redis:", err);
});

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

// Função para salvar mensagem no Redis
const saveMessage = async (messageId, message) => {
  try {
    await redis.lpush(
      "messages",
      JSON.stringify({ messageId, content: message })
    );
    console.log("Mensagem salva no Redis");
  } catch (error) {
    console.error("Erro ao salvar mensagem no Redis:", error);
    throw new Error("Erro ao salvar mensagem no Redis");
  }
};

export default {
  getMessages,
  saveMessage,
};
