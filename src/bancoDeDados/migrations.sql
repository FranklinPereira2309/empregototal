DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS empresas;
DROP TABLE IF EXISTS vagas_usuarios_curriculos;
DROP TABLE IF EXISTS vagas;
DROP TABLE IF EXISTS curriculos;
DROP TABLE IF EXISTS usuarios_completo;
DROP TABLE IF EXISTS curriculos_selecionados;


CREATE TABLE usuarios(
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email  TEXT NOT NULL UNIQUE,
    cpf TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL 
);


CREATE TABLE empresas(
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email  TEXT NOT NULL UNIQUE,
    cnpj TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL 
);

CREATE TABLE usuarios_completos (
    id SERIAL PRIMARY KEY, 
    nome_completo VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(15) NOT NULL, 
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero INT NOT NULL, 
    bairro VARCHAR(255) NOT NULL, 
    complemento VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL, 
    estado VARCHAR(2) NOT NULL,
    data_nascimento DATE NOT NULL, 
    genero VARCHAR(15) NOT NULL CHECK (genero IN ('masculino', 'feminino')), 
    usuario_id INT NOT NULL, 
    CONSTRAINT fk_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE curriculos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    data TIMESTAMP DEFAULT NOW(),
    telefone VARCHAR(15) NOT NULL,
    endereco TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    formacao TEXT NOT NULL,
    experiencia TEXT NOT NULL,
    habilidades TEXT NOT NULL,
    idiomas VARCHAR(255) NOT NULL,
    referencias TEXT NOT NULL,
    apelido TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('médio', 'técnico', 'profissional')),
    usuario_id INT NOT NULL, 
    CONSTRAINT fk_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE vagas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    data TIMESTAMP DEFAULT NOW(),
    habilidades TEXT NOT NULL,
    formacao TEXT NOT NULL,
    localizacao VARCHAR(50) NOT NULL,
    modalidade VARCHAR(15) NOT NULL CHECK (modalidade IN ('presencial', 'remoto', 'hibrido')),
    salario NUMERIC(15,2),    
    nome_empresa VARCHAR(100) NOT NULL,
    setor_atuacao VARCHAR(50) NOT NULL, 
    email VARCHAR(50) NOT NULL,
    cargo TEXT NOT NULL,
    tipo_contrato VARCHAR(15) NOT NULL CHECK (tipo_contrato IN ('clt', 'pj', 'estagio', 'temporario')),
    horario VARCHAR(50) NOT NULL,
    pcd BOOLEAN NOT NULL,
    empresa_id INT NOT NULL, 
    CONSTRAINT fk_empresas FOREIGN KEY (empresa_id) REFERENCES empresas(id) 
);


CREATE TABLE vagas_curriculos (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP DEFAULT NOW(),
    vaga_id INT NOT NULL, 
    CONSTRAINT fk_vagas FOREIGN KEY (vaga_id) REFERENCES vagas(id) ON DELETE CASCADE,
    curriculo_id INT NOT NULL, 
    CONSTRAINT fk_curriculos FOREIGN KEY (curriculo_id) REFERENCES curriculos(id) ON DELETE CASCADE
    
);
CREATE TABLE curriculos_selecionados (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP DEFAULT NOW(),
    visualizar_curriculo BOOLEAN NOT NULL,
    empresa_id INT NOT NULL,
    CONSTRAINT fk_empresas FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    curriculo_id INT NOT NULL,
    CONSTRAINT fk_curriculos FOREIGN KEY (curriculo_id) REFERENCES curriculos(id)
);




