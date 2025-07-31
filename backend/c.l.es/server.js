// Importações

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3004;

// Middleware para login e cadastro

app.use(cors());
app.use(express.json());


// Arquivo json para armazenar dados

const fs = require('fs');
const path = require('path');
const usuariosPath = path.join(__dirname, 'usuarios.json');



// Função para ler os usuários do arquivo

function lerUsuarios() {
    try {
        const data = fs.readFileSync(usuariosPath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Erro ao ler os usuários:', err);
        return [];
    }
}

function salvarUsuarios(usuarios) {
    try {
        fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
        console.log('Usuário salvo com sucesso!');
    } catch (err) {
        console.error('Erro ao salvar usuario:', err);
    }
};







// Rota para Cadastro 

app.post('/cadastro', (req, res) => {
    const { cpf, email, senha } = req.body;

    if (!cpf || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios!' });
    }


    const usuarios = lerUsuarios();
    const usuarioExistente = usuarios.find(user => user.email === email);

    if (usuarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado.' });
    }

    usuarios.push({ cpf, email, senha });
    salvarUsuarios(usuarios);

    console.log('Usuário Cadastrado: ', { cpf, email, senha });
    res.json({ mensagem: 'Cadastro realizado com sucesso!' });
});





// Rota para Login 

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }


    const usuarios = lerUsuarios();
    const usuario = usuarios.find(user => user.email === email && user.senha === senha);

    if (!usuario) {
        return res.status(401).json({ mensagem: 'Informações inválidas' });
    }

    res.json({ mensagem: 'Login realizado com sucesso', email: usuario.email });
});



// Rota esqueci a senha 

app.post('/esquecisenha', (req, res) => {
    const { email, novaSenha } = req.body;
  
    if (!email || !novaSenha) {
      return res.status(400).json({ mensagem: 'Os campos email e nova senha são obrigatórios.' });
    }
  
    const usuarios = lerUsuarios(); 
    const usuario = usuarios.find(user => user.email === email); 
  
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
  
    if (usuario.senha === novaSenha) {
      return res.status(400).json({ mensagem: 'A nova senha não pode ser igual à senha atual.' });
    }
  
    usuario.senha = novaSenha;
    salvarUsuarios(usuarios); 
  
    console.log('Senha atualizada para o usuário:', email);
    res.json({ mensagem: 'Senha atualizada com sucesso!' });
  });
  

  

// Para rodar o servidor 

app.listen(port, () => {
 console.log(`Servidor rodando em http://localhost:${port}`);
});