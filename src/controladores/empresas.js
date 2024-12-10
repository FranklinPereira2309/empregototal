const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const yup = require('yup');
const { setLocale } = require('yup')
const { pt } = require('yup-locales');
const { cnpj: cnpjUsuario } = require('cpf-cnpj-validator');
const transport = require('../bancoDeDados/nodemailer');


const cadastrarLoginEmpresa = async (req, res) => {
    const { nome, email, cnpj, senha } = req.body;

    try {
        setLocale(pt);
        const schema = yup.object().shape({
            nome: yup.string().required(),
            email: yup.string().email('Formato de e-mail é inválido!').required(),
            cnpj: yup.string().required().matches(/^\d{14}$/, 'O CNPJ deve conter apenas números').test('cnpj-valido', 'cnpj inválido', value => cnpjUsuario.isValid(value)),
            senha: yup.string().min(5, 'A senha deve ter pelo menos 5 caracteres').required()
        });

        await schema.validate(req.body);

        const { rowCount: existeEmail } = await conexao.query('select * from empresas where email = $1', [email]);

        if (existeEmail > 0) {
            return res.status(404).json({ mensagem: 'O EMAIL digitado já existe.' });
        }

        const {rowCount: existeCnpj} = await conexao.query('select * from empresas where cnpj = $1', [cnpj]);

        if(existeCnpj) {
            return res.status(404).json({mensagem: 'O CNPJ digitado já existe.'});
        }

        const senhaEncriptada = await bcrypt.hash(senha, 10);

        const queryCriarUsuario = 'insert into empresas(nome, email, cnpj, senha) values($1, $2, $3, $4)';

        const { rows, rowCount } = await conexao.query(queryCriarUsuario, [nome, email, cnpj, senhaEncriptada]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível criar o  USUÁRIO.' });
        }

        const { rows: usuario } = await conexao.query('select * from empresas where email = $1', [email]);

        const { senha: senhaUsuario, ...dadosUsuario } = usuario[0];

        const { nome:nomeCadastrado, email:emailCadastrado, cnpj:cnpjCadastrado } = usuario[0]

        const html = `
                <div>
                <h1>Bem-vindo(a), <span class="info">${nomeCadastrado}</span>!</h1>
                <p>Estamos muito felizes em ter você conosco! Sua conta foi criada com sucesso.</p>
                <p>Aqui estão os seus dados de cadastro:</p>
                <ul>
                    <li><strong>Nome:</strong> <span>${nomeCadastrado}</span></li>
                    <li><strong>Email:</strong> <span>${emailCadastrado}</span></li>
                    <li><strong>CNPJ:</strong> <span>${cnpjCadastrado}</span></li>
                    <li><strong>Senha:</strong> <span></span>${senha}</li>
                </ul>
                <p>Guarde essas informações em um local seguro. Caso precise de ajuda, nossa equipe está à disposição!</p>
                <p>Atenciosamente,<br>Sua equipe de suporte</p>
        `

        const sender = {
            address: "empregototal_adm@gmail.com",
            name: "Emprego Total",
        };
        const recipients = [
            email
        ];
        transport
            .sendMail({
                from: sender,
                to: recipients,
                subject: "Novo Usuário Criado!",
                text: "Congrats for sending test email with Mailtrap!",
                html: html,
                category: "Integration Test",
                sandbox: true
            })
            .then(console.log, console.error);


        return res.status(201).json(dadosUsuario);


    } catch (error) {
        return res.status(500).json({mensagem: `${error.message}`});
    }
}

const consultarLoginEmpresa = async (req, res) => {
    const { empresa } = req;
    try {

        if (!empresa) {
            return res.status(401).json({ mensagem: 'O usuário não foi encotrado, você precisa está autenticado!' });
        }
        
        const { senha, ...empresaAtual } = empresa;

        return res.status(200).json(empresaAtual);

    } catch (error) {
        return res.status(500).json({mensagem: `${error.message}` });
    }

}

