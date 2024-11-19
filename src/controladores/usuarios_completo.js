const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const yup = require('yup');
const { setLocale } = require('yup')
const { pt } = require('yup-locales');


const cadastrarUsuario = async (req, res) => {
    const { usuario} = req;

    const { 
        nome_completo, 
        email, 
        telefone, 
        cep, 
        logradouro, 
        numero, 
        bairro, 
        complemento, 
        cidade, 
        estado, 
        data_nascimento, 
        genero, 
        usuario_id 
    } = req.body;

    try {
        
        setLocale(pt);
        const schema = yup.object().shape({
            nome_completo: yup.string().required('Nome completo é obrigatório.'), 
            email: yup.string().email('Email inválido.').required('Email é obrigatório.'), 
            telefone: yup.string().required('O Telefone é Obrigatório.'), 
            cep: yup.string().required('O Cep é obrigatório.'),
            logradouro: yup.string().required('Logradouro é obrigatório.'), 
            cidade: yup.string().required('Cidade é obrigatória.'), 
            estado: yup.string().length(2, 'Estado deve ter exatamente 2 caracteres.'), 
            bairro: yup.string().required('Bairro é obrigatório.'), 
            numero: yup.number().required('Número é obrigatório.').positive('Número deve ser positivo.'), 
            complemento: yup.string(), 
            data_nascimento: yup.date().required('Data de Nascimento é obrigatória.'), 
            genero: yup.string().oneOf(['masculino', 'feminino'], 'Gênero deve ser masculino ou feminino.'), 
        });

        await schema.validate(req.body);


        const queryCriarUsuario = `INSERT INTO usuarios_completos (
                        nome_completo, 
                        email, 
                        telefone, 
                        cep, 
                        logradouro, 
                        numero, 
                        bairro, 
                        complemento, 
                        cidade, 
                        estado, 
                        data_nascimento, 
                        genero,
                        usuario_id 
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING *`; 

        const existeUsuario = `select * from usuarios_completos where usuario_id = $1`;

        const {rows: usuarioExistente, rowCount: dadosUsuario} = await conexao.query(existeUsuario, [usuario.id]);   

        
        if(usuarioExistente[0]) {
            return res.status(200).json({mensagem:'Dados cadastrais já realizados!'});
        }
        const { rows, rowCount } = await conexao.query(queryCriarUsuario, [
            nome_completo, 
            email, 
            telefone, 
            cep, 
            logradouro, 
            numero, 
            bairro, 
            complemento, 
            cidade, 
            estado, 
            data_nascimento, 
            genero, 
            usuario_id 
        ]);
        
        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível criar o usuário.' });
        }

        
        return res.status(201).json({}); 

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}


const consultarUsuario = async (req, res) => {
    
    const { usuario } = req;
    
    try {
                
        if (!usuario) {
            return res.status(401).json({ mensagem: 'Precisa Logar!' });
        }

        
        const dadosUsuario = `select * from usuarios_completos where usuario_id = $1`;

        const { rows, rowCount} = await conexao.query(dadosUsuario, [usuario.id]);

        // if(rowCount === 0) {
        //     return res.status(404).json({mensagem:'Não há Dados Cadastrados!'});
        // }
        
        return res.status(200).json(rows[0]);

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}`});
    }    
}

const consultarTodosUsuario = async (req, res) => {
    
    const { usuario } = req;

    
    try {
                
        if (!usuario) {
            return res.status(401).json({ mensagem: 'Precisa Logar!' });
        }

        
        const dadosUsuario = `select * from usuarios_completos`;

        const { rows, rowCount} = await conexao.query(dadosUsuario);

        // if(rowCount === 0) {
        //     return res.status(404).json({mensagem:'Não há Dados Cadastrados!'});
        // }
        
        return res.status(200).json(rows);

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}

const atualizarUsuario = async (req, res) => {
    const { usuario} = req;

    const { 
        nome_completo, 
        email, 
        telefone, 
        cep, 
        logradouro, 
        numero, 
        bairro, 
        complemento, 
        cidade, 
        estado, 
        data_nascimento, 
        genero, 
         
    } = req.body;

    
    try { 
        
        setLocale(pt);
        const schema = yup.object().shape({
            nome_completo: yup.string().required('Nome completo é obrigatório.'), 
            email: yup.string().email('Email inválido.').required('Email é obrigatório.'), 
            telefone: yup.string().required('O Telefone é Obrigatório.'), 
            cep: yup.string().required('O Cep é obrigatório.'),
            logradouro: yup.string().required('Logradouro é obrigatório.'), 
            cidade: yup.string().required('Cidade é obrigatória.'), 
            estado: yup.string().length(2, 'Estado deve ter exatamente 2 caracteres.'), 
            bairro: yup.string().required('Bairro é obrigatório.'), 
            numero: yup.number().required('Número é obrigatório.').positive('Número deve ser positivo.'), 
            complemento: yup.string(), 
            data_nascimento: yup.date().required('Data de aniversário é obrigatória.'), 
            genero: yup.string().oneOf(['masculino', 'feminino'], 'Gênero deve ser masculino ou feminino.'), 
        });

        await schema.validate(req.body);

        const exiteUsuario = `SELECT * FROM usuarios_completos WHERE usuario_id = $1`;

        const { rows:user, rowCount:dadosUser} = await conexao.query(exiteUsuario, [usuario.id]);

        if(dadosUser === 0) {
            return res.status(404).json({mensagem: 'Dados não encontrados!'});
        } 

        
        const queryCriarUsuario = `UPDATE usuarios_completos SET
                        nome_completo = $1, 
                        email = $2, 
                        telefone = $3, 
                        cep = $4, 
                        logradouro = $5, 
                        numero = $6, 
                        bairro = $7, 
                        complemento = $8, 
                        cidade = $9, 
                        estado = $10, 
                        data_nascimento = $11, 
                        genero = $12
                        WHERE usuario_id = $13` 

        
        const { rows, rowCount } = await conexao.query(queryCriarUsuario, [
            nome_completo, 
            email, 
            telefone, 
            cep, 
            logradouro, 
            numero, 
            bairro, 
            complemento, 
            cidade, 
            estado, 
            data_nascimento, 
            genero, 
            usuario.id
           
        ]);
        
        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível criar o usuário.' });        
        }
        
        return res.status(201).json({}); 

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

const deletarUsuario = async (req, res) => {
    const idExclusao = Number(req.params.id);

    
    if(isNaN(idExclusao)) {
        return res.status(401).json({mensagem: 'Deve ser digitado um id válido!'});
    }

    try {
               
        
        const existeId = `select * from usuarios_completos where usuario_id = $1`
        const {rowCount: localizarUsuario} = await conexao.query(existeId, [idExclusao]);

        if(localizarUsuario === 0 ) {
            return res.status(400).json({mensagem: 'Id ou Usuario não encontrados!'});
        }

        const deletarUsuario = `delete from usuarios_completos where usuario_id = $1`;

        const {rowCount} = await conexao.query(deletarUsuario, [idExclusao]);

        if(rowCount === 0 ) {
            return res.status(400).json({mensagem: 'Não foi possível excluir Cadastro do Usuário'})
        }

        return res.status(201).json({mensagem: 'Excluído com sucesso!'});

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}`});
    }
}





module.exports = {
    cadastrarUsuario,
    consultarUsuario,
    consultarTodosUsuario,
    atualizarUsuario,
    deletarUsuario
}