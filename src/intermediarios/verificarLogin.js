const jwt = require('jsonwebtoken');
const segredo = require('../segredo');
const conexao = require('../bancoDeDados/conexao');

const verificarLogin = async (req, res, next) => {
    const { authorization } = req.headers;    
        
    if(authorization === 'Bearer'){
        
        return res.status(401).json({ mensagem : 'O campo TOKEN está vazio!' });
    }
       
    try {
        const token = authorization.replace('Bearer ', '').trim();
        
        const { id } = jwt.verify(token, segredo);

        const { rows, rowCount } = await conexao.query('select * from usuarios where id = $1', [id]);


        if (rowCount === 0) {
            return res.status(403).json({ mensagem : 'O usuário logado não é o mesmo do Token!' });
        }

        const { senha, ...usuario } = rows[0];
        
        req.usuario = usuario;             

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensagem: 'Para acessar este recurso o usuário deve estar logado e possuir um token válido. Favor realizar login.' });
        }
        return res.status(400).json({ mensagem: "Ocorreu um erro desconhecido. - " + error.message }); 
    }
}
const verificarLoginEmpresa = async (req, res, next) => {
    const { authorization } = req.headers;
        
        
    if(authorization === 'Bearer'){
        
        return res.status(401).json({ mensagem : 'O campo TOKEN está vazio!' });
    }
       
    try {
        const token = authorization.replace('Bearer ', '').trim();
        
        const { id } = jwt.verify(token, segredo);

        const { rows, rowCount } = await conexao.query('select * from empresas where id = $1', [id]);


        if (rowCount === 0) {
            return res.status(403).json({ mensagem : 'O usuário logado não é o mesmo do Token!' });
        }

        const { senha, ...empresa } = rows[0];
              
        
        req.empresa = empresa;

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensagem: 'Para acessar este recurso o usuário deve estar logado e possuir um token válido. Favor realizar login.' });
        }
        return res.status(400).json({ mensagem: "Ocorreu um erro desconhecido. - " + error.message }); 
    }
}

module.exports = {
    verificarLogin,
    verificarLoginEmpresa
    
}