INSERT INTO vagas (titulo, descricao, habilidades, formacao, localizacao, modalidade, salario, nome_empresa, setor_atuacao, email, cargo, tipo_contrato, horario, pcd, empresa_id)
VALUES
('Gerente de Projetos', 'Responsável por liderar e coordenar projetos de tecnologia da informação, garantindo prazos e qualidade.', 'Experiência em gestão de projetos e metodologias ágeis', 'Superior Completo em Gestão de Projetos ou áreas correlatas', 'Vitória da Conquista, BA', 'presencial', 8000, 'InovaTech', 'tecnologia', 'rh@inovatech.com', 'Gerente', 'pj', 'De segunda à sexta, 09:00 às 16:00', true, 1),
('Designer Gráfico', 'Desenvolvimento de materiais gráficos criativos para campanhas publicitárias e branding.', 'Domínio de Photoshop e Illustrator, criatividade e atenção aos detalhes', 'Superior Completo ou Técnico em Design Gráfico', 'Itabuna, BA', 'remoto', 3500, 'Creative Agency', 'tecnologia', 'talentos@creativeagency.com', 'Design', 'clt', 'De segunda à sexta, 09:00 às 16:00', false, 1),
('Desenvolvedor Back-End', 'Participação no desenvolvimento de sistemas robustos e APIs escaláveis.', 'Experiência com Node.js ou Django, compreensão de bancos de dados', 'Superior Completo em Ciência da Computação ou área afim', 'Jequié, BA', 'remoto', 7000, 'Web Solutions', 'tecnologia', 'jobs@websolutions.com', 'Desenvolvedor Back', 'clt', 'De segunda à sexta, 09:00 às 16:00', true, 1),
('Consultor de Vendas', 'Atuação em vendas consultivas.', 'Conhecimento em técnicas de negociação e comunicação eficaz', 'Ensino Médio Completo, desejável formação em Administração', 'Ilhéus, BA', 'remoto', 2500, 'Comercial Bahia', 'comercio', 'consultoria@comercialbahia.com', 'Consultor', 'clt', 'De segunda à sexta, 09:00 às 16:00', false, 2),
('Analista de Suporte Técnico', 'Atendimento técnico especializado', 'Conhecimento em redes, sistemas operacionais e certificação ITIL como diferencial', 'Superior em Tecnologia da Informação ou curso técnico relacionado', 'Camaçari, BA', 'hibrido', 3200, 'Tech Support', 'tecnologia', 'vagas@techsupport.com', 'Analista de Suporte', 'estagio', 'De segunda à sexta, 09:00 às 16:00', true, 2),
('Desenvolvedor Front-End', 'Desenvolvimento de interfaces web responsivas.', 'Experiência com HTML, CSS, JavaScript', 'Superior Completo', 'Salvador, BA', 'presencial', 6000, 'Tech Solutions', 'tecnologia', 'recrutamento@techsolutions.com', 'Desenvolvedor Front', 'pj', 'De segunda à sexta, 09:00 às 16:00', false, 2),
('Assistente Administrativo', 'Suporte administrativo e organização de documentos.', 'Conhecimento em pacote Office, Boa comunicação e organização, Experiência na área administrativa', 'Ensino Médio ou Técnico em Administração', 'Barreiras, BA', 'remoto', 2000, 'Empresa XYZ', 'comercio', 'rh@empresaxyz.com', 'Assistente Adm', 'estagio', 'De segunda à sexta, 09:00 às 16:00', false, 3),
('Analista de Recursos Humanos', 'Gestão de processos de recrutamento e seleção.', 'Experiência em RH, Conhecimento em legislação trabalhista, Habilidade em entrevistas e seleção de pessoal', 'Superior em Recursos Humanos ou áreas correlatas', 'Alagoinhas, BA', 'remoto', 4000, 'RH Solutions', 'industria', 'recrutamento@rhsolutions.com', 'Analista de RH', 'estagio', 'De segunda à sexta, 09:00 às 16:00', false, 3),
('Desenvolvedor Mobile', 'Desenvolvimento de aplicativos móveis para Android e iOS.', 'Experiência com desenvolvimento mobile, Conhecimento em Flutter ou React Native, Experiência com publicação de apps nas lojas', 'Superior em Ciências da Computação ou áreas afins', 'Lauro de Freitas, BA', 'presencial', 7500, 'App Innovators', 'tecnologia', 'jobs@appinnovators.com', 'Desenvolvedor Mobile', 'clt', 'De segunda à sexta, 09:00 às 16:00', false, 3),
('Enfermeiro', 'Atendimento e cuidado de pacientes em hospital.', 'Graduação em Enfermagem, Registro no COREN, Experiência em hospitais', 'Superior em Enfermagem com registro no COREN', 'Itapetinga, BA', 'hibrido', 5000, 'Hospital Vida', 'saude', 'rh@hospitalvida.com', 'Enfermeiro Chefe', 'pj', 'De segunda à sexta, 09:00 às 16:00', false, 4),
('Professor de Inglês', 'Ensino de inglês para diferentes faixas etárias.', 'Fluência em inglês, Experiência em ensino, Certificação TEFL ou similar é um diferencial', 'Licenciatura em Letras ou Certificação em Ensino de Inglês', 'Paulo Afonso, BA', 'presencial', 3000, 'Escola de Idiomas ABC', 'educacao', 'contato@escoladeidiomasabc.com', 'Professor', 'clt', 'De segunda à sexta, 09:00 às 16:00', false, 4),
('Técnico em Informática', 'Manutenção de computadores e suporte a usuários.', 'Curso técnico em Informática, Experiência em manutenção de hardware, Conhecimento em sistemas operacionais', 'Curso Técnico em Informática', 'Simões Filho, BA', 'remoto', 2800, 'InfoTech', 'tecnologia', 'vagas@infotech.com', 'Técnico em TI', 'pj', 'De segunda à sexta, 09:00 às 16:00', false, 4),
('Engenheiro Civil', 'Planejamento e execução de obras civis.', 'Experiência em obras de grande porte, Registro no CREA, Conhecimento em AutoCAD e MS Project', 'Engenharia Civil com registro no CREA', 'Juazeiro, BA', 'hibrido', 9000, 'Construtora Bahia', 'industria', 'engenharia@construtorabahia.com', 'Engenheiro JR', 'estagio', 'De segunda à sexta, 09:00 às 16:00', false, 5),
('Gerente de Loja', 'Gestão de equipe e operação de loja.', 'Experiência em gestão de equipes, Conhecimento em técnicas de vendas, Habilidade em negociação', 'Nível Superior', 'Teixeira de Freitas, BA', 'presencial', 4500, 'Comercial XYZ', 'tecnologia', 'rh@comercialxyz.com', 'Gerente Jr', 'estagio', 'De segunda à sexta, 09:00 às 16:00', false, 5),
('Analista Financeiro', 'Análise financeira e elaboração de relatórios.', 'Experiência na área financeira, Conhecimento em Excel avançado, Formação em Administração, Economia ou áreas afins', 'Nível Médio', 'Santo Antônio de Jesus, BA', 'hibrido', 5500.00, 'Financeira ABC', 'tecnologia', 'financas@financeiraabc.com', 'Analista Financeiro Sênior', 'pj', 'De segunda à sexta, 09:00 às 16:00', false, 6),
('Fisioterapeuta', 'Atendimento e reabilitação de pacientes.', 'Graduação em Fisioterapia, Registro no CREFITO, Experiência em clínicas de reabilitação', 'Nível Superior', 'Valença, BA', 'hibrido', 4000, 'Clínica Reabilitar', 'saude', 'vagas@clinicreabilitar.com', 'Fisioterapeuta Chefe', 'pj', 'De segunda à sexta, 09:00 às 16:00', false, 6),
('Arquiteto', 'Desenvolvimento de projetos arquitetônicos e acompanhamento de obras.', 'Formação em Arquitetura e Urbanismo, Registro no CAU, Conhecimento em AutoCAD e Revit', 'Nível Médio', 'Salvador, BA', 'presencial', 8500, 'Construtora Moderna', 'tecnologia', 'vagas@construtoramoderna.com', 'Arquiteto Jr', 'estagio', 'De segunda à sexta, 09:00 às 16:00', false, 6),
('Analista de Dados', 'Análise de dados e geração de insights estratégicos.', 'Experiência com SQL e Python, Conhecimento em ferramentas de BI, Habilidade em análise estatística', 'Nível Superior', 'Feira de Santana, BA', 'presencial', 6500, 'Data Insights', 'tecnologia', 'rh@datainsights.com', 'Analista Jr de Dados', 'estagio', 'De segunda à sexta, 09:00 às 16:00', false, 7),
('Coordenador de Logística', 'Coordenação de operações logísticas e distribuição.', 'Experiência em logística, Conhecimento em ERP, Habilidade em gestão de equipes', 'Nível Médio', 'Camaçari, BA', 'remoto', 1000, 'Transporte Fácil', 'tecnologia', 'vagas@transportefacil.com', 'Coordenador Jr Logística', 'estagio', 'De segunda à sexta, 09:00 às 16:00', false, 7);