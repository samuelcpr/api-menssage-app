module.exports = (err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ error: "Ocorreu um erro inesperado", message: err.message });
};
