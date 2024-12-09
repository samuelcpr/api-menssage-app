const express = require("express"); // Usando require ao invés de import
const messageRoutes = require("./routes/messageRoutes"); // Exemplo de require de outras rotas

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(messageRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
