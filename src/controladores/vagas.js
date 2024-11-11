const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const yup = require('yup');
const { setLocale } = require('yup')
const { pt } = require('yup-locales');
const transport = require('../bancoDeDados/nodemailer');

function gerarMensagens(candidatos) {
    let html = ''
    return candidatos.map(candidato => {
        const { email, nome, titulo, nome_empresa, email_empresa } = candidato;
        html = `
        <p>Prezada(o) <strong>${nome}</strong>,</p> 
        <p>Agradecemos sinceramente por seu interesse na vaga de <strong>${titulo}</strong> e pelo tempo e esforço dedicados durante o processo seletivo.</p> 
        <p>Após uma análise cuidadosa de todos os candidatos, decidimos seguir com um perfil que melhor se alinha com as necessidades específicas da posição no momento. Gostaríamos, no entanto, de ressaltar que a sua experiência e habilidades foram altamente valorizadas por nossa equipe, e reconhecemos o seu potencial.</p> 
        <p>Estamos sempre atentos a novos talentos, e você está convidado(a) a se candidatar a outras oportunidades que surgirem conosco no futuro. Também incentivamos que continue sua trajetória com a mesma dedicação, pois temos certeza de que seu talento e comprometimento abrirão excelentes portas!</p>
        <p>Desejamos muito sucesso na sua carreira e estamos à disposição para qualquer necessidade.</p> 
        <p>Atenciosamente,<br> 
        <strong>${nome_empresa}</strong><br> 
        ${email_empresa}<br></p>
      `;

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
                subject: "Processo Seletivo encerrado!",
                text: "Congrats for sending test email with Mailtrap!",
                html: html,
                category: "Integration Test",
                sandbox: true
            })
            .then(console.log, console.error);
    });
}
// function gerarEmails(dados) {
//     return dados.map(dado => {
//         const { email } = dado;
//         return { email };
//     });
// }

