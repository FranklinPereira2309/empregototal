const express = require('express');
const usuarios = require('./controladores/usuarios');
const empresa = require('./controladores/empresas');
const loginUsuario = require('./controladores/login_usuario');
const loginEmpresa = require('./controladores/login_empresa');
const { verificarLogin, verificarLoginEmpresa } = require('./intermediarios/verificarLogin');
const usuarios_completo = require('./controladores/usuarios_completo');
const curriculo = require('./controladores/curriculo');
const vagas = require('./controladores/vagas');
const viaCepApi = require('./controladores/apiViaCep');



const rotas = express();

rotas.post('/usuario', usuarios.cadastrarLogin); // Cadastrar Usuario
rotas.post('/empresa', empresa.cadastrarLoginEmpresa); //Cadastrar Empresa
rotas.post('/login', loginUsuario.loginUsuario); //Logar com o Usuários
rotas.post('/loginEmpresa', loginEmpresa.loginEmpresa); //Logar com a Empresa



rotas.get('/usuario', verificarLogin, usuarios.consultarLogin);
// rotas.put('/usuario', usuarios.atualizarUsuario);
rotas.put('/usuario_alterar_senha', verificarLogin, usuarios.alterarSenhaUsuario);
rotas.post('/usuarios_completos', verificarLogin, usuarios_completo.cadastrarUsuario);
rotas.get('/usuarios_completos', verificarLogin, usuarios_completo.consultarUsuario);
rotas.get('/todos_usuarios_completos', verificarLogin, usuarios_completo.consultarTodosUsuario);
rotas.put('/usuarios_completos', verificarLogin, usuarios_completo.atualizarUsuario);
rotas.delete('/usuarios_completos/:id', verificarLogin, usuarios_completo.deletarUsuario);

rotas.post('/curriculo', verificarLogin, curriculo.cadastrarCurriculo);
rotas.post('/curriculo_selecionado', verificarLoginEmpresa, curriculo.cadastrarCurriculoSelecionado);
rotas.get('/curriculosgeral', verificarLogin, curriculo.consultarCurriculo);
rotas.get('/curriculos_geral_selecionados', verificarLoginEmpresa, curriculo.consultarTodosCurriculoSelecionado);
rotas.get('/curriculos', verificarLogin, curriculo.consultarCurriculoTipo);
rotas.get('/curriculos_tipo_params/:tipo', curriculo.consultarCurriculoTipoParams);
rotas.get('/curriculos_vagas', verificarLogin, curriculo.consultarCurriculosVagas);

rotas.get('/curriculos_empresa', curriculo.consultarTodosCurriculosEmpresa);
rotas.put('/curriculo', verificarLogin, curriculo.atualizarCurriculo);
rotas.patch('/curriculo/:id', curriculo.atualizarCurriculoSelecionado);
rotas.delete('/curriculo/:id/:tipo', verificarLogin, curriculo.excluirCurriculo);
rotas.delete('/curriculo_selecionado/:id', verificarLoginEmpresa, curriculo.excluirCurriculoSelecionado);

rotas.get('/empresa', verificarLoginEmpresa, empresa.consultarLoginEmpresa);
rotas.post('/vagas', verificarLoginEmpresa, vagas.cadastrarVagas);
rotas.get('/vaga/:id', verificarLoginEmpresa, vagas.consultarVagaId);
rotas.post('/vagas_curriculos', vagas.cadastrarVagasCurriculos);  
rotas.get('/vagas', verificarLoginEmpresa, vagas.consultarVagas); 
rotas.get('/todas_as_vagas', vagas.consultarTodasVagas);
rotas.get('/todas_as_vagas_logado', verificarLogin, vagas.consultarTodasVagasLogado);
rotas.get('/vagas_usuarios_curriculos', verificarLoginEmpresa, vagas.consultarUsuariosCurriculos);
rotas.put('/vagas/:id', verificarLoginEmpresa, vagas.atualizarVagas);
rotas.delete('/vagas/:id', verificarLoginEmpresa, vagas.excluirVagas);

rotas.get('/via_cep_api/:cep', viaCepApi);




module.exports = rotas

