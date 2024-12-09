const express = require("express"); // Use require em vez de import
const messageController = require("../Controllers/messageController"); // Exemplo de importação do controlador

const router = express.Router();

// Definindo as rotas para mensagens
router.get("/messages", messageController.getAllMessages);
router.get("/messages/:id", messageController.getMessageById);
router.post("/messages", messageController.createMessage);

module.exports = router; // Use module.exports ao invés de export default
