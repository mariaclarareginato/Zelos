const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json()); 

// Configurar conexão com seu banco MySQL

const db = mysql.createPool({
  host: "localhost",       
  user: "root",            
  password: "",   
  database: "zelos"
});

app.get("/", (req, res) => {
  res.send("API Zelos funcionando!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
