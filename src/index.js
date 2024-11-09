const express = require('express');
const rotas = require('./rotas');
const cors = require('cors');


const app = express();

app.use(express.json());

app.use(cors());

app.use(rotas);

const PORT = process.env.PORT || 3003;

app.listen(PORT, ()=> {
    console.log(`Servidor na Porta: ${PORT}`);
    
});