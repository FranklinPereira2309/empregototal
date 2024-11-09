const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const segredo = require('../segredo');
const yup = require('yup');
const { setLocale } = require('yup')
const { pt } = require('yup-locales');
const { cnpj: cnpjUsuario } = require('cpf-cnpj-validator');


const loginEmpresa = async (req, res) => {
    const { email, cnpj, senha } = req.body;

    let empresaEncontrada = '';

    if (!senha) {
        return res.status(404).json({ mensagem: 'Oxi... Esqueceu foi?! Preencha no mínimo 02 campos, incluído a senha!' });
    }

    if(!cnpj && !email) {
        return res.status(404).json({mensagem:'Ops... verificar o Email ou CNPJ, por favor. Você deverá digitar 01 dos campos!'});
    }

    try {
        setLocale(pt);
        const schema = yup.object().shape({
            
            email: yup.string().email('Formato de e-mail inválido!'),
            cnpj: yup.string().notRequired().nullable().test('cnpj-valido', 'cnpj inválido', value => {if(!value) return true; return cnpjUsuario.isValid(value)}),
            senha: yup.string().min(5, 'A senha deve ter pelo menos 5 caracteres').required()
        });

        await schema.validate(req.body);

        if(email && cnpj && senha) {
            const {rows, rowCount: existeEmpresa} = await conexao.query('select * from empresas where cnpj = $1 and email = $2', [cnpj, email]);

            if(existeEmpresa === 0) {
                return res.status(404).json({mensagem: 'CNPJ ou Email não encontrados!. Verifique os dados digitados ou crie um novo Login.'});
            }

            empresaEncontrada = rows[0];
    
            
        }else if(cnpj && senha)  {


            const {rows, rowCount: existeCnpj} = await conexao.query('select * from empresas where cnpj = $1', [cnpj]);

            if(existeCnpj === 0) {
                return res.status(404).json({mensagem: 'CNPJ não encontrado! Verifique os dados digitados ou crie um novo Login.'});
            }
            
            empresaEncontrada = rows[0];

            
        }else if(email && senha) {
            const { rows, rowCount: existeEmail } = await conexao.query('select * from empresas where email = $1', [email]);
    
            if (existeEmail === 0) {
                return res.status(404).json({ mensagem: 'EMAIL não encontrado! Verifique os dados digitados ou crie um novo Login.'});
            }
    
            empresaEncontrada = rows[0];             

        }

        const senhaVerificada = await bcrypt.compare(senha, empresaEncontrada.senha)
    
        if (!senhaVerificada) {
            return res.status(404).json({ mensagem: 'Dados NÃO conferem, verifique a SENHA Digitada!'});
        }
        const token = jwt.sign({ id: empresaEncontrada.id }, segredo, { expiresIn: '1d' });
        
        
        const { senha: senhaEmpresa, ...empresa } = empresaEncontrada

        return res.status(200).json({
            empresa,
            token
        });


    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

module.exports = {
    loginEmpresa
}