const { KafkaClient, Producer, Consumer } = require("kafka-node");

const kafkaClient = new KafkaClient({
  kafkaHost: `${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`,
});

const producer = new Producer(kafkaClient);
const consumer = new Consumer(
  kafkaClient,
  [{ topic: "test-topic", partition: 0 }],
  { autoCommit: true }
);

module.exports = { producer, consumer };