const cadastrarVagas = async (req, res) => {

    const {
        titulo,
        descricao,
        habilidades,
        formacao,
        localizacao,
        modalidade,
        salario,
        nome_empresa,
        setor_atuacao,
        email,
        cargo,
        tipo_contrato,
        horario,
        pcd,
        empresa_id
    } = req.body;

    try {

        setLocale(pt);
        const schema = yup.object().shape({
            titulo: yup.string().required('O título da vaga é obrigatório.'),
            descricao: yup.string().required('A descrição da vaga é obrigatório.'),
            habilidades: yup.string().required('Habilidade é obrigatório.').max(1024),
            formacao: yup.string().required('Formação é obrigatório.').max(1024),
            localizacao: yup.string().required('Localização é obrigatório'),
            modalidade: yup.string().oneOf(['presencial', 'remoto', 'hibrido'], 'Modalidade de Vaga deve ser selecionado!'),
            salario: yup.string(),
            nome_empresa: yup.string().required('Nome da empresa é obrigatório.'),
            setor_atuacao: yup.string().required('Setor é obrigatório.'),
            email: yup.string().email().required('Email é obrigatório.'),
            cargo: yup.string().required('Área de atuação é obrigatório.'),
            tipo_contrato: yup.string().oneOf(['clt', 'pj', 'estagio', 'temporario'], 'Tipo de contrato deve ser selecionado!'),
            horario: yup.string().required('O horário é obrigatório.'),
            pcd: yup.bool().required('Informe se a Vaga é Pcd ou Não!')
        });

        await schema.validate(req.body);


        const queryCriarVaga = `INSERT INTO VAGAS (
            titulo,
            descricao,
            habilidades,
            formacao,
            localizacao,
            modalidade,
            salario,
            nome_empresa,
            setor_atuacao,
            email,
            cargo,
            tipo_contrato,
            horario,
            pcd,
            empresa_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *`;

        const { rows, rowCount } = await conexao.query(queryCriarVaga, [
            titulo,
            descricao,
            habilidades,
            formacao,
            localizacao,
            modalidade,
            salario,
            nome_empresa,
            setor_atuacao,
            email,
            cargo,
            tipo_contrato,
            horario,
            pcd,
            empresa_id
        ]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível criar a vaga.' });
        }

        return res.status(201).json(rows[0]);

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

const cadastrarVagasCurriculos = async (req, res) => {

    const {
        vaga_id,
        curriculo_id
    } = req.body;

    try {

        const queryExisteCadastrado = `SELECT * FROM VAGAS_CURRICULOS WHERE VAGA_ID = $1 AND CURRICULO_ID = $2`;

        const { rowCount: existeCadastrado } = await conexao.query(queryExisteCadastrado, [vaga_id, curriculo_id]);

        if (existeCadastrado > 0) {
            return res.status(400).json({ mensagem: 'Esse Curriculo já foi Cadastrado para essa Vaga!' });
        }


        const query = `INSERT INTO VAGAS_CURRICULOS(vaga_id, curriculo_id) VALUES ($1, $2)`;

        const { rowCount } = await conexao.query(query, [vaga_id, curriculo_id]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não se Cadastrar a Vaga!' });
        }

        return res.status(201).json();

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

const consultarVagas = async (req, res) => {

    const { empresa } = req;

    try {

        if (!empresa) {
            return res.status(401).json({ mensagem: 'Precisa Logar!' });
        }

        const dadosUsuario = `select * from vagas where empresa_id = $1`;

        const { rows, rowCount } = await conexao.query(dadosUsuario, [empresa.id]);

        // if (rowCount === 0) {
        //     return res.status(404).json({ mensagem: 'Não há vagas cadastradas!' });
        // }


        return res.status(200).json(rows);


    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}

const consultarVagaId = async (req, res) => {

    const { empresa } = req;

    const idVaga = Number(req.params.id);


    try {

        if (!empresa) {
            return res.status(401).json({ mensagem: 'Precisa Logar!' });
        }

        const dadosUsuario = `select * from vagas where id = $1 and empresa_id = $2`;

        const { rows, rowCount } = await conexao.query(dadosUsuario, [idVaga, empresa.id]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Não há vagas cadastradas!' });
        }


        return res.status(200).json(rows);



    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}
const consultarTodasVagas = async (req, res) => {

    try {

        const { rows, rowCount } = await conexao.query(`select * from vagas`);

        
        return res.status(200).json(rows);


    } catch (error) {
        return res.status(500).json({ erro: `${error.message}` });
    }

}
const consultarTodasVagasLogado = async (req, res) => {

    try {

        const { rows, rowCount } = await conexao.query(`select * from vagas`);

        // if (rowCount === 0) {
        //     return res.status(404).json({ mensagem: 'Dados não encontrados!' });
        // }


        return res.status(200).json(rows);


    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}

const consultarUsuariosCurriculos = async (req, res) => {

    const { empresa } = req;

    try {

        const queryCurriculosCadastrados = `SELECT
    u.nome AS nome_usuario,
    u.cpf AS cpf_usuario,
    c.id AS curriculo_id,
    c.email AS email_cadastrado,
    c.data AS data_cadastro,
    c.telefone AS telefone_cadastrado,
    c.endereco AS endereco_cadastrado,
    c.objetivo AS objetivo,
    c.formacao AS formacao,
    c.experiencia AS experiencia,
    c.habilidades AS habilidades,
    c.idiomas AS idiomas,
    c.referencias AS referencias,
    v.titulo AS titulo_vaga
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
        e.id = $1
    ORDER BY 
        u.nome ASC;
        `

        const { rows, rowCount } = await conexao.query(queryCurriculosCadastrados, [empresa.id]);

        // if (rowCount === 0) {
        //     return res.status(404).json({ mensagem: 'Não há Cadastros no Momento!' });
        // }


        return res.status(200).json(rows);


    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}

const atualizarVagas = async (req, res) => {

    const { empresa } = req;

    const idVaga = Number(req.params.id);

    const {
        titulo,
        descricao,
        habilidades,
        formacao,
        localizacao,
        modalidade,
        salario,
        nome_empresa,
        setor_atuacao,
        email,
        cargo,
        tipo_contrato,
        horario,
        pcd

    } = req.body;

    if (isNaN(idVaga)) {
        return res.status(401).json({ mensagem: 'Deve ser digitado um número de Id válido!' });
    }

    try {

        setLocale(pt);
        const schema = yup.object().shape({
            titulo: yup.string().required('O título da vaga é obrigatório.'),
            descricao: yup.string().required('A descrição da vaga é obrigatório.'),
            habilidades: yup.string().required('Habilidade é obrigatório.').max(1024),
            formacao: yup.string().required('Formação é obrigatório.').max(1024),
            localizacao: yup.string().required('Localização é obrigatório'),
            modalidade: yup.string().oneOf(['presencial', 'remoto', 'hibrido'], 'Modalidade de Vaga deve ser selecionado!'),
            salario: yup.string(),
            nome_empresa: yup.string().required('Nome da empresa é obrigatório.'),
            setor_atuacao: yup.string().required('Área de atuação é obrigatório.'),
            email: yup.string().email().required('Email é obrigatório.'),
            cargo: yup.string().required('Descrição da empresa é obrigatório.'),
            tipo_contrato: yup.string().oneOf(['clt', 'pj', 'estagio', 'temporario'], 'Tipo de contrato deve ser selecionado!'),
            horario: yup.string().required('O horário é obrigatório.'),
            pcd: yup.bool().required('Pcd é obrigatório.')


        });

        await schema.validate(req.body);


        const queryAtualizarVaga = `UPDATE vagas SET
            titulo = $1,
            descricao = $2,
            habilidades = $3,
            formacao = $4,
            localizacao = $5,
            modalidade = $6,
            salario = $7,
            nome_empresa = $8,
            setor_atuacao = $9,
            email = $10,
            cargo = $11,
            tipo_contrato = $12,
            horario = $13,
            pcd = $14
            WHERE empresa_id = $15 and id = $16
            `;


        const { rowCount } = await conexao.query(queryAtualizarVaga, [
            titulo,
            descricao,
            habilidades,
            formacao,
            localizacao,
            modalidade,
            salario,
            nome_empresa,
            setor_atuacao,
            email,
            cargo,
            tipo_contrato,
            horario,
            pcd,
            empresa.id,
            idVaga

        ]);



        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível criar a vaga.' });
        }


        return res.status(201).json();

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }
}

const excluirVagas = async (req, res) => {

    const { empresa } = req;

    const idVaga = Number(req.params.id);

    if (isNaN(idVaga)) {
        return res.status(401).json({ mensagem: 'Deve ser digitado um número de Id válido!' });
    }

    try {
        const exitemVagas = `select * from vagas where empresa_id = $1 and id = $2`;

        const { rowCount } = await conexao.query(exitemVagas, [empresa.id, idVaga]);

        if (rowCount === 0) {
            return res.status(401).json({ mensagem: 'Não existe Vagas para essa Empresa!' });
        }

        const queryBuscarDadosusuario = `
           SELECT 
            c.nome,
            c.email,
            v.titulo,
            v.cargo,
            e.nome AS nome_empresa,
            e.email AS email_empresa
            FROM 
                vagas_curriculos vc
            JOIN 
                curriculos c ON vc.curriculo_id = c.id
            JOIN 
                vagas v ON vc.vaga_id = v.id
            JOIN
                empresas e ON v.empresa_id = e.id
            WHERE 
                vc.vaga_id = $1
                AND v.empresa_id = $2;

    `

        const { rows: dadosUsuario, rowCount: dadosUsuarioEncontrado } = await conexao.query(queryBuscarDadosusuario, [idVaga, empresa.id]);


        const data = dadosUsuario;


        const deletarVaga = `delete from vagas where empresa_id = $1 and id = $2`;

        const { rowCount: vagaDeletada } = await conexao.query(deletarVaga, [empresa.id, idVaga]);

        if (vagaDeletada === 0) {
            return res.status(401).json({ mensagem: 'Não foi possível deletar a Vaga!' });
        }


        gerarMensagens(data);
        
        
        return res.status(201).json({});

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}



module.exports = {
    cadastrarVagas,
    cadastrarVagasCurriculos,
    consultarVagas,
    consultarVagaId,
    consultarTodasVagas,
    consultarTodasVagasLogado,
    consultarUsuariosCurriculos,
    atualizarVagas,
    excluirVagas
}