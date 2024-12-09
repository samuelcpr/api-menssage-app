// src/controllers/messageController.js

const createMessage = (req, res) => {
  // Lógica para criar uma nova mensagem
  res.status(201).json({ message: "Mensagem criada com sucesso!" });
};

const getAllMessages = (req, res) => {
  // Lógica para obter todas as mensagens
  res
    .status(200)
    .json({ messages: ["Mensagem 1", "Mensagem 2", "Mensagem 3"] });
};

const getMessageById = (req, res) => {
  const { id } = req.params;
  // Lógica para obter uma mensagem por ID
  res.status(200).json({ message: `Mensagem com ID ${id}` });
};

module.exports = { createMessage, getAllMessages, getMessageById };
