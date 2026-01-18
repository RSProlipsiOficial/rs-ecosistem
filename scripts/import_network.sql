-- Import Consultant Network
-- Generated automatically from Excel

BEGIN;

-- Ensure consultants table exists (basic definition if needed in dev)
-- assuming it exists.


INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7838667, 
    'RS Prólipsi', 
    'rsprolipsioficial@gmail.com', 
    'RS Prólipsi Empresa', 
    '123', 
    '(41) 99286-3922', 
    '23430313000185', 
    'admin', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9772169, 
    'Emanuel Mendes Claro', 
    'emclaro@hotmail.com', 
    'emclaro', 
    '123', 
    '(41) 99994-3102', 
    '023.350.629-21', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5519519, 
    'maxwel santos', 
    'sefanpitaquara@gmail.com', 
    'maxwel', 
    '123', 
    '(41) 98507-3884', 
    '146.571.157-07', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5485192, 
    'Joana Alcina Rodrigues Castro Mendes Claro', 
    'maeediully@gmail.com', 
    'joanamendes', 
    '123', 
    '(41) 99829-1183', 
    '142.302.848-10', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4328739, 
    'joão josé oliveira miranda', 
    'joaomiranda2011@live.com', 
    'miranda', 
    '123', 
    '(41) 9856-6391', 
    '320.942.649-04', 
    'maxwel santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    193789, 
    'Michael De Araújo Medeiros', 
    'michaelaraujo979980@gmail.com', 
    'michael', 
    '123', 
    '(22) 99799-6280', 
    '126.503.987-95', 
    'maxwel santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4656279, 
    'José Luiz de Souza', 
    'joseluiz262@gmail.com', 
    'jose', 
    '123', 
    '(41) 98493-8186', 
    '503.563.139-72', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6819895, 
    'celso lopes da rosa', 
    'celsolopes02622@gmail.com', 
    'celso', 
    '123', 
    '(41) 99524-4731', 
    '425.109.889-72', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1889291, 
    'Alaor Garcia da Silva', 
    'alaorgarcia68@gmail.com', 
    'alaor', 
    '123', 
    '(41) 9205-3094', 
    '678.730.659-87', 
    'celso lopes da rosa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9281850, 
    'fabíola francisco luiz', 
    'fabiolaoliveira007@gmail.com', 
    'fabiola', 
    '123', 
    '(41) 99776-6476', 
    '836.889.519-72', 
    'José Luiz de Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8277490, 
    'laudenice da silva', 
    'silvalaudenice5@gmail.com', 
    'nice', 
    '123', 
    '(41) 99576-3385', 
    '928.027.109-15', 
    'fabíola francisco luiz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6264927, 
    'mauricio pereira de carvalho', 
    'mauriciopinturas51@gmail.com', 
    'mauricio', 
    '123', 
    '(69) 9989-9053', 
    '650.231.299-34', 
    'celso lopes da rosa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6269938, 
    'Fabiano Moreira', 
    'binhofm.moreira@gmail.com', 
    'fabianomoreira', 
    '123', 
    '(19) 99330-7333', 
    '309.687.408-55', 
    'Alaor Garcia da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4812810, 
    'Oseias Silva', 
    'montagensdemoveis2022@gmail.com', 
    'oseiasrs', 
    '123', 
    '(41) 99752-2517', 
    '066.846.229-93', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1194111, 
    'jose costa dos santos', 
    'josebovespa@gmail.com', 
    'zequinha', 
    '123', 
    '(41) 99811-0744', 
    '568.309.209-49', 
    'José Luiz de Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1319340, 
    'zilda pereia dos santos', 
    'zildapdoss@gmail.com', 
    'zilda', 
    '123', 
    '(41) 99880-1807', 
    '838.234.689-87', 
    'jose costa dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4027616, 
    'leonina silva dias', 
    'silvadiasleonina@gmail.com', 
    'leonina', 
    '123', 
    '(41) 99942-0818', 
    '048.845.649-52', 
    'zilda pereia dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1925021, 
    'joziana pereira dos santos', 
    'jozi.santos229@gmail.com', 
    'jozi', 
    '123', 
    '(41) 99534-1118', 
    '089.020.029-77', 
    'zilda pereia dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2259260, 
    'silso pereira da silva', 
    'silso.pereira694@gmail.com', 
    'silso', 
    '123', 
    '(41) 99814-8697', 
    '401.880.279-04', 
    'jose costa dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7706031, 
    'cleuci costa  do  santos', 
    'cleuccisantos@gmail.com', 
    'cleuci', 
    '123', 
    '(41) 98510-2148', 
    '705.727.399-15', 
    'joziana pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    853700, 
    'joci costa dos santos', 
    'santosjocicosta@gmail.com', 
    'joci', 
    '123', 
    '(41) 98424-6076', 
    '541.071.809-72', 
    'cleuci costa  do  santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1812304, 
    'davi gomes', 
    'davigomessalao@gmail.com', 
    'davi', 
    '123', 
    '(41) 9674-5867', 
    '580.710.679-20', 
    'silso pereira da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    336450, 
    'ilson daniel de oliveira', 
    'danieloliveira15@gmail.com', 
    'ilson', 
    '123', 
    '(41) 99811-0744', 
    '019.797.439-24', 
    'cleuci costa  do  santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7886870, 
    'pedro lourival pires de oliveira', 
    'pedropingo@gmail.com', 
    'pedro', 
    '123', 
    '(41) 99811-0744', 
    '510.608.419-91', 
    'davi gomes', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6419540, 
    'paulo de quadros', 
    'paulodequadros594@gmail.com', 
    'paulo', 
    '123', 
    '(41) 99811-0744', 
    '070.985.049-20', 
    'ilson daniel de oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1928261, 
    'Olinda pereira dos santos', 
    'olindapereiradosssantos@gmail.com', 
    'olinda', 
    '123', 
    '(41) 99872-8895', 
    '940.241.209-30', 
    'zilda pereia dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6873657, 
    'jhonny vasconcelos', 
    'jhonnyvasconcelos1005@gmail.com', 
    'jhonny', 
    '123', 
    '(41) 9971-2028', 
    '047.208.419-45', 
    'maxwel santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9346820, 
    'Matheus dorneles medeiros', 
    'matheusdorneles2804@gmail.com', 
    'matheus', 
    '123', 
    '(41) 98719-6017', 
    '146.252.789-29', 
    'Oseias Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7720293, 
    'Thais Alencar Moreira Medeiros', 
    'thaismoreiraalencar@gmail.com', 
    'thais', 
    '123', 
    '(22) 99602-3201', 
    '169.617.427-93', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6684648, 
    'Laiany Manuela Oliveira de Siqueira', 
    'laianyodiqueira@gmail.com', 
    'laianysiqueira', 
    '123', 
    '(38) 99160-6737', 
    '136.128.286-06', 
    'jhonny vasconcelos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9107999, 
    'lucimara aparecida dorneles christen', 
    'lucimarachristen@gmail.com', 
    'lucimara', 
    '123', 
    '(41) 99818-0255', 
    '065.681.559-00', 
    'Matheus dorneles medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2687353, 
    'Lucas dorneles medeiros', 
    'lucasdorneles466@gmail.com', 
    'lucas', 
    '123', 
    '(42) 98440-2509', 
    '131.788.679-88', 
    'Matheus dorneles medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2757118, 
    'odete aparecida dorneles', 
    'silmaradcamargo@gmail.com', 
    'odete', 
    '123', 
    '(41) 99117-1703', 
    '054.727.959-07', 
    'Lucas dorneles medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0948317, 
    'sidnalva maria bueno camargo', 
    'sidnalvambcamargo@gmail.com', 
    'sidnalva', 
    '123', 
    '(41) 99286-3922', 
    '545.091.229-34', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3234332, 
    'maria conceição de souza marques', 
    'mariaconceicaomarques8@gmail.com', 
    'maria', 
    '123', 
    '(65) 99246-7533', 
    '161.805.501-15', 
    'sidnalva maria bueno camargo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7861792, 
    'adilson fernandes borges', 
    'adilsonfernandesborges123@gmail.com', 
    'adilson', 
    '123', 
    '(41) 99194-7426', 
    '742.067.619-49', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6546972, 
    'Jailton Bispo', 
    'jailtonipiau@hotmail.com', 
    'jailton', 
    '123', 
    '(73) 98836-6866', 
    '005.678.915-77', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1506629, 
    'Maria Julia', 
    'mariajulia18290@gmail.com', 
    'julia', 
    '123', 
    '(41) 99137-9052', 
    '067.245.229-43', 
    'fabíola francisco luiz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6921285, 
    'Luciano Cleiton Miguel', 
    'trabalhacom.agente@gmail.com', 
    'maxbrasil', 
    '123', 
    '(41) 98849-6800', 
    '175.289.748-03', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2540577, 
    'Ewerton camargo simer', 
    'ewertonhunter1@gmail.com', 
    'ewerton', 
    '123', 
    '(41) 9195-2195', 
    '094.398.159-06', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5291669, 
    'Maria Machado', 
    'marialoira669@gmail.com', 
    'marialoira', 
    '123', 
    '(41) 98878-9531', 
    '883.682.469-20', 
    'fabíola francisco luiz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7918637, 
    'Eunilde Penteado', 
    'eunildepenteado08@gmail.com', 
    'eunilde', 
    '123', 
    '(41) 8430-5231', 
    '688.883.509-00', 
    'fabíola francisco luiz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8321472, 
    'Regina Paula', 
    'regina_depaula@hotmail.com.br', 
    'reginapaula', 
    '123', 
    '(41) 98417-1665', 
    '030.457.239-00', 
    'fabíola francisco luiz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6420730, 
    'Alex Lourenco', 
    'alexlourenco1997@gmail.com', 
    'leaoalex1', 
    '123', 
    '(41) 99835-7995', 
    '109.891.119-97', 
    'maxwel santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9044685, 
    'antonio martins da costa', 
    'assiscosta85255@gmail.com', 
    'antonio', 
    '123', 
    '(41) 9818-4451', 
    '009.235.048-85', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2539833, 
    'charles batista dos santos', 
    'charlebatista@gmail.com', 
    'charles', 
    '123', 
    '(41) 99132-1127', 
    '051.156.199-70', 
    'Ewerton camargo simer', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4935966, 
    'sônia de lima barbosa', 
    'sonia.lima.sl630@gmail.com', 
    'sonia', 
    '123', 
    '(41) 98455-7690', 
    '098.272.569-80', 
    'charles batista dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5523698, 
    'Jorge pereira dos santos', 
    'nutrylifesaude@hotmail.com', 
    'jorge', 
    '123', 
    '(41) 9827-7105', 
    '392.312.759-68', 
    'José Luiz de Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9411059, 
    'Jose Maria Figueiredo dos Santos', 
    'sanjosemoney@hotmail.com', 
    'josesantos', 
    '123', 
    '(41) 99209-1691', 
    '034.362.728-09', 
    'Jorge pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9350468, 
    'edson padilha miranda', 
    'edsonpadilhamiranda051@gmail.com', 
    'edson', 
    '123', 
    '(41) 99856-6391', 
    '081.025.509-02', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3606617, 
    'washington padilha miranda', 
    'anonimoone9@gmail.com', 
    'washington', 
    '123', 
    '(41) 99884-0452', 
    '124.357.259-06', 
    'edson padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4872431, 
    'ingrid padilha miranda', 
    'ooooooo@gmail.com', 
    'ingrid', 
    '123', 
    '(41) 99856-6391', 
    '089.819.879-80', 
    'edson padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7410743, 
    'jurandir padilha miranda', 
    'jurandirpadilhamiranda@gmail.com', 
    'jurandir', 
    '123', 
    '(41) 98797-0602', 
    '152.015.099-75', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3203045, 
    'wellington padilha miranda', 
    'wllngtnpdelh@gmail.com', 
    'wellington', 
    '123', 
    '(41) 9870-2877', 
    '152.014.999-96', 
    'jurandir padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6333411, 
    'francisco josé oliveira miranda', 
    'mirandafranciscomiranda@gmail.com', 
    'francisco', 
    '123', 
    '(41) 99121-4173', 
    '320.942.999-53', 
    'jurandir padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8205825, 
    'miguel josé oliveira miranda', 
    'mirandajose198@gmail.com', 
    'miguel', 
    '123', 
    '(41) 99108-4874', 
    '426.825.419-68', 
    'ingrid padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0064104, 
    'zilma dos santos', 
    'zolossantos89@gmail.com', 
    'zilma', 
    '123', 
    '(41) 99987-9579', 
    '728.788.199-34', 
    'ingrid padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1133686, 
    'Leticia De Almeida silva', 
    'silvaleticiaalmeida33@gmail.com', 
    'letia', 
    '123', 
    '(43) 98830-6764', 
    '801.220.899-79', 
    'jhonny vasconcelos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8964699, 
    'Mickaela Galhardohormam', 
    'hormanmickaela@gmail.com', 
    'mickaela', 
    '123', 
    '(41) 9882-4582', 
    '113.654.409-74', 
    'Laiany Manuela Oliveira de Siqueira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2061844, 
    'Eliene costa da Silva costa da Silva', 
    'elienecostadasilva057@gmail.com', 
    'eliene', 
    '123', 
    '(63) 9911-7474', 
    '020.275.041-84', 
    'sidnalva maria bueno camargo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2632006, 
    'luiz carlos ribeiro dos santos', 
    'luiz.freteiroassufologia@hotmail.com', 
    'luiz', 
    '123', 
    '(41) 98438-8496', 
    '275.051.039-20', 
    'mauricio pereira de carvalho', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0918012, 
    'carmiele pitombeira lima ferreira', 
    'carmielepitombeira@gmail.com', 
    'carmiele', 
    '123', 
    '(41) 99162-9513', 
    '073.067.663-33', 
    'Eliene costa da Silva costa da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9129517, 
    'aparecido inocencio da silva', 
    'aparecidoinocenciodasilva@gmail.com', 
    'aparecido', 
    '123', 
    '(41) 98889-5186', 
    '604.832.619-04', 
    'carmiele pitombeira lima ferreira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4059576, 
    'jose alceu', 
    'josecarmem@gmail.com', 
    'josealceu', 
    '123', 
    '(41) 99223-2531', 
    '761.966.589-72', 
    'Oseias Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8433321, 
    'hedi wilson claro', 
    'hediwclaro@hotmail.com', 
    'hedi', 
    '123', 
    '(12) 98185-7646', 
    '256.867.568-30', 
    'charles batista dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2175053, 
    'maria helena bernardo bandeira', 
    'marieli33@gmail.com', 
    'helena', 
    '123', 
    '(41) 98440-6991', 
    '031.171.679-27', 
    'hedi wilson claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2864629, 
    'fernanda pereira dos santos', 
    'feranadasomtos@gmail.com', 
    'fernanda', 
    '123', 
    '(41) 98531-8370', 
    '070.368.629-12', 
    'Ewerton camargo simer', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3203729, 
    'dineuza josé ferreira pinto', 
    'dineuzaferreira123@gmail.com', 
    'dineuza', 
    '123', 
    '(73) 98834-0853', 
    '518.406.265-34', 
    'Jailton Bispo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2999668, 
    'liliane luciano algostinho', 
    'lilianhayr@hotmail.com', 
    'liliane', 
    '123', 
    '(41) 98496-9808', 
    '055.464.629-30', 
    'Ewerton camargo simer', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4116969, 
    'elizeu lopes da rosa', 
    'elizeu.lopesdarosa@gmail.com', 
    'elizeu', 
    '123', 
    '(41) 99648-9636', 
    '065.679.009-11', 
    'celso lopes da rosa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2607383, 
    'ezaul fabio de mello', 
    'ucafabiomelouca@gmail.com', 
    'ezaul', 
    '123', 
    '(41) 99930-7068', 
    '838.700.089-20', 
    'elizeu lopes da rosa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4341825, 
    'maria da gloria da silva', 
    'mariacliente2022@gmail.com', 
    'mariadagloria', 
    '123', 
    '(41) 99842-1809', 
    '808.316.998-68', 
    'ezaul fabio de mello', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4764164, 
    'Maria Aparecida de Sousa', 
    'trabalhacom.max@gmail.com', 
    'cida1', 
    '123', 
    '(41) 98745-6708', 
    '359.778.678-24', 
    'Luciano Cleiton Miguel', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1218531, 
    'Elivelton Drey', 
    'eliveltondreyoficial@gmail.com', 
    'elivelton', 
    '123', 
    '(41) 99264-3542', 
    '097.792.799-70', 
    'Jorge pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1332375, 
    'edilson santos de jesus', 
    'agenciamktcomercill@gmail.com', 
    'edilson', 
    '123', 
    '(17) 99256-1994', 
    '862.203.995-10', 
    'jhonny vasconcelos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3894298, 
    'bismarck padilha miranda', 
    'bismarckmiranda9@gmail.com', 
    'bismarck', 
    '123', 
    '(41) 98489-0715', 
    '089.825.239-36', 
    'wellington padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6561608, 
    'marlene gonçalves carneiro', 
    'mc6774929@gmail.com', 
    'marlene', 
    '123', 
    '(41) 99874-4921', 
    '014.631.089-66', 
    'wellington padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7684942, 
    'nilson da cruz', 
    'nilsondacruz575@gmail.com', 
    'nilson', 
    '123', 
    '(41) 98409-9579', 
    '365.242.809-97', 
    'adilson fernandes borges', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3001694, 
    'jose raimundo da silva', 
    'josejr714528@gmail.com', 
    'raimundo', 
    '123', 
    '(41) 99878-6731', 
    '428.420.349-53', 
    'adilson fernandes borges', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2532230, 
    'sérgio selatchek', 
    'sergioselatchek42@gmail.com', 
    'sergio', 
    '123', 
    '(41) 99866-3453', 
    '931.646.459-53', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2953165, 
    'lindalva dos santos', 
    'lindinhasarada22@gmail.com', 
    'lindalva', 
    '123', 
    '(41) 99116-3789', 
    '052.199.449-75', 
    'sérgio selatchek', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4951015, 
    'lucio latczuc', 
    'luciolactzuck@gmail.com', 
    'lucio', 
    '123', 
    '(41) 99856-6391', 
    '051.282.659-51', 
    'sérgio selatchek', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9960331, 
    'jorge luis da silva', 
    'jls14081959@gmail.com', 
    'jorgeluis', 
    '123', 
    '(41) 99514-1596', 
    '357.973.129-72', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6421118, 
    'giseli da silva', 
    'giseleh1118@hotmail.com', 
    'giseli', 
    '123', 
    '(41) 99234-1714', 
    '070.572.849-85', 
    'jorge luis da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0945289, 
    'joão acir tinesnski', 
    'acirjoao9@gmail.com', 
    'joao', 
    '123', 
    '(41) 98874-0769', 
    '598.036.499-49', 
    'jorge luis da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3563935, 
    'cleomar pontes macedo', 
    'cleomardofutsal@hotmail.com', 
    'cleomar', 
    '123', 
    '(41) 98846-1767', 
    '664.016.409-44', 
    'washington padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0913882, 
    'ademar roberto boller', 
    'bollerademar@gmail.com', 
    'ademar', 
    '123', 
    '(41) 98707-5531', 
    '317.640.299-68', 
    'washington padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3542770, 
    'Virginia Cordeiro de lara', 
    'virginiacordeirodelara@gmail.com', 
    'vilara', 
    '123', 
    '(41) 99521-1876', 
    '631.584.859-15', 
    'Jorge pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0103470, 
    'patricia querino vaz dos santos', 
    'querinopatricia72@gmail.com', 
    'patricia', 
    '123', 
    '(41) 99864-9311', 
    '090.415.519-64', 
    'bismarck padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1814489, 
    'samyr erlom rissardi rocha da silva', 
    'samyrsilva@gmail.com', 
    'samyr', 
    '123', 
    '(41) 99631-0352', 
    '134.361.219-59', 
    'bismarck padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2363539, 
    'antonio carlos fermino da silva', 
    'ac30304@gmail.com', 
    'antoniocarlos', 
    '123', 
    '(41) 99109-3535', 
    '599.123.089-72', 
    'zilma dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1354156, 
    'nível de jesus nantes borges', 
    'niveadejesus29@gmail.com', 
    'nivel', 
    '123', 
    '(41) 98420-7094', 
    '004.227.829-55', 
    'adilson fernandes borges', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6954522, 
    'antônio pereira nantes', 
    'antonionantes059@gmail.om', 
    'nantes', 
    '123', 
    '(44) 99958-9550', 
    '021.429.789-67', 
    'nível de jesus nantes borges', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3952322, 
    'maurilei da silva nascimento', 
    'prmaurilei1@gmail.com', 
    'maurilei', 
    '123', 
    '(41) 99989-3792', 
    '048.102.967-25', 
    'zilma dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7602020, 
    'anderson tolentino dos santos', 
    'zenaide5219@gmail.com', 
    'anderson', 
    '123', 
    '(41) 99159-3127', 
    '974.691.739-00', 
    'maria helena bernardo bandeira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4747902, 
    'maikon vinicius borges', 
    'viniciusmaikon883@gmail.com', 
    'maikon', 
    '123', 
    '(41) 98709-9833', 
    '108.198.499-60', 
    'maria helena bernardo bandeira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0393954, 
    'iracema ferreira de oliveira tinte', 
    'cema.tinte@gmail.com', 
    'cema', 
    '123', 
    '(41) 99908-5823', 
    '943.004.969-00', 
    'lucio latczuc', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5527453, 
    'idalina ferreira de oliveira', 
    'ferreiraidalina87@gmail.com', 
    'idalina', 
    '123', 
    '(41) 99908-5823', 
    '032.567.599-63', 
    'iracema ferreira de oliveira tinte', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4329558, 
    'reginaldo do nascimento santos', 
    'reginaldodedeus1989@gmail.com', 
    'reginaldo', 
    '123', 
    '(41) 98503-5078', 
    '070.894.859-60', 
    'iracema ferreira de oliveira tinte', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5826649, 
    'maria teresinha da silva', 
    'hbrasileiratere@gmail.com', 
    'mariateresinha', 
    '123', 
    '(41) 98478-2485', 
    '017.812.319-66', 
    'lucio latczuc', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2920187, 
    'gerson dos santos de oliveira', 
    'gersonsantos@gmail.com', 
    'gerson', 
    '123', 
    '(41) 99855-5417', 
    '018.825.149-98', 
    'miguel josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0791825, 
    'darla fernanda szymanski', 
    'darla_szymanski@hotmail.com', 
    'darla', 
    '123', 
    '(41) 99820-6551', 
    '110.499.409-70', 
    'José Luiz de Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5771074, 
    'Rosilda Andrade de souza', 
    'brendasantos6297@gmail.com', 
    'rosilda', 
    '123', 
    '(47) 99192-3635', 
    '069.333.959-44', 
    'laudenice da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2937609, 
    'Danier Siqueira monteiro', 
    'danielsiqueiramonteiro1960@gmail.com', 
    'siqueira', 
    '123', 
    '(41) 99285-5305', 
    '318.565.009-34', 
    'Jorge pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3353478, 
    'vanda gonçalves ferreira', 
    'vandicactba@gmail.com', 
    'vanda', 
    '123', 
    '(41) 99832-4661', 
    '726.840.469-72', 
    'jose costa dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1720237, 
    'valdir roberto scheffelmeier', 
    'vscheffelmeier@gmail.com', 
    'valdir', 
    '123', 
    '(19) 9162-2578', 
    '765.720.729-91', 
    'vanda gonçalves ferreira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2160803, 
    'carlos ribeiro de andrade', 
    'carlosrandrade0703@gmail.com', 
    'carlosribeiro', 
    '123', 
    '(41) 99756-3537', 
    '171.330.179-20', 
    'davi gomes', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7191506, 
    'claudinei spindola', 
    'nunonogueiro@gmail.com', 
    'claudinei', 
    '123', 
    '(19) 9811-0744', 
    '019.910.159-09', 
    'silso pereira da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2130334, 
    'jose ani cezar correia', 
    'joseanicezar047@gmail.com', 
    'anicezar', 
    '123', 
    '(41) 98452-6957', 
    '320.188.359-04', 
    'claudinei spindola', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8131425, 
    'israel fernandes de oliveira', 
    'israeloliveira401981@gmail.com', 
    'israel', 
    '123', 
    '(41) 98426-4000', 
    '045.190.049-93', 
    'sidnalva maria bueno camargo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1795663, 
    'Geraldo renato Alves de solza', 
    'gasrenato@gmail.com', 
    'renato', 
    '123', 
    '(41) 9590-4008', 
    '835.842.699-20', 
    'sidnalva maria bueno camargo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4111550, 
    'Gilmar neves de campos', 
    'gilmarnevesdecampos2019@gmail.com', 
    'gilmar10', 
    '123', 
    '(41) 9972-8507', 
    '978.584.809-44', 
    'Alaor Garcia da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5636653, 
    'Salete Freitas Farias Lourenço', 
    'saletefreitas.4321@gmail.com', 
    'salete', 
    '123', 
    '(55) 41992-9597', 
    '020.626.809-29', 
    'laudenice da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6563838, 
    'simone de jesus lopes', 
    'shiminho100@gmail.com', 
    'simone', 
    '123', 
    '(41) 99863-5926', 
    '686.883.939-15', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7354951, 
    'josé valdeci lopes', 
    'josevaldecilopes71@gmail.com', 
    'valdecir', 
    '123', 
    '(41) 99249-3276', 
    '747.868.909-44', 
    'simone de jesus lopes', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8332954, 
    'Márcia Velozo', 
    'vendermais369@gmail.com', 
    'marciavelozo', 
    '123', 
    '(41) 99971-2178', 
    '610.651.619-72', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4209211, 
    'Fabio Bomfim', 
    'smartbinhoo@hotmail.com', 
    'fabio', 
    '123', 
    '(41) 99889-9087', 
    '090.925.819-84', 
    'Jorge pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6349551, 
    'Dalmon Pereira dos Santos', 
    'dalmon.santos@hotmail.com', 
    'dalmonsantos', 
    '123', 
    '(41) 99578-9300', 
    '530.401.399-91', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7767970, 
    'Sara Monteiro', 
    'saramonteiro.pedagogia@gmail.com', 
    'saritinha123', 
    '123', 
    '(85) 98136-9297', 
    '999.145.902-25', 
    'Fabio Bomfim', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5755920, 
    'Joaquim Bomfim', 
    'joaquimbomfim2019@gmail.com', 
    'joaquim', 
    '123', 
    '(41) 99709-0881', 
    '552.804.719-68', 
    'Fabio Bomfim', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7258740, 
    'Andiara Correia', 
    'andy.correia@yahoo.com.br', 
    'andy', 
    '123', 
    '(41) 99652-5789', 
    '043.398.829-09', 
    'Fabio Bomfim', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5161089, 
    'Rosely Monteiro', 
    'silvarosely555@gmail.com', 
    'rosely', 
    '123', 
    '(94) 99953-0680', 
    '392.364.392-68', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9415789, 
    'sebastiao manuel gonçalves', 
    'sebastiaogoncalvespresidente@gmail.com', 
    'sebastiao', 
    '123', 
    '(11) 98803-9001', 
    '353.950.109-63', 
    'darla fernanda szymanski', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6802441, 
    'jair da silva fernandes', 
    'calhasevidroscastelo@gmail.com', 
    'jair', 
    '123', 
    '(41) 99979-6362', 
    '393.878.289-72', 
    'darla fernanda szymanski', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9604483, 
    'emerson gomes lemes', 
    'emersonglemes@hotmail.com', 
    'emerson', 
    '123', 
    '(35) 98838-8321', 
    '039.974.936-50', 
    'jair da silva fernandes', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7111285, 
    'jose ronaldo da silva agiar', 
    'jragiar.sil@gmail.com', 
    'agiar', 
    '123', 
    '(41) 98482-5436', 
    '996.295.184-49', 
    'sebastiao manuel gonçalves', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2693309, 
    'ezequiel moreira', 
    'ezequielmoreira29012008@gmail.com', 
    'ezequiel', 
    '123', 
    '(39) 9804-4395', 
    '044.639.689-33', 
    'jose ronaldo da silva agiar', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0839070, 
    'gilda rosa da silva', 
    'gildarosadasilva33@gmail.com', 
    'gilda', 
    '123', 
    '(41) 98504-4559', 
    '392.275.889-49', 
    'ezequiel moreira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5834604, 
    'Maria Conceição Batista Figueiredo', 
    'mariafiguereido91@gmail.com', 
    'mariaconceicao', 
    '123', 
    '(11) 99694-9308', 
    '304.188.058-06', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6296512, 
    'Jhonatan Henrique da silva', 
    'jhonantanhenrique297@gmail.com', 
    'jhonatan', 
    '123', 
    '(43) 98493-6341', 
    '068.359.199-14', 
    'jhonny vasconcelos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9232773, 
    'Neusa De Oliveira Baray', 
    'neusabaray.email@gmail.com', 
    'neusabry', 
    '123', 
    '(41) 99885-3113', 
    '385.921.342-34', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1595041, 
    'Maria Madalena Costa', 
    'madalenam1956@gmail.com', 
    'madalena', 
    '123', 
    '(41) 99894-0632', 
    '567.837.369-20', 
    'Neusa De Oliveira Baray', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1966950, 
    'Vilma Terezinha gomes', 
    'vilmaterezinha72@gmail.com', 
    'vilma', 
    '123', 
    '(41) 99762-8846', 
    '231.760.679-68', 
    'Danier Siqueira monteiro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4016966, 
    'Marcio Clemente', 
    'marcio.clemente@yahoo.com.br', 
    'marcinho12', 
    '123', 
    '(41) 99947-4175', 
    '048.576.109-22', 
    'Jorge pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9541878, 
    'Marisane Antunes de lima', 
    'marisaneantunes@hotmail.com', 
    'marisane123', 
    '123', 
    '(95) 99174-3989', 
    '881.242.829-00', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0240466, 
    'Érica Farias de Araújo', 
    'ericaf.a01@outlook.com', 
    'erica', 
    '123', 
    '(41) 99902-5912', 
    '070.578.751-69', 
    'maxwel santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9916761, 
    'Raffael Richard Rocha', 
    'arenared@hotmail.com', 
    'rafaelrocha', 
    '123', 
    '(41) 99709-3789', 
    '084.839.589-10', 
    'Joana Alcina Rodrigues Castro Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3417956, 
    'Ezequiel Guimarães', 
    'collenguimas@gmail.com', 
    'ezequielguima', 
    '123', 
    '(41) 98751-4316', 
    '029.876.109-20', 
    'Raffael Richard Rocha', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8851832, 
    'Arnaldo Rodrigues Figueiredo', 
    'rodrigueaarnaldo625@gmail.com', 
    'arnaldo', 
    '123', 
    '(47) 99615-3905', 
    '034.772.478-76', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0123601, 
    'murilo luiz dias henrique', 
    'murilo.l@grupoeloss.com.br', 
    'murilolilo', 
    '123', 
    '(11) 99999-9999', 
    '875.879.590-17', 
    'Topo Rede', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7920234, 
    'Júlio Galvão', 
    'julio.adriana.luiz@gmail.com', 
    'juliogalvao', 
    '123', 
    '(84) 99453-5852', 
    '009.559.524-41', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8520902, 
    'ildefonço ferreira de oliveira', 
    'aaa@gmail.com', 
    'afonco', 
    '123', 
    '(41) 98733-3232', 
    '833.085.639-91', 
    'Érica Farias de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2595811, 
    'Milena Silva', 
    'milenarichene77@gmail.com', 
    'milenasilva', 
    '123', 
    '(41) 98722-3607', 
    '605.734.812-53', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1340837, 
    'Patrike Daniel Pedroso', 
    'patrikedaniel2@icloud.com', 
    'patrike', 
    '123', 
    '(41) 99568-7295', 
    '058.892.799-63', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9794683, 
    'Diully Einy Rodrigues Castro Mendes Claro', 
    'diully-einy@hotmail.com', 
    'diully', 
    '123', 
    '(41) 99776-5591', 
    '119.115.989-29', 
    'Joana Alcina Rodrigues Castro Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2640676, 
    'joao vicente jordao', 
    'joaovicentejordao@gmail.com', 
    'vicente', 
    '123', 
    '(41) 98516-1338', 
    '510.744.789-91', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6747001, 
    'Rosilene Figueiredo alves', 
    'rosilenefigueiredoalves@hotmail.com', 
    'rosialves', 
    '123', 
    '(41) 99263-8068', 
    '071.866.476-00', 
    'Arnaldo Rodrigues Figueiredo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0287716, 
    'Jean Henrique Aparecido da Silva', 
    'diretoriabaraoesilva@gmail.com', 
    'jeanhenrique', 
    '123', 
    '(41) 99843-9288', 
    '061.828.999-21', 
    'Joana Alcina Rodrigues Castro Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7372499, 
    'Marcio Jakson Soares de Lima', 
    'jjcapas@gmail.com', 
    'marciojj', 
    '123', 
    '(41) 99589-6577', 
    '024.145.539-10', 
    'Joana Alcina Rodrigues Castro Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0609849, 
    'Joyce Emile Feitora Rodrigues', 
    'joyceemile15@hotmail.com', 
    'joyce', 
    '123', 
    '(41) 99744-5880', 
    '430.155.573-00', 
    'Ezequiel Guimarães', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9162624, 
    'Daniel Ferreira da Silva', 
    'daniel.ferreira.vgt@gmail.com', 
    'danielferreira', 
    '123', 
    '(47) 99226-1671', 
    '079.366.494-25', 
    'Ezequiel Guimarães', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3893104, 
    'Ydalmi Josefina Herrera Diaz', 
    'ydalmiwork@gmail.com', 
    'ydalmi', 
    '123', 
    '(41) 99619-0996', 
    '709.844.952-07', 
    'Ezequiel Guimarães', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0662793, 
    'Arelys Nohemi Herrera', 
    'arelisherreranohemi@gmail.com', 
    'arelys', 
    '123', 
    '(41) 99933-9628', 
    '707.326.312-11', 
    'Ezequiel Guimarães', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6994692, 
    'Felipe Pereira Sousa', 
    'fellipe246@gmail.com', 
    'fiii', 
    '123', 
    '(63) 99123-1425', 
    '046.083.891-14', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2412340, 
    'Wild Halama', 
    'halama120121214652@gmail.com', 
    'Halama1111111111', 
    '123', 
    '(41) 99999-9999', 
    '090.642.239-63', 
    'Patrike Daniel Pedroso', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9691030, 
    'Solange Kuhn', 
    'solangekuhnsmi24@gmail.com', 
    'solangekuhn123', 
    '123', 
    '(45) 99814-6021', 
    '030.515.479-64', 
    'Marisane Antunes de lima', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2637492, 
    'Viviane Cristina da silva', 
    'vicpqna@hotmail.com', 
    'vivi10', 
    '123', 
    '(41) 99266-4964', 
    '058.065.409-52', 
    'Alaor Garcia da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8148133, 
    'Vera Lucia  Aparecida Machado de Ramos', 
    'veraluciamachado@gmail.com', 
    'vera', 
    '123', 
    '(41) 98491-7640', 
    '029.042.969-21', 
    'cleuci costa  do  santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1716620, 
    'Maria Garcia Guerreiro', 
    'mariagarciaguerreiro7@gmail.com', 
    'mariagarcia', 
    '123', 
    '(41) 99612-2627', 
    '057.639.519-64', 
    'davi gomes', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8324807, 
    'Valdo Nunes de Brito', 
    'valdonunesdebrito36@gmail.com', 
    'valdo', 
    '123', 
    '(41) 99694-3349', 
    '237.410.749-34', 
    'José Luiz de Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0093208, 
    'Francine Dias da Conceição Labres de Oliveira', 
    'frandjalo.dias@gmail.com', 
    'frandjalo', 
    '123', 
    '(41) 98858-7672', 
    '076.819.349-44', 
    'maxwel santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4087214, 
    'Alessandra dos Santos Gobatto', 
    'alessandradoss@gmail.com', 
    'alessandra', 
    '123', 
    '(41) 98534-0790', 
    '017.726.889-16', 
    'carmiele pitombeira lima ferreira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4549644, 
    'Pedro Flávio Almeida Silva', 
    'pedroflavioalmeida777@gmail.com', 
    'pedroflavio', 
    '123', 
    '(41) 99259-5719', 
    '029.605.294-99', 
    'Ewerton camargo simer', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0964320, 
    'Wesley Henrrique', 
    'henrriquewesley99@gmail.com', 
    'wesley007', 
    '123', 
    '(41) 99881-5533', 
    '087.680.989-10', 
    'israel fernandes de oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8918423, 
    'Geraldo Carvalho Costa', 
    'geraldocarvalhocosta1960@gmail.com', 
    'geraldo', 
    '123', 
    '(15) 99132-2130', 
    '035.707.258-80', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3336809, 
    'Maria Almeida', 
    'mariahelenajj1@gmail.com', 
    '123maria', 
    '123', 
    '(93) 98894-0149', 
    '451.217.884-87', 
    'Pedro Flávio Almeida Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1078961, 
    'Paulo Kayto de Souza Morgado', 
    'dev.pkayto@gmail.com', 
    'gatomiau', 
    '123', 
    '(13) 98132-1002', 
    '362.068.528-22', 
    'Patrike Daniel Pedroso', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4302276, 
    'Anthony Nessias Borges Luiz', 
    'anthony.nbl94@gmail.com', 
    'anthony', 
    '123', 
    '(41) 98455-4328', 
    '087.415.449-94', 
    'Jean Henrique Aparecido da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6542661, 
    'Dalva de Lima Andrade', 
    'dalvalimaandrade0@gmail.com', 
    'dalva', 
    '123', 
    '(41) 98474-3648', 
    '075.072.019-02', 
    'Anthony Nessias Borges Luiz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8980469, 
    'Luiza Gerei Szymonek', 
    'gereiluiza@gmail.com', 
    'luiza', 
    '123', 
    '(41) 98895-6566', 
    '061.529.309-36', 
    'Anthony Nessias Borges Luiz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8956291, 
    'Diego Rogerio da Silva Alves', 
    'diegorogeriosa@gmail.com', 
    'diego', 
    '123', 
    '(41) 98521-1117', 
    '060.947.459-65', 
    'Jean Henrique Aparecido da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2221813, 
    'claudemir dos santos gomes', 
    'claudemirdossantosgomes22@gmail.com', 
    'claudemir', 
    '123', 
    '(41) 99144-1247', 
    '017.744.379-02', 
    'jose costa dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7279016, 
    'Jonas Pereira', 
    'sete7queda@gmail.com', 
    'jonas', 
    '123', 
    '(41) 99101-8508', 
    '033.312.549-59', 
    'cleuci costa  do  santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8102137, 
    'rosilda dias ferreira', 
    'rosildadias875@gmail.com', 
    'rosildadias', 
    '123', 
    '(99) 98819-7399', 
    '843.582.703-87', 
    'odete aparecida dorneles', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2658301, 
    'Neide maria Da Silva Oliveira', 
    'neidems.oliveira@gmail.com', 
    'neide', 
    '123', 
    '(19) 99643-8420', 
    '030.977.368-75', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5403999, 
    'Vera Lucia Rosa dos Santos', 
    'veraluciarosa38@gmail.com', 
    'verarosa', 
    '123', 
    '(41) 99764-4438', 
    '456.999.179-34', 
    'laudenice da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1524515, 
    'Maria de lurdes gonçalves katcharowski', 
    'itielcosta67@gmail.com', 
    'mariadelurdes', 
    '123', 
    '(41) 98829-8159', 
    '391.931.799-87', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3100693, 
    'joeli barbosa de almeida', 
    'joelibarbosa99@gmail.com', 
    'joeli', 
    '123', 
    '(41) 99209-1011', 
    '672.019.979-04', 
    'laudenice da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8446830, 
    'leia dos santos', 
    'leiasantosrosa11@gmail.com', 
    'leia', 
    '123', 
    '(41) 99762-7582', 
    '057.733.459-00', 
    'José Luiz de Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7029894, 
    'Carmem Almeida', 
    'flavioalmeida1970novo@gmail.com', 
    'carmem', 
    '123', 
    '(41) 99718-1237', 
    '027.611.604-60', 
    'Pedro Flávio Almeida Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1051468, 
    'Manoel Domingos Bruno da Silva', 
    'salao20191919@gmail.com', 
    'domingossp', 
    '123', 
    '(11) 95274-1839', 
    '986.243.345-00', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9024915, 
    'karolina Cordeiro dos Santos', 
    'ninasantoskg@gmail.com', 
    'karoina', 
    '123', 
    '(47) 99287-8624', 
    '077.732.749-08', 
    'Rosilda Andrade de souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3009043, 
    'Kaue Moreira', 
    'kaue.moreira.12@icloud.com', 
    'kauemoreira', 
    '123', 
    '(43) 99933-6049', 
    '125.666.959-89', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0886874, 
    'Edinelson Manoel Dos Santos', 
    'edinelsongato@hotmail.com', 
    'user0886874', 
    '123', 
    '(71) 99179-3568', 
    '534.950.985-34', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4368770, 
    'Laércio Montesso Gonçalves', 
    'montesso70@gmail.com', 
    'montesso', 
    '123', 
    '(41) 99727-8733', 
    '723.244.739-68', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4518847, 
    'alda cordeiro da Rosa dos Santos', 
    'aldarosa2019@gmail.com', 
    'alda', 
    '123', 
    '(47) 9701-8630', 
    '017.954.889-13', 
    'Rosilda Andrade de souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9627808, 
    'Roseli Cruz Novais da Silva Novais', 
    'rosecnovais1969@gmail.com', 
    'roseli', 
    '123', 
    '(77) 99949-2183', 
    '593.647.345-72', 
    'Laércio Montesso Gonçalves', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0229849, 
    'Maria Fernandes Borges Dias', 
    'mariafernandesborgesdias@gmail.com', 
    'donamaria', 
    '123', 
    '(44) 99815-7805', 
    '021.956.029-37', 
    'adilson fernandes borges', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0548167, 
    'Janecir Spancerski', 
    'janecir.dotlimp@gmail.com', 
    'janecir', 
    '123', 
    '(45) 99836-1926', 
    '703.235.429-72', 
    'Marisane Antunes de lima', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6813693, 
    'João Alves Algarrão', 
    'joaoalgarrao@gmail.com', 
    'joaoalgarrao', 
    '123', 
    '(43) 98802-4868', 
    '030.198.317-84', 
    'Laércio Montesso Gonçalves', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0514573, 
    'Osmar Pereira silva', 
    '1976@gmail.com', 
    'osmar', 
    '123', 
    '(44) 99728-8193', 
    '555.657.519-34', 
    'Laércio Montesso Gonçalves', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1832240, 
    'Veralaine Romano da silva', 
    'veralainenegao@gmail.com', 
    'veralaine', 
    '123', 
    '(44) 99936-7122', 
    '042.955.949-62', 
    'Osmar Pereira silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3594750, 
    'Edmilson Aparecido da Conceissão', 
    'deliciasepetiscositai@gmail.com', 
    'edmilson', 
    '123', 
    '(41) 99136-8851', 
    '038.356.089-67', 
    'Jean Henrique Aparecido da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0791303, 
    'Claudinei Oliveira', 
    'claudinei.70@live.com', 
    'shuai-jiao', 
    '123', 
    '(41) 99502-7170', 
    '728.793.789-15', 
    'Laércio Montesso Gonçalves', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1024240, 
    'Elesandro de Souza Vicente', 
    'sandrovl@outlook.com.br', 
    'sandrocapa', 
    '123', 
    '(97) 99162-5635', 
    '040.985.272-43', 
    'Patrike Daniel Pedroso', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0968620, 
    'Alexsandro Godinho Hoffmann', 
    'alex.godinho22@yahoo.com', 
    'alexsandro', 
    '123', 
    '(31) 98380-2644', 
    '123.759.926-10', 
    'simone de jesus lopes', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6038051, 
    'Rafael Grando', 
    'rafael.grando.21@gmail.com', 
    'rafaelgrando', 
    '123', 
    '(41) 9836-6391', 
    '100.062.239-82', 
    'simone de jesus lopes', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2013639, 
    'Adriana Vicente Lins', 
    'linsbonifica@gmail.com', 
    'adrianalins', 
    '123', 
    '(69) 99920-6199', 
    '171.217.698-67', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9349118, 
    'Luiz Queiroz', 
    'americaluizsantos1976@gmail.com', 
    'vencedortop', 
    '123', 
    '(69) 99272-4203', 
    '599.808.852-20', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3555595, 
    'Lismara Cortez Algarrão', 
    'lismara-cortez@hotmail.com', 
    'lismara', 
    '123', 
    '(43) 98849-6476', 
    '004.999.289-97', 
    'João Alves Algarrão', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0141129, 
    'Osnir Ceccon', 
    'cecconosni@hotmail.com', 
    'ocsuplementos', 
    '123', 
    '(41) 99615-1212', 
    '704.432.549-15', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0973242, 
    'Sergio Alessandro Braga', 
    'salessandrobraga41@gmail.com', 
    'alexsandro100', 
    '123', 
    '(11) 96620-1217', 
    '170.975.158-48', 
    'Patrike Daniel Pedroso', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8452617, 
    'Marcos Lima Rovaris', 
    'marcosl.rovaris@gmaik.com', 
    'marcoslr', 
    '123', 
    '(48) 99909-2389', 
    '079.834.749-03', 
    'Ramon Patricio Dutra', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2691209, 
    'Guilherme Fortuna', 
    'guilherme.4tuna@gmail.com', 
    'guilhermefortuna', 
    '123', 
    '(48) 99158-2348', 
    '079.171.199-47', 
    'Ramon Patricio Dutra', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2351462, 
    'Nilzete Andrade', 
    'nilzetemedeiros@outlook.com', 
    'nilzete', 
    '123', 
    '(22) 99708-3535', 
    '089.888.837-99', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6483682, 
    'Edvaldo G da silva', 
    'negocio12@gmail.com', 
    'vilaparisi', 
    '123', 
    '(61) 98279-2101', 
    '323.213.091-72', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2927599, 
    'Paulo Silva', 
    'paulosilvabilu05@gmail.com', 
    'paulosilva', 
    '123', 
    '(19) 98414-8317', 
    '647.674.856-49', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6021232, 
    'Victor Borges', 
    'senavictor508@gmail.com', 
    'victor', 
    '123', 
    '(91) 98249-1136', 
    '705.499.672-06', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5062008, 
    'Gilvania Maria Da Silva Lima Lima', 
    'gill.933110@gmail.com', 
    'gilvania6905', 
    '123', 
    '(82) 98848-5699', 
    '725.033.434-49', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3615834, 
    'Mayara De Araújo Medeiros Antão', 
    'mayara962010@hotmail.com', 
    'mayara', 
    '123', 
    '(22) 98837-4221', 
    '157.027.347-26', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8693378, 
    'Lourinaldo Ernesto Antao', 
    'lourinaldo357@gmail.com', 
    'lourinaldo', 
    '123', 
    '(22) 99258-5510', 
    '110.570.437-88', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0628258, 
    'Thayná Duarte', 
    'thaynaduart19@gmail.com', 
    'thayna', 
    '123', 
    '(22) 99841-2741', 
    '176.274.957-25', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6308225, 
    'Luciana Santos', 
    'lucycelo33@gmail.com', 
    'lucycelo', 
    '123', 
    '(22) 99212-1122', 
    '840.834.095-68', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1444475, 
    'Willams Gonçalves', 
    'willamsgoncalvesserconio@outlook.com', 
    'willamsg', 
    '123', 
    '(66) 99606-4662', 
    '051.960.634-55', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1461923, 
    'Alessandra Rosa de Araújo', 
    'sandra.rosa.10r@gmail.com', 
    'alessandrarosa', 
    '123', 
    '(22) 99859-3520', 
    '094.977.477-48', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1020605, 
    'Amelia Oliveira Ribeiro', 
    'ameliaribeiro287@gmail.com', 
    'ameliaribeiro', 
    '123', 
    '(47) 93381-8648', 
    '486.463.182-49', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5270064, 
    'Célia Alves Braga Braga', 
    'celiabraga1983@gmail.com', 
    'celia5883', 
    '123', 
    '(21) 97944-2658', 
    '545.792.877-20', 
    'Gilvania Maria Da Silva Lima Lima', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3637700, 
    'Emanoel Souza', 
    'emanoelbaptista5@gmail.com', 
    'souza', 
    '123', 
    '(21) 97595-6307', 
    '888.289.997-72', 
    'Sergio Alessandro Braga', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2332948, 
    'Marcos Abreu', 
    'magaiver_abreu@hotmail.com', 
    'magaiver', 
    '123', 
    '(98) 98890-6545', 
    '408.137.113-04', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4713475, 
    'Stefanie Rodrigues Hildever', 
    'vitorhildever@gmail.com', 
    'vitor5000', 
    '123', 
    '(11) 91642-8792', 
    '152.372.686-50', 
    'Sergio Alessandro Braga', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7679134, 
    'Maria Goreti Da Rosa', 
    'darosagoreti5@gmail.com', 
    'goreti1966', 
    '123', 
    '(48) 99862-8032', 
    '784.977.959-20', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9303029, 
    'Pedro Henrique', 
    'pedroazevedoigrejauniversal@gmail.com', 
    'rsprolipsibrasil', 
    '123', 
    '(21) 97885-2097', 
    '058.073.847-76', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4922571, 
    'Aguinaldo Andrade de Araújo', 
    'aguinaldoandradedearaujo14@gmail.com', 
    'aguinaldo', 
    '123', 
    '(22) 99792-2437', 
    '109.780.017-29', 
    'Alessandra Rosa de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6966946, 
    'giselda fernanda costa arruda', 
    'giseldafernanda88@gmail.com', 
    'giselda', 
    '123', 
    '(41) 99858-7012', 
    '060.629.579-83', 
    'Luciano Cleiton Miguel', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6650832, 
    'Kemeli De Melo Ferreira', 
    'kemeli14@hotmail.com.br', 
    'kemeli', 
    '123', 
    '(38) 99160-6737', 
    '136.128.286-06', 
    'Luiz Queiroz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3601772, 
    'Manoel Vicente Luiz', 
    'manoelvicenteluiz789@gmail.com', 
    'manoelins', 
    '123', 
    '(69) 99920-6199', 
    '275.862.514-87', 
    'Adriana Vicente Lins', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9856198, 
    'Nadeje Lins Serafim', 
    'nadejelinsserafim@gmail.com', 
    'nadejelins', 
    '123', 
    '(69) 69999-2061', 
    '716.029.254-53', 
    'Manoel Vicente Luiz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6008864, 
    'Saulo Virgilio Barbosa', 
    'saulaomaxprimebarbosa1987@gmail.com', 
    'saulao123', 
    '123', 
    '(69) 99343-3097', 
    '004.281.302-67', 
    'Laércio Montesso Gonçalves', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5551879, 
    'Márcia Souza', 
    'marciaddb2120@gmail.com', 
    'marciasouza', 
    '123', 
    '(41) 99908-5000', 
    '067.094.039-98', 
    'Alessandra Rosa de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5980522, 
    'Rafael Alves Guido', 
    'rafael.apvs1@hotmail.com', 
    'multinivel1', 
    '123', 
    '(62) 99522-8087', 
    '858.714.513-49', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6524017, 
    'Afonso Santos Da Silva', 
    'afonsoss@hotmail.com', 
    'afonso', 
    '123', 
    '(41) 98817-0648', 
    '752.717.619-91', 
    'jose costa dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7527227, 
    'Janete Ferreira', 
    'janeteferreira303@gmail.com', 
    'jane', 
    '123', 
    '(41) 99141-4282', 
    '020.293.809-38', 
    'laudenice da silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7699916, 
    'Silmara Miranda', 
    'silmaramacedo146@yahoo.com.br', 
    'silmara', 
    '123', 
    '(93) 99226-5648', 
    '605.447.082-53', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5167653, 
    'CICERO RODRIGUES DOS SANTOS', 
    'cicerorodrigues001@gmail.com', 
    'lider10', 
    '123', 
    '(88) 99999-1556', 
    '973.464.623-00', 
    'Luciano Cleiton Miguel', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7066286, 
    'Audicir Canal', 
    'audicirflp@gmail.com', 
    'audi3007', 
    '123', 
    '(49) 98416-3475', 
    '007.630.599-60', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7135801, 
    'Rosemario Martins Bernadino', 
    'rosemariomb1966@gmail.com', 
    'rosemario', 
    '123', 
    '(12) 98811-5853', 
    '553.152.166-91', 
    'edilson santos de jesus', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2334633, 
    'Geziane Nunes de Almeida', 
    'nanydealmeidaoliveira1988@gmail.com', 
    'nany', 
    '123', 
    '(41) 98406-6384', 
    '074.066.409-35', 
    'cleuci costa do santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5223375, 
    'Dilvete Borba Alves', 
    'dilvetealves2020@gmail.com', 
    'dilvete1234', 
    '123', 
    '(41) 99722-7575', 
    '479.110.859-00', 
    'Maria Goreti Da Rosa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0904693, 
    'CLAUDINEI MOREIRA', 
    'zoinho0001@hotmail.com', 
    'claudineimoreira', 
    '123', 
    '(41) 99610-2088', 
    '014.412.469-67', 
    'jose costa dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4245218, 
    'Luiz Gustavo Ribeiro]', 
    'rluizgustavo049@gmail.com', 
    'luizribeiro', 
    '123', 
    '(41) 99697-7895', 
    '143.645.779-36', 
    'joziana pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1048130, 
    'Adiclandia Vicente Lins Gozzer', 
    'adibonifica@gmail.com', 
    'adiclandialins', 
    '123', 
    '(69) 99920-6199', 
    '636.682.382-00', 
    'Nadeje Lins Serafim', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2295392, 
    'Jacilene Pessoa', 
    'jacilenemenezes.bonifica@gmail.com', 
    'jacilene', 
    '123', 
    '(68) 99915-1372', 
    '689.491.972-00', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2586874, 
    'Rosa Alves de Barros Barros', 
    'rosaalves194604@gmail.com', 
    'rosaalves', 
    '123', 
    '(91) 98037-1467', 
    '134.832.772-34', 
    'Gilvania Maria Da Silva Lima Lima', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2865441, 
    'Enildo Vieira januario', 
    'enildo.januario@gmail.com', 
    'nildo12rs', 
    '123', 
    '(11) 95314-2890', 
    '337.767.068-80', 
    'edilson santos de jesus', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7917812, 
    'Roberto Avelino Tomé', 
    'roberto.tome5@hotmail.com', 
    'robertotome', 
    '123', 
    '(43) 99931-1744', 
    '682.170.309-44', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8224912, 
    'Adnilson De Paula', 
    'adnilsin1980@gmail.com', 
    'adnilsonvendedor', 
    '123', 
    '(48) 99974-7896', 
    '064.609.749-00', 
    'Luciano Cleiton Miguel', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8112003, 
    'Adriano Sousa dos Santos', 
    'adriano_iva@hotmail.com', 
    'adriano', 
    '123', 
    '(11) 97485-2942', 
    '287.280.358-01', 
    'Alessandra Rosa de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1267829, 
    'Teone Quirino Soares', 
    'teonesoares@gmail.com', 
    'teone', 
    '123', 
    '(83) 98859-2034', 
    '338.098.444-20', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6390609, 
    'altamir alves marquardt', 
    'altamirmarquardt@gmail.com', 
    'altamir', 
    '123', 
    '(41) 99953-6882', 
    '414.766.709-00', 
    'simone de jesus lopes', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5737344, 
    'john herbert do avelar', 
    'john.avelar@yahoo.com.br', 
    'user5737344', 
    '123', 
    '(41) 99287-7892', 
    '010.176.189-92', 
    'Roberto Avelino Tomé', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8399852, 
    'dalverson wagner correia', 
    'jdestampas.artesanatos@yahoo.com', 
    'dalverson', 
    '123', 
    '(41) 99999-9999', 
    '034.945.549-00', 
    'jhonny vasconcelos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2806973, 
    'Esolimar Vieira paz', 
    'esolimarvieirapaz@gmail.com', 
    'esolimar', 
    '123', 
    '(69) 99266-6720', 
    '012.669.271-82', 
    'Alessandra Rosa de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6362034, 
    'Tatiana Vasconcelos', 
    'tatianavaviana@gmail.com', 
    'tatiana', 
    '123', 
    '(11) 97153-0114', 
    '324.781.298-92', 
    'Alessandra Rosa de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2735381, 
    'marileia rio branco dos santos', 
    'maririo2001@gmail.com', 
    'mari10', 
    '123', 
    '(41) 99813-6775', 
    '046.704.039-74', 
    'Alaor Garcia da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8366158, 
    'INES TEREZINHA KOLACHNEK', 
    'inestkolachnek@gmail.com', 
    'ines10', 
    '123', 
    '(41) 98406-6686', 
    '747.708.889-53', 
    'Alaor Garcia da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5522084, 
    'Joao Medeiros', 
    'jotacemedeiros@gmail.com', 
    'jotace90', 
    '123', 
    '(65) 99292-4336', 
    '219.804.702-00', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6897883, 
    'Claudiney Sousa Luna', 
    'claudineysousaluna@gmail.com', 
    'claudiney', 
    '123', 
    '(83) 98611-1462', 
    '033.676.234-82', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9446885, 
    'Nadja Alves', 
    'alvesacessorios.eparaja@gmail.com', 
    'nadjaalves', 
    '123', 
    '(81) 9424-9303', 
    '766.136.404-25', 
    'Alessandra Rosa de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6280732, 
    'João Vieira Borges', 
    'joaovieiraborges4@gmail.com', 
    'joaovieira', 
    '123', 
    '(41) 99730-8586', 
    '703.684.149-49', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8718708, 
    'Josias Arruda Coimbra', 
    'josiascoimbraarruda@gmail.com', 
    'josiascoimbra123', 
    '123', 
    '(65) 99227-1710', 
    '544.943.031-00', 
    'Joao Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5912054, 
    'Tiago Santos Miranda', 
    'tiagomiranda06@gmail.com', 
    'esradiamante', 
    '123', 
    '(73) 99923-5658', 
    '032.088.315-95', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5969457, 
    'Jean Farias', 
    'jeanfariasc@gmail.com', 
    'jean', 
    '123', 
    '(41) 98877-7392', 
    '511.287.053-20', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4228446, 
    'Antônio Geraldo', 
    'agbtonho@gmail.com', 
    'agb', 
    '123', 
    '(31) 99875-1653', 
    '034.743.236-01', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4238184, 
    'Pillsr Gama', 
    'pgamaproducao@gmail.com', 
    'pillar', 
    '123', 
    '(21) 96995-3811', 
    '121.268.137-11', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5723360, 
    'José Sebastião aves brito', 
    'tiao.brito@hotmail.com', 
    'tiao', 
    '123', 
    '(41) 98879-5660', 
    '468.430.355-15', 
    'fernanda pereira dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2924655, 
    'Leonel Rodrigues', 
    'plenitudebr@yahoo.com.br', 
    'top7', 
    '123', 
    '(21) 96652-4226', 
    '022.520.677-30', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6772420, 
    'Joel Almeida Lara', 
    'almeidajoellara1366@gmail.com', 
    'lara', 
    '123', 
    '(41) 99952-9972', 
    '583.914.109-78', 
    'Jean Farias', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8678750, 
    'Sidney Cunha', 
    'sidneycunha5@gmail.com', 
    'sidney', 
    '123', 
    '(41) 98526-4025', 
    '031.855.869-64', 
    'jose costa dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7370660, 
    'Myrna Lorena Celste Wilson', 
    'mbalika.wilson@gmail.com', 
    'mbalikasaudeebemestar', 
    '123', 
    '(25) 84257-0075', 
    '069.097.130-36', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5725195, 
    'Oséias Soares pinto', 
    'oseiassoares786@gmail.com', 
    'oseias3420', 
    '123', 
    '(69) 99931-5607', 
    '183.819.818-08', 
    'Luiz Queiroz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6781757, 
    'Lucimari Oliveira', 
    'sucessoslu@gmail.com', 
    'aguiafenix', 
    '123', 
    '(54) 99692-2008', 
    '721.345.770-53', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4740024, 
    'Odair Luna', 
    '1odairluna@gmail.com', 
    'odairluna', 
    '123', 
    '(83) 98664-9576', 
    '001.234.384-62', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5994738, 
    'Geiza Rodrigues santos', 
    'rodriguesantosmb@gmail.com', 
    'geizars', 
    '123', 
    '(73) 99135-9256', 
    '044.960.395-40', 
    'Tiago Santos Miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8618916, 
    'José Carlos', 
    'hidroeletricaguarituba@gmail.com', 
    'josecarlos', 
    '123', 
    '(41) 98482-2913', 
    '342.328.850-72', 
    'joao vicente jordao', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1460404, 
    'Fabiano Guizoni', 
    'fabiano.rodozoni@gmail.com', 
    'luvi', 
    '123', 
    '(48) 99972-3120', 
    '020.127.889-80', 
    'Lucimari Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0327483, 
    'Joziel Conceição da silva', 
    'jozielsilva2016@gmail.com', 
    'jozielsilva', 
    '123', 
    '(18) 99722-9824', 
    '003.784.771-61', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4215356, 
    'Valter dos Santos nascimento', 
    'lapiduzsgsfamily@gmail.com', 
    'lapiduz', 
    '123', 
    '(79) 98162-0185', 
    '661.784.525-00', 
    'Tiago Santos Miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2921457, 
    'Edner Guimarães de Andrade', 
    'ednerguimaraes744@gmail.com', 
    'ednerandrade', 
    '123', 
    '(52) 99405-9268', 
    '002.777.060-50', 
    'Tiago Santos Miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5775405, 
    'Jorgenei Mendes da Silva', 
    'jorgenei_ac@hotmail.com', 
    'viversaude', 
    '123', 
    '(68) 99923-4766', 
    '830.315.102-91', 
    'Tiago Santos Miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5155032, 
    'Silvia Terezinha de Almeida', 
    'silviade.almeida@hotmail.com', 
    'silvia', 
    '123', 
    '(41) 99794-5766', 
    '655.114.259-15', 
    'Alaor Garcia da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2432273, 
    'Denilson Souza de lima', 
    'denilson_sdl@hotmail.com', 
    'denilson', 
    '123', 
    '(69) 99281-4901', 
    '781.456.942-72', 
    'Luiz Queiroz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7987183, 
    'JORGE HENRIQUE NUNES DE OLIVEIRA', 
    'jorgeoliveiradiamante@gmail.com', 
    'sucessofb', 
    '123', 
    '(46) 98832-8314', 
    '159.138.208-43', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6447640, 
    'CLAUDIA SUZANE BRUM', 
    'claudiabrum2022@gmail.com', 
    'cbrum', 
    '123', 
    '(46) 98833-0677', 
    '934.287.239-53', 
    'JORGE HENRIQUE NUNES DE OLIVEIRA', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9891921, 
    'Claudenir Augusto da Silva', 
    'claudenir01augusto@gmail.com', 
    'claudenir01', 
    '123', 
    '(41) 98501-6462', 
    '028.631.069-45', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6315565, 
    'Hamilton José da Rosa zorzenao', 
    'hamiltonjosedarosa1@gmail.com', 
    'hamiltonrosa1', 
    '123', 
    '(41) 99927-5549', 
    '163.479.490-75', 
    'Alaor Garcia da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4839474, 
    'Maura Rodrigues da Silva ermelino', 
    'maurarodrigues05@gmail.com', 
    'maura', 
    '123', 
    '(16) 99795-2021', 
    '611.373.249-53', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6762842, 
    'Firmino Figueiredo dos Santos', 
    'firminofigueredo.1952@gmail.com', 
    'firmino', 
    '123', 
    '(11) 96848-8986', 
    '698.843.408-97', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5689732, 
    'Cassio Natel', 
    'cassio_cocha@outlook.com', 
    'cassio', 
    '123', 
    '(41) 99693-1420', 
    '080.553.169-61', 
    'Jose Maria Figueiredo dos Santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7987614, 
    'Willer Batista', 
    'willergrupo@gmail.com', 
    'willer', 
    '123', 
    '(11) 98430-1310', 
    '387.840.138-85', 
    'Tiago Santos Miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1847928, 
    'Jocelito Carvalho do Prado', 
    '00000000000000000000@gmail.co', 
    'jocelito1', 
    '123', 
    '(41) 99885-0147', 
    '913.509.210-68', 
    'Hamilton José da Rosa zorzenao', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5423761, 
    'ernani lima pereira', 
    'ernanilimapereira@gmail.com', 
    'ernani', 
    '123', 
    '(41) 99605-4609', 
    '392.642.629-20', 
    'Alaor Garcia da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8116281, 
    'Aparicio Monteiro', 
    'amf.monteiro79@gmail.com', 
    'monteiro', 
    '123', 
    '(41) 98428-3496', 
    '542.404.259-72', 
    'ernani lima pereira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1501765, 
    'Rubens Solarevicz', 
    'rubvicz4.0@gmail.com', 
    'rubvicz', 
    '123', 
    '(41) 92001-4247', 
    '696.698.809-04', 
    'ernani lima pereira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3922646, 
    'Thais Alves', 
    'tha.alves29@gmail.com', 
    'thaisalves', 
    '123', 
    '(41) 98523-5614', 
    '091.368.389-26', 
    'ingrid padilha miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4105529, 
    'Jose Carlos messias dos santos', 
    'jc5559884@gmail.com', 
    'josemessias', 
    '123', 
    '(42) 99903-2427', 
    '572.046.169-87', 
    'jose costa dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0747015, 
    'pedro paulista prado', 
    'pedropopo@gmail.com', 
    'pedrop', 
    '123', 
    '(41) 99711-0755', 
    '836.346.900-97', 
    'Jose Carlos messias dos santos', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9376969, 
    'Pedro de sousa barros', 
    'pedro.sousabarros01@gmail.com', 
    'pedrosb', 
    '123', 
    '(69) 99967-6344', 
    '799.953.812-49', 
    'Tiago Santos Miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6800588, 
    'Hamilton José da Rosa zorzenao', 
    'hamiltonjosedarosa@gmail.com', 
    'hamiltonrosa', 
    '123', 
    '(41) 99927-5549', 
    '787.407.209-00', 
    'Geraldo renato Alves de solza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2194531, 
    'Rogerio Tavares da Veiga', 
    'educacionalsaber1@gmail.com', 
    'rogeriotavares', 
    '123', 
    '(41) 92002-6324', 
    '922.325.079-04', 
    'Hamilton José da Rosa zorzenao', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9364671, 
    'Alciones luis Rissardi', 
    'alcioneslrissardi@gmail.com', 
    'alcionesrissardi', 
    '123', 
    '(41) 99984-6768', 
    '855.210.869-00', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2687833, 
    'Romualdo Bezerra da Silva', 
    'silvaspz14@gmail.com', 
    'ronespz', 
    '123', 
    '(65) 99212-8101', 
    '692.677.311-49', 
    'mauricio pereira de carvalho', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9425156, 
    'Alirio Moro', 
    'aliriomoro05@gmail.com', 
    'morospzmt', 
    '123', 
    '(65) 99623-6323', 
    '752.505.519-04', 
    'Romualdo Bezerra da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6767246, 
    'Manoel Matos Oliveira', 
    'manoel00oliveira@gmail.com', 
    'manoel551', 
    '123', 
    '(68) 99938-8223', 
    '912.205.562-20', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7727600, 
    'Sara Bezerra da Silva', 
    'silvaspz12@gmail.com', 
    'silvaspz', 
    '123', 
    '(65) 93300-5428', 
    '061.143.301-02', 
    'Romualdo Bezerra da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7967528, 
    'José jose Rodrigues', 
    'gerin1231414@gmail.com', 
    'jmrodrigues', 
    '123', 
    '(33) 33333-3333', 
    '459.641.210-39', 
    'Willer Batista', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4727953, 
    'Maria José Santos de Ávila', 
    'roneb.bezerra@gmail.com', 
    'mariaspz', 
    '123', 
    '(65) 99670-0011', 
    '168.358.478-32', 
    'Alirio Moro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5190852, 
    'Everton Magnus Cardoso', 
    'tiffanycardoso2011@gmail.com', 
    'everton', 
    '123', 
    '(51) 99526-6029', 
    '012.885.500-22', 
    'Manoel Matos Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7557243, 
    'Helida Alves Farias', 
    'h.alvesfarias@gmail.com', 
    'helida', 
    '123', 
    '(41) 99279-0234', 
    '014.288.171-66', 
    'Érica Farias de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7308989, 
    'Luciano Lopes Sena', 
    'senadigital2020@gmail.com', 
    'lucianosena', 
    '123', 
    '(11) 99399-7863', 
    '164.571.848-47', 
    'Tiago Santos Miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5281789, 
    'Andreia Pacheco da Silva', 
    'pachecoandreiadasilva7878@gmail.com', 
    '5a9h2n9c3', 
    '123', 
    '(24) 99933-8024', 
    '082.906.237-80', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0264132, 
    'Paola Emanuelle Figueiredo', 
    'paola.emanuelle.gmm@gmail.com', 
    'paola2205', 
    '123', 
    '(41) 98777-0471', 
    '053.723.389-03', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0478629, 
    'Urbano Barreto', 
    'urbano.issqn@gmail.com', 
    'barreto', 
    '123', 
    '(85) 99435-5067', 
    '046.690.611-00', 
    'Emanoel Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9316505, 
    'Josué Cabral da Luz', 
    'cabraldaluz04@gmail.com', 
    'cabral', 
    '123', 
    '(41) 99904-8097', 
    '717.508.519-20', 
    'ernani lima pereira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4596438, 
    'Odenir Paulo de Oliveira', 
    'comunidadeplenoser@gmail.com', 
    'denisoliveira', 
    '123', 
    '(41) 99801-9089', 
    '964.138.409-00', 
    'ernani lima pereira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0719223, 
    'Marcos Da Silva', 
    'marcoslsilva85@gmail.com', 
    'marquin', 
    '123', 
    '(55) 99985-1378', 
    '815.827.300-91', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0016527, 
    'Gledison Roberto', 
    'gledisonroberto@hotmail.com', 
    'gledison', 
    '123', 
    '(69) 98501-9581', 
    '759.813.432-49', 
    'mauricio pereira de carvalho', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7683321, 
    'Ezequiel Alves da Fonseca', 
    'ezequielbingofonseca@gmail.com', 
    'ezequielfonseca', 
    '123', 
    '(84) 98717-8238', 
    '034.435.804-67', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7877785, 
    'Chagas pinto', 
    'fc321247@gmail.com', 
    'chagas.com', 
    '123', 
    '(93) 99174-5424', 
    '231.868.102-30', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5127583, 
    'carlos gomes cavalcante', 
    'gomescavalcantecarlos13@gmail.com', 
    'carlos', 
    '123', 
    '(44) 98426-1602', 
    '784.384.899-15', 
    'João Alves Algarrão', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5791006, 
    'Jardel Rubem Gaioso Carneiro', 
    'sucesso.foco@gmail.com', 
    'lojaonline', 
    '123', 
    '(84) 99977-4249', 
    '780.759.044-00', 
    'Tiago Santos Miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3060979, 
    'João Nazaré do Socorro Ferreira', 
    'joaonazareferreira1@gmail.com', 
    'compreaqui', 
    '123', 
    '(84) 99636-3686', 
    '133.654.792-87', 
    'Jardel Rubem Gaioso Carneiro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2281656, 
    'José Rene Lira de Queiroz', 
    'renelineker@gmail.com', 
    'maissaude', 
    '123', 
    '(84) 99636-4647', 
    '009.648.264-88', 
    'Jardel Rubem Gaioso Carneiro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8044065, 
    'Antônio Marcos Costa', 
    'mmnamcjp@gmail.com', 
    'antoniomarcos', 
    '123', 
    '(84) 99406-4801', 
    '031.635.774-07', 
    'João Nazaré do Socorro Ferreira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1977768, 
    'Osmar pererira de godoy', 
    'osmarpereriradegodoy@gmail.com', 
    'godoy', 
    '123', 
    '(41) 99928-4292', 
    '008.826.088-78', 
    'joao vicente jordao', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9113238, 
    'Emanuel Davi', 
    'emanuelscheidt20@gmail.com', 
    'emanuel', 
    '123', 
    '(41) 99746-9138', 
    '062.593.149-14', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0172896, 
    'Mauro Bellinel', 
    'maurobellinelo925@outlook.com', 
    'mauro', 
    '123', 
    '(41) 98867-0476', 
    '876.048.339-34', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4739150, 
    'Lediane Gonçalves santos', 
    'leydy7408@gmail.com', 
    'leydy10', 
    '123', 
    '(73) 99815-8555', 
    '237.341.148-29', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9302092, 
    'Izaac Pinheiro da Silva Filho', 
    'izaacsilvafilho@gmail.com', 
    'mrpinheiro', 
    '123', 
    '(41) 99543-6895', 
    '444.488.302-25', 
    'Manoel Domingos Bruno da Silva', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9035882, 
    'Luis Fernando Ilário Rodrigues', 
    'daviluisfernando0@gmail.com', 
    'luis', 
    '123', 
    '(41) 9940-9533', 
    '082.206.589-40', 
    'Érica Farias de Araújo', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    0651671, 
    'Wagner Oliveira', 
    'wagneroliversilva8119@gmail.com', 
    'wagner01', 
    '123', 
    '(92) 98464-8221', 
    '705.650.312-87', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7446304, 
    'Abismael Belo', 
    'abismaelnivel58@gmail.com', 
    'abisamgela', 
    '123', 
    '(81) 98485-1962', 
    '394.419.974-04', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4705288, 
    'José Marcio', 
    'rsrodriguesinbox@gmail.com', 
    'xtnzjob', 
    '123', 
    '(35) 08446-8307', 
    '839.152.066-87', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6961338, 
    'Salvador  dos Reus', 
    'salvareis27@gmail.com', 
    'reidosul', 
    '123', 
    '(41) 98420-0543', 
    '468.969.969-00', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    7756586, 
    'Alisson Breno Ribeiro', 
    'brenoalisson718@gmail.com', 
    'alisson', 
    '123', 
    '(55) 41966-4989', 
    '122.978.899-92', 
    'celso lopes da rosa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5470981, 
    'Helenice Moreno de Oliveira', 
    'helenice.moreno@gmail.com', 
    'segredodasaude', 
    '123', 
    '(67) 99648-9350', 
    '146.901.188-33', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1081172, 
    'Francisco das chagas Pereira Araujo', 
    'franciscoaraujoa77@gmail.com', 
    'diamante', 
    '123', 
    '(94) 98432-1531', 
    '064.776.333-88', 
    'RS Prólipsi Empresa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5997730, 
    'Mauricio Martins Viana', 
    'vianamauricio1@hotmail.com', 
    'viana', 
    '123', 
    '(41) 98883-9310', 
    '336.579.129-91', 
    'Rubens Solarevicz', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6386735, 
    'Rozangela Bodi Santana', 
    'zanja0784@gmail.com', 
    'rozangela0784', 
    '123', 
    '(41) 99667-2701', 
    '063.401.899-03', 
    'leonina silva dias', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4751043, 
    'Sonia Maria de Carvalho', 
    'soniamarianioaque@gmail.com', 
    'produtosnaturais', 
    '123', 
    '(67) 98222-4914', 
    '202.244.351-91', 
    'Helenice Moreno de Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1694875, 
    'Nara Timm Vianna', 
    'casa.artcor@gmail.com', 
    'nararejanetimmvianna', 
    '123', 
    '(51) 99813-2992', 
    '593.042.780-15', 
    'Helenice Moreno de Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8571710, 
    'Andréia Bigas de lima', 
    'bigassantos@gmail.com', 
    'deiasaude', 
    '123', 
    '(67) 99910-6595', 
    '613.582.401-59', 
    'Helenice Moreno de Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3446858, 
    'Izaías Vieira Costa', 
    'izaiascosta1971@gmail.com', 
    'saudenatural', 
    '123', 
    '(11) 99765-4465', 
    '106.526.228-01', 
    'Helenice Moreno de Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3540357, 
    'Rosineia Aparecida Rodrigues', 
    'rosineiarodrigues82@gmail.com', 
    'rosi', 
    '123', 
    '(41) 98533-4658', 
    '041.128.039-23', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8754330, 
    'Jose Vidal', 
    'vijosegilberto693@gmail.com', 
    'jose153830', 
    '123', 
    '(44) 99818-1644', 
    '607.501.899-91', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6472348, 
    'Nagila Marques Martins de Souza', 
    'nagilamarquesmartins@gmail.com', 
    'nagilamarques', 
    '123', 
    '(11) 95551-4905', 
    '215.918.808-58', 
    'Helenice Moreno de Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9053548, 
    'Sergio Filgueiras magalhaes', 
    'sergiomontanhasfm@gmail.com', 
    'sergio124588', 
    '123', 
    '(81) 98631-8565', 
    '866.386.704-25', 
    'Emanuel Mendes Claro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5109565, 
    'anderson fabre', 
    'loppnowdayane@gmail.com', 
    'anderson2025', 
    '123', 
    '(41) 98443-4629', 
    '037.745.829-55', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    3591780, 
    'Maria Sarmento', 
    'josianesarmento1984@gmail.com', 
    'mariasarmento', 
    '123', 
    '(91) 98988-7451', 
    '808.196.482-72', 
    'Amelia Oliveira Ribeiro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6466954, 
    'Analia Silvana Marques Martins', 
    'analiasilvanamarquesmartins@gmail.com', 
    'analiamarques', 
    '123', 
    '(67) 98126-8700', 
    '000.636.971-57', 
    'Nagila Marques Martins de Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5880433, 
    'Jaira Marques de Oliveira', 
    'nagilaentremaressp@hotmail.com.br', 
    'jaira', 
    '123', 
    '(11) 93207-0352', 
    '321.602.831-34', 
    'Nagila Marques Martins de Souza', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8440910, 
    'Israel Santana', 
    'prisraelsantana23@gmail.com', 
    'santana93', 
    '123', 
    '(38) 99824-2577', 
    '518.261.945-68', 
    'Michael De Araújo Medeiros', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8672866, 
    'Vital érg -- Corporation --', 
    'elizeucasella31@gmail.com', 
    'elizeucasella', 
    '123', 
    '(41) 99573-7428', 
    '545.012.539-91', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9683739, 
    'Murilo Henrique Amaral Vieira', 
    'murilohvieira22@gmail.com', 
    'murilov', 
    '123', 
    '(41) 99892-9259', 
    '125.572.739-02', 
    'Ewerton camargo simer', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2384842, 
    'Gilmara dos santos de lima', 
    'gilmaralimasa77@gmail.com', 
    'gilmara', 
    '123', 
    '(41) 98501-4353', 
    '036.796.779-01', 
    'Murilo Henrique Amaral Vieira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4683823, 
    'Jhulia Almeida', 
    'jhuliaalmeida.s@icloud.com', 
    'jhulia', 
    '123', 
    '(67) 99971-3806', 
    '058.640.961-05', 
    'Helenice Moreno de Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    5782294, 
    'Maria Alice Pimentel', 
    'alice_splender@hotmail.com', 
    'maria2025', 
    '123', 
    '(47) 99102-7895', 
    '018.960.449-21', 
    'Murilo Henrique Amaral Vieira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    8529625, 
    'Nivaldo Estevão', 
    'nivaldo.ne17@gmail.com', 
    'nivaldo123', 
    '123', 
    '(67) 99623-8618', 
    '372.767.191-20', 
    'Helenice Moreno de Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    9677719, 
    'Adelir Roberto', 
    'linaagabriele@gmail.com', 
    'adelir', 
    '123', 
    '(43) 99980-4576', 
    '798.246.179-49', 
    'adilson fernandes borges', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2680829, 
    'Lilian De Jesus', 
    'lilianbessadejesus2022@gmail.com', 
    'liliandejesus', 
    '123', 
    '(47) 99627-0997', 
    '636.017.292-53', 
    'Amelia Oliveira Ribeiro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6063979, 
    'pablo douglas', 
    '608706@prof.sed.sc.gov.br', 
    'pablodejesus', 
    '123', 
    '(47) 99730-7409', 
    '770.694.392-53', 
    'Amelia Oliveira Ribeiro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1180209, 
    'Valdival Ribeiro Braga', 
    'waldiribeiro45@gmail.com', 
    'valdibraga', 
    '123', 
    '(91) 99166-4646', 
    '332.639.572-87', 
    'Amelia Oliveira Ribeiro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    4897389, 
    'Sonia Maria Pantosa', 
    'soniamariapantosa@gmail.com', 
    'sonia123', 
    '123', 
    '(67) 98437-6054', 
    '511.958.281-87', 
    'Helenice Moreno de Oliveira', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    6347068, 
    'daniel sa', 
    'danielsamanjutencoes@gmail.com', 
    'danielsa', 
    '123', 
    '(41) 99599-8232', 
    '630.106.589-15', 
    'joão josé oliveira miranda', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    2238387, 
    'Maria Aparecida da Silva Cordeiro', 
    'cida4218285@hotmail.com', 
    'cidams2025', 
    '123', 
    '(67) 99928-6820', 
    '286.728.951-34', 
    'Izaías Vieira Costa', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

INSERT INTO consultants (id, nome, email, username, senha, telefone, cpf, indicador, created_at, active)
VALUES (
    1668096, 
    'nilza coelho', 
    'nylza.c@hotmail.com', 
    'nilza', 
    '123', 
    '(67) 98101-9796', 
    '404.597.211-00', 
    'Maria Aparecida da Silva Cordeiro', 
    NOW(), 
    true
)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    indicador = EXCLUDED.indicador,
    active = EXCLUDED.active;

COMMIT;