const alterarSenhaEmpresa = async (req, res) => {
    const { empresa } = req;

    const {
        senhaAtual,
        novaSenha
    } = req.body

    try {
        setLocale(pt);
        const schema = yup.object().shape({
            senhaAtual: yup.string().min(5, 'A senha deve ter pelo menos 5 caracteres').required(),
            novaSenha: yup.string().min(5, 'A senha deve ter pelo menos 5 caracteres').required()
        });

        await schema.validate(req.body);
        const existeEmpresa = `select * from empresas where email = $1 and id = $2`;
    
        const { rows, rowCount } = await conexao.query(existeEmpresa, [empresa.email, empresa.id]);
    
        if(rowCount === 0) {
            return res.status(404).json({mensagem: 'Usuário não encontrado'});
        }
        
        const { nome:nomeCadastrado, email:emailCadastrado, cnpj:cnpjCadastrado } = rows[0];

        const usuarioEncontrado = rows[0];
    
        const senhaVerificada = await bcrypt.compare(senhaAtual, usuarioEncontrado.senha);
    
        if(!senhaVerificada) {
            return res.status(400).json({mensagem: 'A Senha atual digitada está errada!'});
        }
    
        const atualizarSenha = `update empresas set senha = $1 where id = $2`

        const senhaEncriptada = await bcrypt.hash(novaSenha, 10);
    
        const { rowCount:dadosEncontrados} = await conexao.query(atualizarSenha, [senhaEncriptada, empresa.id]);
    
        if(dadosEncontrados === 0) {
            return res.status(400).json({mensagem: 'Não foi possível alterar a senha!'});
    
        }
        
        const html = `
                <div>
                <h1>Alteração de Senha realizada com sucesso!, <span class="info">${nomeCadastrado}</span>!</h1>
                <p>Caso não tenha sido você altere sua senha imediatamente ou entre em contato conosco!</p>
                 
                <p>Aqui estão os seus dados de cadastro:</p>
                <ul>
                    <li><strong>Nome:</strong> <span>${nomeCadastrado}</span></li>
                    <li><strong>Email:</strong> <span>${emailCadastrado}</span></li>
                    <li><strong>CPF:</strong> <span>${cnpjCadastrado}</span></li>
                    <li><strong>Nova Senha:</strong> <span></span>${novaSenha}</li>
                </ul>
                <p>Guarde essas informações em um local seguro. Caso precise de ajuda, nossa equipe está à disposição!</p>
                <p>Atenciosamente,<br>Sua equipe de suporte</p>
        `

        const sender = {
            address: "empregototal_adm@gmail.com",
            name: "Emprego Total",
        };
        const recipients = [
            emailCadastrado
        ];
        transport
            .sendMail({
                from: sender,
                to: recipients,
                subject: "Alteração de Senha!",
                text: "Congrats for sending test email with Mailtrap!",
                html: html,
                category: "Integration Test",
                sandbox: true
            })
            .then(console.log, console.error);
    
        return res.status(201).json({});
        
    } catch (error) {
        return res.status(500).json({mensagem: `${error.message}`});
    }

}

const alterarSenhaEmpresaDeslogado = async (req, res) => {
    
    const {
        email,
        cnpj,
        novaSenha
    } = req.body

    try {
        setLocale(pt);
        const schema = yup.object().shape({
            email: yup.string().email('Formato de e-mail é inválido!').required(),
            cnpj: yup.string().required().matches(/^\d{14}$/, 'O CNPJ deve conter apenas números').test('cnpj-valido', 'cnpj inválido', value => cnpjUsuario.isValid(value)),
            novaSenha: yup.string().min(5, 'A senha deve ter pelo menos 5 caracteres').required()
        });

        await schema.validate(req.body);
        const existeUsuario = `select * from empresas where email = $1 and cnpj = $2`;
    
        const { rows, rowCount } = await conexao.query(existeUsuario, [email, cnpj]);
    
        if(rowCount === 0) {
            return res.status(404).json({mensagem: 'Dados digitados não conferem!'});
        }

        const { nome:nomeCadastrado, email:emailCadastrado, cnpj:cnpjCadastrado } = rows[0];
    
        const { id } = rows[0];
    
        const senhaEncriptada = await bcrypt.hash(novaSenha, 10);
        
        const atualizarSenha = `update empresas set senha = $1 where id = $2`

    
        const { rows: dadosAlterados, rowCount:dadosEncontrados} = await conexao.query(atualizarSenha, [senhaEncriptada, id]);
    
        if(dadosEncontrados === 0) {
            return res.status(400).json({mensagem: 'Não foi possível alterar a senha!'});
    
        }

        const html = `
                <div>
                <h1>Recuperação de Senha realizada com sucesso!, <span class="info">${nomeCadastrado}</span>!</h1>
                <p>Caso não tenha sido você altere sua senha imediatamente ou entre em contato conosco!</p>
                 
                <p>Aqui estão os seus dados de cadastro:</p>
                <ul>
                    <li><strong>Nome:</strong> <span>${nomeCadastrado}</span></li>
                    <li><strong>Email:</strong> <span>${emailCadastrado}</span></li>
                    <li><strong>CPF:</strong> <span>${cnpjCadastrado}</span></li>
                    <li><strong>Nova Senha:</strong> <span></span>${novaSenha}</li>
                </ul>
                <p>Guarde essas informações em um local seguro. Caso precise de ajuda, nossa equipe está à disposição!</p>
                <p>Atenciosamente,<br>Sua equipe de suporte</p>
        `

        const sender = {
            address: "empregototal_adm@gmail.com",
            name: "Emprego Total",
        };
        const recipients = [
            emailCadastrado
        ];
        transport
            .sendMail({
                from: sender,
                to: recipients,
                subject: "Alteração de Senha!",
                text: "Congrats for sending test email with Mailtrap!",
                html: html,
                category: "Integration Test",
                sandbox: true
            })
            .then(console.log, console.error);
    
        return res.status(201).json({});
        
    } catch (error) {
        return res.status(500).json({mensagem: `${error.message}`});
    }

}



module.exports = {
    cadastrarLoginEmpresa,
    consultarLoginEmpresa,
    alterarSenhaEmpresa,
    alterarSenhaEmpresaDeslogado  
    
}