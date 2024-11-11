const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const yup = require('yup');
const { setLocale } = require('yup')
const { pt } = require('yup-locales');
const {cpf: cpfUsuario} = require('cpf-cnpj-validator');
require('dotenv').config();

const loginUsuario = async (req, res) => {
    const { email, cpf, senha } = req.body;
    let usuarioEncontrado = '';
    

    if (!senha) {
        return res.status(404).json({ mensagem: 'Oxi... Esqueceu foi?! Preencha no mínimo 02 campos, incluído a senha!'});
    }

    if(!cpf && !email) {
        return res.status(404).json({mensagem:'Ops... verificar o Email ou CPF, por favor. Você deverá digitar 01 dos campos!'});
    }

    try {
        setLocale(pt);
        const schema = yup.object().shape({
            
            email: yup.string().email('Formato de e-mail inválido!'),
            cpf: yup.string().notRequired().nullable().test('cpf-valido', 'cpf inválido', value => {if(!value) return true; return cpfUsuario.isValid(value)}),
            senha: yup.string().min(5, 'A senha deve ter pelo menos 5 caracteres')
        });

        await schema.validate(req.body);

        if(email && cpf && senha) {
            const {rows, rowCount: existeUsuario} = await conexao.query('select * from usuarios where email = $1 and cpf = $2', [email, cpf]);

            if(existeUsuario === 0) {
                return res.status(404).json({mensagem: 'CPF ou Email não encontrados!. Verifique os dados digitados ou crie um novo Login.'});
            }

            usuarioEncontrado = rows[0];
    
            
        }else if(cpf && senha)  {

            const {rows, rowCount: existeCpf} = await conexao.query('select * from usuarios where cpf = $1', [cpf]);

            if(existeCpf === 0) {
                if(Number(cpf.length) > 11) {
                    return res.status(404).json({mensagem:'CPF Inválido!'});
                }
                return res.status(404).json({mensagem: 'CPF não encontrado. Verifique os dados digitados ou crie um novo Login.'});
            }

            usuarioEncontrado = rows[0];
            
        }else if(email && senha) {
            const { rows, rowCount: existeEmail } = await conexao.query('select * from usuarios where email = $1', [email]);
    
            if (existeEmail === 0) {
                return res.status(404).json({ mensagem: 'Email não Cadastrado! Verifique os dados  digitados ou crie um novo Login.'});
            }
    
            usuarioEncontrado = rows[0];             

        }

        const senhaVerificada = await bcrypt.compare(senha, usuarioEncontrado.senha)
    
        if (!senhaVerificada) {
            return res.status(404).json({ mensagem: 'Dados NÃO conferem, verifique os Dados Digitados!'});
        }
        const token = jwt.sign({ id: usuarioEncontrado.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const { senha: senhaUsuario, ...usuario } = usuarioEncontrado

        return res.status(200).json({
            usuario,
            token
        });


    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

module.exports = {
    loginUsuario
}