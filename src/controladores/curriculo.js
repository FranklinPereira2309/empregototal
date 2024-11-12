const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const yup = require('yup');
const { setLocale } = require('yup')
const { pt } = require('yup-locales');



const cadastrarCurriculo = async (req, res) => {

    const { usuario } = req;

    const {
        nome,
        email,
        telefone,
        endereco,
        formacao,
        objetivo,
        experiencia,
        habilidades,
        idiomas,
        referencias,
        tipo,
        usuario_id
    } = req.body;

    try {

        setLocale(pt);
        const schema = yup.object().shape({
            nome: yup.string().required('Nome completo é obrigatório.'),
            email: yup.string().email().required('Email é obrigatório.'),
            telefone: yup.string().required('Telefone é obrigatório.'),
            endereco: yup.string().required('Logradouro é obrigatório.'),                       
            formacao: yup.string().required('Formação é obrigatório.').max(1024),
            objetivo: yup.string().required('Objetivo é obrigatório.').max(1024),
            experiencia: yup.string().required('Experiência é obrigatório.').max(1024),
            habilidades: yup.string().required('Habilidade é obrigatório.').max(1024),
            idiomas: yup.string().required('Idioma é obrigatório.').max(255),
            referencias: yup.string().required('Referência é obrigatório.').max(255),
            tipo: yup.string().oneOf(['medio', 'tecnico', 'profissional'], 'Tipo de Curriculo deve ser selecionado!'),

        });

        await schema.validate(req.body);

        const curriculoTipo = tipo;
        
        if(curriculoTipo === 'medio') {

            const medio = `select * from curriculos where usuario_id = $1 and tipo = $2`;
    
            const { rows: tipoMedio, rowCount:dadosMedio} = await conexao.query(medio, [usuario.id, tipo]);
    
            if(dadosMedio > 0) {
                return res.status(400).json({mensagem:'Já exitem um Curriculo do tipo Médio!'});
            }
        }

        if(curriculoTipo === 'tecnico') {
            const tecnico = `select * from curriculos where usuario_id = $1 and tipo = $2`;
    
            const { rows:tipoTecnico, rowCount:dadosTecnico} = await conexao.query(tecnico, [usuario.id, tipo]);
    
            if(dadosTecnico > 0) {
                return res.status(400).json({mensagem:'Já exitem um Curriculo do tipo Técnico!'});
            }

        }

        if(curriculoTipo === 'profissional') {

            const profissional = `select * from curriculos where usuario_id = $1 and tipo = $2`;
    
            const { rows:tipoProfissional, rowCount:dadosProfissional} = await conexao.query(profissional, [usuario.id, tipo]);
    
            if(dadosProfissional > 0) {
                return res.status(400).json({mensagem:'Já exitem um Curriculo do tipo Profissional!'});
            }                         
        }

                


        const queryCriarUsuario = `INSERT INTO curriculos (
                        nome, 
                        email, 
                        telefone, 
                        endereco, 
                        objetivo, 
                        formacao, 
                        experiencia, 
                        habilidades,
                        idiomas,
                        referencias,
                        tipo,
                        usuario_id 
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING *`;

        const { rows, rowCount } = await conexao.query(queryCriarUsuario, [
            nome,
            email,
            telefone,
            endereco,
            formacao,
            objetivo,
            experiencia,
            habilidades,
            idiomas,
            referencias,
            tipo,
            usuario_id
        ]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível criar o curriculo.' });
        }

        
        return res.status(201).json(rows[0]); 

    } catch (error) {
        console.error('Erro ao cadastrar curriculo:', error); 
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}
const cadastrarCurriculoSelecionado = async (req, res) => {
    
    const {
        curriculo_id,
        visualizar_curriculo

    } = req.body;

    try {

        setLocale(pt);
        const schema = yup.object().shape({
            curriculo_id: yup.string().required('O Id do curriculo é obrigatório!'),
            visualizar_curriculo: yup.bool().required('Informar True ou False para tornar disponível o Curriculo pra visualização!')
        });

        await schema.validate(req.body);

        const existeCurriculo = `select * from curriculos_selecionados where curriculo_id = $1`;

        const {rowCount: curriculoEncontrado} = await conexao.query(existeCurriculo, [Number(curriculo_id)]);
                

        if(curriculoEncontrado > 0) {
            return res.status(404).json({ mensagem: 'Curriculo já cadastrado!'});
        }             

        const querySelecionarCurriculo = `INSERT INTO curriculos_selecionados (curriculo_id,visualizar_curriculo)
            VALUES ($1, $2) RETURNING *`;

        const { rows, rowCount } = await conexao.query(querySelecionarCurriculo, [Number(curriculo_id), visualizar_curriculo]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não Selecionar o Curriculo!'});
        }

        return res.status(201).json(rows[0]); 

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}
const consultarTodosCurriculoSelecionado = async (req, res) => {
        
    try {

        const existeCurriculo = `
            SELECT
                c.id, 
                c.nome,
                c.email,
                c.endereco,
                c.telefone,
                c.objetivo,
                c.formacao,
                c.experiencia,
                c.habilidades,
                c.idiomas,
                c.referencias,
                c.data AS data_cadastro,
                cs.visualizar_curriculo
            FROM 
                curriculos_selecionados cs
            JOIN 
                curriculos c ON cs.curriculo_id = c.id;

        `;

        const {rows, rowCount: curriculoEncontrado} = await conexao.query(existeCurriculo);
                

        // if(curriculoEncontrado === 0) {
        //     return res.status(404).json({ mensagem: 'Não há Curriculo selecionados!'});
        // }             

        return res.status(201).json(rows); 

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

const consultarCurriculo = async (req, res) => {

    const { usuario } = req;


    try {

        if (!usuario) {
            return res.status(401).json({ mensagem: 'Precisa Logar!' });
        }

        const dadosUsuario = `select * from curriculos where usuario_id = $1`;

        const { rows, rowCount } = await conexao.query(dadosUsuario, [usuario.id]);

        // if (rowCount === 0) {
        //     return res.status(404).json({ mensagem: 'Dados não encontrados!' });
        // }

        
        return res.status(200).json(rows);
        

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}
const consultarCurriculoTipo = async (req, res) => {

    const { usuario } = req;   
    

    try {

        if (!usuario) {
            return res.status(401).json({ mensagem: 'Precisa Logar!' });
        }

        const dadosUsuario = `select * from curriculos where usuario_id = $1`;

        const { rows, rowCount } = await conexao.query(dadosUsuario, [usuario.id]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Não há Curriculos cadastrados!' });
        }

        const tipoCurriculo = {
            medio:'medio',
            tecnico:'tecnico',
            profissional:'profissional'

        }
        

        const medio = `select * from curriculos where usuario_id = $1 and tipo = $2`;

        const { rows: tipoMedio, rowCount:dadosMedio} = await conexao.query(medio, [usuario.id, tipoCurriculo.medio]);

                             
        const tecnico = `select * from curriculos where usuario_id = $1 and tipo = $2`;

        const { rows:tipoTecnico, rowCount:dadosTecnico} = await conexao.query(tecnico, [usuario.id, tipoCurriculo.tecnico]);
                
        const profissional = `select * from curriculos where usuario_id = $1 and tipo = $2`;

        const { rows:tipoProfissional, rowCount:dadosProfissional} = await conexao.query(profissional, [usuario.id, tipoCurriculo.profissional]);
        
             


        return res.status(200).json({
            cMedio: tipoMedio[0],
            cTecnico: tipoTecnico[0],
            cProfissional: tipoProfissional[0]
        });
       

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}

const consultarCurriculoTipoParams = async (req, res) => {
   
    const tipo = req.params.tipo;    

    try {
        const { rows, rowCount } = await conexao.query(`select * from curriculos where tipo = $1`, [tipo]);

        // if (rowCount === 0) {
        //     return res.status(404).json({ mensagem: 'Não há Curriculos cadastrados!' });
        // }

           
        return res.status(200).json(rows);
       

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}
const consultarTodosCurriculosEmpresa = async (req, res) => {

    try {
        
        const dadosUsuario = `SELECT DISTINCT ON (email) *
            FROM curriculos
            ORDER BY email, nome ASC;
        `

        const { rows, rowCount } = await conexao.query(dadosUsuario);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Não há Curriculos cadastrados!' });
        }

      
        return res.status(200).json(rows);
       

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}
const consultarCurriculosVagas = async (req, res) => {

    const { usuario } = req;

    try {

        const queryCurriculosCadastrados = `SELECT 
                v.titulo,
                v.descricao,
                v.nome_empresa,
                v.setor_atuacao,
                v.localizacao,
                v.formacao,
                v.email,
                v.salario,
                v.tipo_contrato,
                v.modalidade,
                v.data,
                v.pcd,
                vc.vaga_id,
                c.tipo
                
            FROM 
                vagas_curriculos vc
            JOIN 
                curriculos c ON vc.curriculo_id = c.id
            JOIN 
                usuarios u ON c.usuario_id = u.id
            JOIN 
                vagas v ON vc.vaga_id = v.id
            JOIN 
                empresas e ON v.empresa_id = e.id
            WHERE
                u.id = $1;
        `

        const { rows, rowCount } = await conexao.query(queryCurriculosCadastrados, [usuario.id]);

        // if (rowCount === 0) {
        //     return res.status(404).json({ mensagem: 'Não há Cadastros no Momento!' });
        // }


        return res.status(200).json(rows);


    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}

const atualizarCurriculo = async (req, res) => {

    const { usuario } = req;

    const {
        nome,
        email,
        telefone,
        endereco,
        formacao,
        objetivo,
        experiencia,
        habilidades,
        idiomas,
        referencias,
        tipo,
        
    
                
    } = req.body;

    try {

        setLocale(pt);
        const schema = yup.object().shape({
            nome: yup.string().required('Nome completo é obrigatório.'),
            email: yup.string().email('Email inválido.').required('Email é obrigatório.'),
            telefone: yup.string().matches(/^\d{10,15}$/, 'Telefone deve ter só números entre 10 e 15 dígitos.'),
            endereco: yup.string().required('Logradouro é obrigatório.'),                       
            formacao: yup.string().required('Formação é obrigatório.').max(1024),
            objetivo: yup.string().required('Objetivo é obrigatório.').max(1024),
            experiencia: yup.string().required('Experiência é obrigatório.').max(1024),
            habilidades: yup.string().required('Habilidade é obrigatório.').max(1024),
            idiomas: yup.string().required('Idioma é obrigatório.').max(255),
            referencias: yup.string().required('Referência é obrigatório.').max(255),
            tipo: yup.string().oneOf(['medio', 'tecnico', 'profissional'], 'Tipo de Curriculo deve ser selecionado!'),
            

        });

        await schema.validate(req.body);

        const curriculoTipo = tipo;
        
        const queryAtualizarUsuario = `UPDATE curriculos SET
                        nome = $1, 
                        email = $2,
                        telefone = $3, 
                        endereco = $4, 
                        objetivo = $5, 
                        formacao = $6, 
                        experiencia = $7, 
                        habilidades = $8,
                        idiomas = $9,
                        referencias = $10                                        
                        WHERE usuario_id = $11 and tipo = $12
                        `;

        const { rows, rowCount } = await conexao.query(queryAtualizarUsuario, [
            nome,
            email,
            telefone,
            endereco,
            objetivo,
            formacao,
            experiencia,
            habilidades,
            idiomas,
            referencias,
            usuario.id,
            curriculoTipo
            
        ]);

                       

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível criar o curriculo.' });
        }

        
        return res.status(201).json({mensagem: 'Atualizaçãso realizada com Sucesso!'}); 

    } catch (error) {
        console.error('Erro ao cadastrar curriculo:', error); 
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

const atualizarCurriculoSelecionado = async (req, res) => {

    const {
        visualizar_curriculo
                
    } = req.body;

    const idCurriculo = Number(req.params.id);

    try {

        setLocale(pt);
        const schema = yup.object().shape({
            visualizar_curriculo: yup.bool().required('Favor informar valor True ou False!')
        });

        await schema.validate(req.body);

        const {rowCount: existeCurriculo} = await conexao.query('select * from curriculos_selecionados where curriculo_id = $1', [idCurriculo]);

        if(existeCurriculo === 0) {
            return res.status(404).json({ mensagem: 'Curriculo Não Encontrado!'});
        }
        
        const queryCurriculoSelecionado = `UPDATE curriculos_selecionados SET visualizar_curriculo = $1 WHERE curriculo_id = $2 `;

        const { rowCount } = await conexao.query(queryCurriculoSelecionado, [visualizar_curriculo, idCurriculo]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível atualizar o curriculo!'});
        }

        
        return res.status(201).json({}); 

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

const excluirCurriculo = async (req, res) => {
    
    const idUsuario = Number(req.params.id);

    const tipoCurriculo = req.params.tipo;

    if(isNaN(idUsuario)) {
        return res.status(401).json({mensagem: 'Deve ser digitado um número de Id válido!'});
    }   
    
    try {
        const existeCurriculoUsuario = `select * from curriculos where usuario_id = $1`;
    
        const {rowCount} = await conexao.query(existeCurriculoUsuario, [idUsuario]);
    
        if(rowCount === 0) {
            return res.status(401).json({mensagem: 'Não existe Curriculo para esse Usuário!'});
        }

        const existeCurriculo = `select * from curriculos where usuario_id = $1 and tipo = $2`;

        const {rowCount:curriculoEncontrado} = await conexao.query(existeCurriculo, [idUsuario, tipoCurriculo]);
        
        if(curriculoEncontrado === 0) {
            return res.status(401).json({mensagem: 'Não há curriculo cadastrado para esse tipo informado!'});
        }

        const deletar = `delete from curriculos where usuario_id = $1 and tipo = $2`;

        const {rowCount: resultadoDeletar} = await conexao.query(deletar, [idUsuario, tipoCurriculo]);

        if(resultadoDeletar === 0) {
            return res.status(401).json({mensagem: 'Não foi possível deletar o Curriculo!'});
        }

        return res.status(201).json({mensagem: 'Excluído com Sucesso!'});

    } catch (error) {
        return res.status(500).json({mensagem: `${error.message}`});
    }

}



module.exports = {
    cadastrarCurriculo,
    cadastrarCurriculoSelecionado,
    consultarCurriculo,
    consultarTodosCurriculoSelecionado,
    atualizarCurriculo,
    atualizarCurriculoSelecionado,
    consultarCurriculoTipo,
    consultarCurriculoTipoParams,
    consultarCurriculosVagas,
    consultarTodosCurriculosEmpresa,
    excluirCurriculo
}