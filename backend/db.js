// Conexão com o banco de dados

import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "senaisitezelos",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
    return;
  }
  console.log("Conectado ao banco MySQL");
});

export default db;
