import { KafkaClient, Producer } from "kafka-node";
require("dotenv").config();

const kafkaClient = new KafkaClient({
  kafkaHost: `${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`, // Certifique-se de que essas variáveis estão no .env
});

const producer = new Producer(kafkaClient);

// Kafka Producer: Tratamento de erros e mensagens
producer.on("ready", () => {
  console.log("Kafka Producer está pronto.");
});

producer.on("error", (err) => {
  console.error("Erro no Kafka Producer:", err);
});

const sendMessage = (messageId, message) => {
  const payloads = [
    {
      topic: "test-topic",
      messages: JSON.stringify({ messageId, content: message }),
    },
  ];

  return new Promise((resolve, reject) => {
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error("Erro ao enviar mensagem para o Kafka:", err);
        return reject(err);
      }
      console.log("Mensagem enviada:", data);
      resolve(data);
    });
  });
};

export default {
  sendMessage,
};
