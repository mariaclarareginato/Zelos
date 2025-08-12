// backend/index.js
import express from "express";
import cors from "cors";
import chamadosRoutes from "./routes/chamados.js";
import usuariosRoutes from "./routes/usuarios.js";

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

app.use("/api/chamados", chamadosRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
