-- ============================================================
-- CADASTRO EM MASSA - REDE RS PRÓLIPSI
-- Total: 379 consultores
-- Gerado em: 09/12/2025, 10:34:33
-- ============================================================

-- 1. RS Prólipsi (ID: 7838667, Username: user7838667, Indicador: admin)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7838667, 'RS Prólipsi', 'robertorjbc@gmail.com', 'user7838667', '7838667', 'RSqi5iia', 'admin', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Emanuel Mendes Claro (ID: 9772169, Username: emclaro, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9772169, 'Emanuel Mendes Claro', 'emclaro@hotmail.com', 'emclaro', '9772169', 'RSo7i2el', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. maxwel santos (ID: 5519519, Username: maxwel, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5519519, 'maxwel santos', 'sefanpitaquara@gmail.com', 'maxwel', '5519519', 'RSdj3nn4', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Joana Alcina Rodrigues Castro Mendes Claro (ID: 5485192, Username: joanamendes, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5485192, 'Joana Alcina Rodrigues Castro Mendes Claro', 'maeediully@gmail.com', 'joanamendes', '5485192', 'RSrh75io', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. joão josé oliveira miranda (ID: 4328739, Username: miranda, Indicador: maxwel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4328739, 'joão josé oliveira miranda', 'joaomiranda2011@live.com', 'miranda', '4328739', 'RS76vi7q', 'maxwel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Michael De Araújo Medeiros (ID: 193789, Username: michael, Indicador: maxwel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (193789, 'Michael De Araújo Medeiros', 'michaelaraujo979980@gmail.com', 'michael', '193789', 'RSj82azh', 'maxwel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. José Luiz de Souza (ID: 4656279, Username: jose, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4656279, 'José Luiz de Souza', 'joseluiz262@gmail.com', 'jose', '4656279', 'RS2de6nt', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. celso lopes da rosa (ID: 6819895, Username: celso, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6819895, 'celso lopes da rosa', 'celsolopes02622@gmail.com', 'celso', '6819895', 'RSqyyr0r', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 9. Alaor Garcia da Silva (ID: 1889291, Username: alaor, Indicador: celso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1889291, 'Alaor Garcia da Silva', 'alaorgarcia68@gmail.com', 'alaor', '1889291', 'RSn5obza', 'celso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. fabíola francisco luiz (ID: 9281850, Username: fabiola, Indicador: jose)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9281850, 'fabíola francisco luiz', 'fabiolaoliveira007@gmail.com', 'fabiola', '9281850', 'RSit6u8m', 'jose', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 11. laudenice da silva (ID: 8277490, Username: nice, Indicador: fabiola)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8277490, 'laudenice da silva', 'silvalaudenice5@gmail.com', 'nice', '8277490', 'RSautn1i', 'fabiola', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 12. mauricio pereira de carvalho (ID: 6264927, Username: mauricio, Indicador: celso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6264927, 'mauricio pereira de carvalho', 'mauriciopinturas51@gmail.com', 'mauricio', '6264927', 'RS5fjm10', 'celso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 13. Fabiano Moreira (ID: 6269938, Username: fabianomoreira, Indicador: alaor)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6269938, 'Fabiano Moreira', 'binhofm.moreira@gmail.com', 'fabianomoreira', '6269938', 'RSso181s', 'alaor', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 14. Oseias Silva (ID: 4812810, Username: oseiasrs, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4812810, 'Oseias Silva', 'montagensdemoveis2022@gmail.com', 'oseiasrs', '4812810', 'RSoh6vqh', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 15. jose costa dos santos (ID: 1194111, Username: zequinha, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1194111, 'jose costa dos santos', 'josebovespa@gmail.com', 'zequinha', '1194111', 'RS06263f', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 16. zilda pereia dos santos (ID: 1319340, Username: zilda, Indicador: zequinha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1319340, 'zilda pereia dos santos', 'zildapdoss@gmail.com', 'zilda', '1319340', 'RSfie96m', 'zequinha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 17. leonina silva dias (ID: 4027616, Username: leonina, Indicador: zilda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4027616, 'leonina silva dias', 'silvadiasleonina@gmail.com', 'leonina', '4027616', 'RS3u3tbk', 'zilda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 18. joziana pereira dos santos (ID: 1925021, Username: jozi, Indicador: zilda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1925021, 'joziana pereira dos santos', 'jozi.santos229@gmail.com', 'jozi', '1925021', 'RS5pzpg3', 'zilda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 19. silso pereira da silva (ID: 2259260, Username: silso, Indicador: zequinha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2259260, 'silso pereira da silva', 'silso.pereira694@gmail.com', 'silso', '2259260', 'RS12w1r2', 'zequinha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 20. cleuci costa do santos (ID: 7706031, Username: cleuci, Indicador: jozi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7706031, 'cleuci costa do santos', 'cleuccisantos@gmail.com', 'cleuci', '7706031', 'RSb1agv2', 'jozi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 21. joci costa dos santos (ID: 853700, Username: joci, Indicador: cleuci)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (853700, 'joci costa dos santos', 'santosjocicosta@gmail.com', 'joci', '853700', 'RS2bop51', 'cleuci', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 22. davi gomes (ID: 1812304, Username: davi, Indicador: silso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1812304, 'davi gomes', 'davigomessalao@gmail.com', 'davi', '1812304', 'RSuaffo0', 'silso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 23. ilson daniel de oliveira (ID: 336450, Username: ilson, Indicador: cleuci)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (336450, 'ilson daniel de oliveira', 'danieloliveira15@gmail.com', 'ilson', '336450', 'RSch375c', 'cleuci', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 24. pedro lourival pires de oliveira (ID: 7886870, Username: pedro, Indicador: davi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7886870, 'pedro lourival pires de oliveira', 'pedropingo@gmail.com', 'pedro', '7886870', 'RSjt1v2f', 'davi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 25. paulo de quadros (ID: 6419540, Username: paulo, Indicador: ilson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6419540, 'paulo de quadros', 'paulodequadros594@gmail.com', 'paulo', '6419540', 'RSxybvzn', 'ilson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 26. Olinda pereira dos santos (ID: 1928261, Username: olinda, Indicador: zilda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1928261, 'Olinda pereira dos santos', 'olindapereiradosssantos@gmail.com', 'olinda', '1928261', 'RSt5sl1h', 'zilda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 27. jhonny vasconcelos (ID: 6873657, Username: jhonny, Indicador: maxwel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6873657, 'jhonny vasconcelos', 'jhonnyvasconcelos1005@gmail.com', 'jhonny', '6873657', 'RShuh4n1', 'maxwel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 28. Matheus dorneles medeiros (ID: 9346820, Username: matheus, Indicador: oseiasrs)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9346820, 'Matheus dorneles medeiros', 'matheusdorneles2804@gmail.com', 'matheus', '9346820', 'RSrvcf78', 'oseiasrs', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 29. Thais Alencar Moreira Medeiros (ID: 7720293, Username: thais, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7720293, 'Thais Alencar Moreira Medeiros', 'thaismoreiraalencar@gmail.com', 'thais', '7720293', 'RSqfs2uw', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 30. Laiany Manuela Oliveira de Siqueira (ID: 6684648, Username: laianysiqueira, Indicador: jhonny)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6684648, 'Laiany Manuela Oliveira de Siqueira', 'laianyodiqueira@gmail.com', 'laianysiqueira', '6684648', 'RSeahw3k', 'jhonny', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 31. lucimara aparecida dorneles christen (ID: 9107999, Username: lucimara, Indicador: matheus)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9107999, 'lucimara aparecida dorneles christen', 'lucimarachristen@gmail.com', 'lucimara', '9107999', 'RSdikfbv', 'matheus', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 32. Lucas dorneles medeiros (ID: 2687353, Username: lucas, Indicador: matheus)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2687353, 'Lucas dorneles medeiros', 'lucasdorneles466@gmail.com', 'lucas', '2687353', 'RS28cl0z', 'matheus', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 33. odete aparecida dorneles (ID: 2757118, Username: odete, Indicador: lucas)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2757118, 'odete aparecida dorneles', 'silmaradcamargo@gmail.com', 'odete', '2757118', 'RSk5ukdb', 'lucas', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 34. sidnalva maria bueno camargo (ID: 948317, Username: sidnalva, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (948317, 'sidnalva maria bueno camargo', 'sidnalvambcamargo@gmail.com', 'sidnalva', '948317', 'RS5a9qv8', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 35. maria conceição de souza marques (ID: 3234332, Username: maria, Indicador: sidnalva)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3234332, 'maria conceição de souza marques', 'mariaconceicaomarques8@gmail.com', 'maria', '3234332', 'RSmsbtrw', 'sidnalva', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 36. adilson fernandes borges (ID: 7861792, Username: adilson, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7861792, 'adilson fernandes borges', 'adilsonfernandesborges123@gmail.com', 'adilson', '7861792', 'RSnrw4ya', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 37. Jailton Bispo (ID: 6546972, Username: jailton, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6546972, 'Jailton Bispo', 'jailtonipiau@hotmail.com', 'jailton', '6546972', 'RS9uuoqx', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 38. Maria Julia (ID: 1506629, Username: julia, Indicador: fabiola)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1506629, 'Maria Julia', 'mariajulia18290@gmail.com', 'julia', '1506629', 'RSj7xiu3', 'fabiola', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 39. Luciano Cleiton Miguel (ID: 6921285, Username: maxbrasil, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6921285, 'Luciano Cleiton Miguel', 'trabalhacom.agente@gmail.com', 'maxbrasil', '6921285', 'RStaiivk', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 40. Ewerton camargo simer (ID: 2540577, Username: ewerton, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2540577, 'Ewerton camargo simer', 'ewertonhunter1@gmail.com', 'ewerton', '2540577', 'RSy3hj33', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 41. Maria Machado (ID: 5291669, Username: marialoira, Indicador: fabiola)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5291669, 'Maria Machado', 'marialoira669@gmail.com', 'marialoira', '5291669', 'RSecslrw', 'fabiola', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 42. Eunilde Penteado (ID: 7918637, Username: eunilde, Indicador: fabiola)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7918637, 'Eunilde Penteado', 'eunildepenteado08@gmail.com', 'eunilde', '7918637', 'RSjm56os', 'fabiola', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 43. Regina Paula (ID: 8321472, Username: reginapaula, Indicador: fabiola)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8321472, 'Regina Paula', 'regina_depaula@hotmail.com.br', 'reginapaula', '8321472', 'RSi3jo4y', 'fabiola', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 44. Alex Lourenco (ID: 6420730, Username: leaoalex1, Indicador: maxwel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6420730, 'Alex Lourenco', 'alexlourenco1997@gmail.com', 'leaoalex1', '6420730', 'RSyu28gx', 'maxwel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 45. antonio martins da costa (ID: 9044685, Username: antonio, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9044685, 'antonio martins da costa', 'assiscosta85255@gmail.com', 'antonio', '9044685', 'RSfm6a6r', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 46. charles batista dos santos (ID: 2539833, Username: charles, Indicador: ewerton)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2539833, 'charles batista dos santos', 'charlebatista@gmail.com', 'charles', '2539833', 'RS9iuag8', 'ewerton', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 47. sônia de lima barbosa (ID: 4935966, Username: sonia, Indicador: charles)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4935966, 'sônia de lima barbosa', 'sonia.lima.sl630@gmail.com', 'sonia', '4935966', 'RS4puvdm', 'charles', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 48. Jorge pereira dos santos (ID: 5523698, Username: jorge, Indicador: jose)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5523698, 'Jorge pereira dos santos', 'nutrylifesaude@hotmail.com', 'jorge', '5523698', 'RS6qk7h0', 'jose', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 49. Jose Maria Figueiredo dos Santos (ID: 9411059, Username: josesantos, Indicador: jorge)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9411059, 'Jose Maria Figueiredo dos Santos', 'sanjosemoney@hotmail.com', 'josesantos', '9411059', 'RS0sy9ik', 'jorge', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 50. edson padilha miranda (ID: 9350468, Username: edson, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9350468, 'edson padilha miranda', 'edsonpadilhamiranda051@gmail.com', 'edson', '9350468', 'RShe1b9u', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 51. washington padilha miranda (ID: 3606617, Username: washington, Indicador: edson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3606617, 'washington padilha miranda', 'anonimoone9@gmail.com', 'washington', '3606617', 'RSqzd9kr', 'edson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 52. ingrid padilha miranda (ID: 4872431, Username: ingrid, Indicador: edson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4872431, 'ingrid padilha miranda', 'ooooooo@gmail.com', 'ingrid', '4872431', 'RSzlw1zb', 'edson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 53. jurandir padilha miranda (ID: 7410743, Username: jurandir, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7410743, 'jurandir padilha miranda', 'jurandirpadilhamiranda@gmail.com', 'jurandir', '7410743', 'RSm7ut0p', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 54. wellington padilha miranda (ID: 3203045, Username: wellington, Indicador: jurandir)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3203045, 'wellington padilha miranda', 'wllngtnpdelh@gmail.com', 'wellington', '3203045', 'RSvn66zn', 'jurandir', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 55. francisco josé oliveira miranda (ID: 6333411, Username: francisco, Indicador: jurandir)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6333411, 'francisco josé oliveira miranda', 'mirandafranciscomiranda@gmail.com', 'francisco', '6333411', 'RSblvn2i', 'jurandir', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 56. miguel josé oliveira miranda (ID: 8205825, Username: miguel, Indicador: ingrid)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8205825, 'miguel josé oliveira miranda', 'mirandajose198@gmail.com', 'miguel', '8205825', 'RSl8x6kk', 'ingrid', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 57. zilma dos santos (ID: 64104, Username: zilma, Indicador: ingrid)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (64104, 'zilma dos santos', 'zolossantos89@gmail.com', 'zilma', '64104', 'RS92fqit', 'ingrid', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 58. Leticia De Almeida silva (ID: 1133686, Username: letia, Indicador: jhonny)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1133686, 'Leticia De Almeida silva', 'silvaleticiaalmeida33@gmail.com', 'letia', '1133686', 'RSwqtvvp', 'jhonny', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 59. Mickaela Galhardohormam (ID: 8964699, Username: mickaela, Indicador: laianysiqueira)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8964699, 'Mickaela Galhardohormam', 'hormanmickaela@gmail.com', 'mickaela', '8964699', 'RSeye5my', 'laianysiqueira', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 60. Eliene costa da Silva costa da Silva (ID: 2061844, Username: eliene, Indicador: sidnalva)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2061844, 'Eliene costa da Silva costa da Silva', 'elienecostadasilva057@gmail.com', 'eliene', '2061844', 'RS5ha5xg', 'sidnalva', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 61. luiz carlos ribeiro dos santos (ID: 2632006, Username: luiz, Indicador: mauricio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2632006, 'luiz carlos ribeiro dos santos', 'luiz.freteiroassufologia@hotmail.com', 'luiz', '2632006', 'RSuzrc4f', 'mauricio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 62. carmiele pitombeira lima ferreira (ID: 918012, Username: carmiele, Indicador: eliene)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (918012, 'carmiele pitombeira lima ferreira', 'carmielepitombeira@gmail.com', 'carmiele', '918012', 'RSg7zof7', 'eliene', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 63. aparecido inocencio da silva (ID: 9129517, Username: aparecido, Indicador: carmiele)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9129517, 'aparecido inocencio da silva', 'aparecidoinocenciodasilva@gmail.com', 'aparecido', '9129517', 'RSjsjhk9', 'carmiele', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 64. jose alceu (ID: 4059576, Username: josealceu, Indicador: oseiasrs)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4059576, 'jose alceu', 'josecarmem@gmail.com', 'josealceu', '4059576', 'RSqpwvz6', 'oseiasrs', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 65. hedi wilson claro (ID: 8433321, Username: hedi, Indicador: charles)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8433321, 'hedi wilson claro', 'hediwclaro@hotmail.com', 'hedi', '8433321', 'RSf1hn0i', 'charles', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 66. maria helena bernardo bandeira (ID: 2175053, Username: helena, Indicador: hedi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2175053, 'maria helena bernardo bandeira', 'marieli33@gmail.com', 'helena', '2175053', 'RSp03cxd', 'hedi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 67. fernanda pereira dos santos (ID: 2864629, Username: fernanda, Indicador: ewerton)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2864629, 'fernanda pereira dos santos', 'feranadasomtos@gmail.com', 'fernanda', '2864629', 'RSp3y1eb', 'ewerton', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 68. dineuza josé ferreira pinto (ID: 3203729, Username: dineuza, Indicador: jailton)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3203729, 'dineuza josé ferreira pinto', 'dineuzaferreira123@gmail.com', 'dineuza', '3203729', 'RS7d1hkc', 'jailton', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 69. liliane luciano algostinho (ID: 2999668, Username: liliane, Indicador: ewerton)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2999668, 'liliane luciano algostinho', 'lilianhayr@hotmail.com', 'liliane', '2999668', 'RSpt1j4x', 'ewerton', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 70. elizeu lopes da rosa (ID: 4116969, Username: elizeu, Indicador: celso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4116969, 'elizeu lopes da rosa', 'elizeu.lopesdarosa@gmail.com', 'elizeu', '4116969', 'RStayvit', 'celso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 71. ezaul fabio de mello (ID: 2607383, Username: ezaul, Indicador: elizeu)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2607383, 'ezaul fabio de mello', 'ucafabiomelouca@gmail.com', 'ezaul', '2607383', 'RSimbwyc', 'elizeu', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 72. maria da gloria da silva (ID: 4341825, Username: mariadagloria, Indicador: ezaul)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4341825, 'maria da gloria da silva', 'mariacliente2022@gmail.com', 'mariadagloria', '4341825', 'RSxg6xpp', 'ezaul', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 73. Maria Aparecida de Sousa (ID: 4764164, Username: cida1, Indicador: maxbrasil)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4764164, 'Maria Aparecida de Sousa', 'trabalhacom.max@gmail.com', 'cida1', '4764164', 'RSr7r7d2', 'maxbrasil', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 74. Elivelton Drey (ID: 1218531, Username: elivelton, Indicador: jorge)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1218531, 'Elivelton Drey', 'eliveltondreyoficial@gmail.com', 'elivelton', '1218531', 'RSfhpeam', 'jorge', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 75. edilson santos de jesus (ID: 1332375, Username: edilson, Indicador: jhonny)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1332375, 'edilson santos de jesus', 'agenciamktcomercill@gmail.com', 'edilson', '1332375', 'RStgjpub', 'jhonny', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 76. bismarck padilha miranda (ID: 3894298, Username: bismarck, Indicador: wellington)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3894298, 'bismarck padilha miranda', 'bismarckmiranda9@gmail.com', 'bismarck', '3894298', 'RS600r55', 'wellington', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 77. marlene gonçalves carneiro (ID: 6561608, Username: marlene, Indicador: wellington)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6561608, 'marlene gonçalves carneiro', 'mc6774929@gmail.com', 'marlene', '6561608', 'RS9scjpn', 'wellington', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 78. nilson da cruz (ID: 7684942, Username: nilson, Indicador: adilson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7684942, 'nilson da cruz', 'nilsondacruz575@gmail.com', 'nilson', '7684942', 'RSob0eq2', 'adilson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 79. jose raimundo da silva (ID: 3001694, Username: raimundo, Indicador: adilson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3001694, 'jose raimundo da silva', 'josejr714528@gmail.com', 'raimundo', '3001694', 'RS9pw1ew', 'adilson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 80. sérgio selatchek (ID: 2532230, Username: sergio, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2532230, 'sérgio selatchek', 'sergioselatchek42@gmail.com', 'sergio', '2532230', 'RS5wazos', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 81. lindalva dos santos (ID: 2953165, Username: lindalva, Indicador: sergio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2953165, 'lindalva dos santos', 'lindinhasarada22@gmail.com', 'lindalva', '2953165', 'RSzrqrfd', 'sergio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 82. lucio latczuc (ID: 4951015, Username: lucio, Indicador: sergio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4951015, 'lucio latczuc', 'luciolactzuck@gmail.com', 'lucio', '4951015', 'RSt876tv', 'sergio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 83. jorge luis da silva (ID: 9960331, Username: jorgeluis, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9960331, 'jorge luis da silva', 'jls14081959@gmail.com', 'jorgeluis', '9960331', 'RSpahl9c', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 84. giseli da silva (ID: 6421118, Username: giseli, Indicador: jorgeluis)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6421118, 'giseli da silva', 'giseleh1118@hotmail.com', 'giseli', '6421118', 'RSf7lve6', 'jorgeluis', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 85. joão acir tinesnski (ID: 945289, Username: joao, Indicador: jorgeluis)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (945289, 'joão acir tinesnski', 'acirjoao9@gmail.com', 'joao', '945289', 'RS8db9xl', 'jorgeluis', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 86. cleomar pontes macedo (ID: 3563935, Username: cleomar, Indicador: washington)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3563935, 'cleomar pontes macedo', 'cleomardofutsal@hotmail.com', 'cleomar', '3563935', 'RS2gzats', 'washington', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 87. ademar roberto boller (ID: 913882, Username: ademar, Indicador: washington)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (913882, 'ademar roberto boller', 'bollerademar@gmail.com', 'ademar', '913882', 'RSlwacog', 'washington', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 88. Virginia Cordeiro de lara (ID: 3542770, Username: vilara, Indicador: jorge)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3542770, 'Virginia Cordeiro de lara', 'virginiacordeirodelara@gmail.com', 'vilara', '3542770', 'RSic29sy', 'jorge', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 89. patricia querino vaz dos santos (ID: 103470, Username: patricia, Indicador: bismarck)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (103470, 'patricia querino vaz dos santos', 'querinopatricia72@gmail.com', 'patricia', '103470', 'RSp99pkr', 'bismarck', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 90. samyr erlom rissardi rocha da silva (ID: 1814489, Username: samyr, Indicador: bismarck)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1814489, 'samyr erlom rissardi rocha da silva', 'samyrsilva@gmail.com', 'samyr', '1814489', 'RSdkg8nu', 'bismarck', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 91. antonio carlos fermino da silva (ID: 2363539, Username: antoniocarlos, Indicador: zilma)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2363539, 'antonio carlos fermino da silva', 'ac30304@gmail.com', 'antoniocarlos', '2363539', 'RSzdh04j', 'zilma', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 92. nível de jesus nantes borges (ID: 1354156, Username: nivel, Indicador: adilson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1354156, 'nível de jesus nantes borges', 'niveadejesus29@gmail.com', 'nivel', '1354156', 'RS6blk82', 'adilson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 93. antônio pereira nantes (ID: 6954522, Username: nantes, Indicador: nivel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6954522, 'antônio pereira nantes', 'antonionantes059@gmail.om', 'nantes', '6954522', 'RSsklma1', 'nivel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 94. maurilei da silva nascimento (ID: 3952322, Username: maurilei, Indicador: zilma)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3952322, 'maurilei da silva nascimento', 'prmaurilei1@gmail.com', 'maurilei', '3952322', 'RS5fjprr', 'zilma', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 95. anderson tolentino dos santos (ID: 7602020, Username: anderson, Indicador: helena)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7602020, 'anderson tolentino dos santos', 'zenaide5219@gmail.com', 'anderson', '7602020', 'RSb7k6i5', 'helena', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 96. maikon vinicius borges (ID: 4747902, Username: maikon, Indicador: helena)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4747902, 'maikon vinicius borges', 'viniciusmaikon883@gmail.com', 'maikon', '4747902', 'RSxfv48n', 'helena', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 97. iracema ferreira de oliveira tinte (ID: 393954, Username: cema, Indicador: lucio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (393954, 'iracema ferreira de oliveira tinte', 'cema.tinte@gmail.com', 'cema', '393954', 'RSy6f2mt', 'lucio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 98. idalina ferreira de oliveira (ID: 5527453, Username: idalina, Indicador: cema)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5527453, 'idalina ferreira de oliveira', 'ferreiraidalina87@gmail.com', 'idalina', '5527453', 'RSpyt023', 'cema', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 99. reginaldo do nascimento santos (ID: 4329558, Username: reginaldo, Indicador: cema)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4329558, 'reginaldo do nascimento santos', 'reginaldodedeus1989@gmail.com', 'reginaldo', '4329558', 'RSucp0pq', 'cema', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 100. maria teresinha da silva (ID: 5826649, Username: mariateresinha, Indicador: lucio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5826649, 'maria teresinha da silva', 'hbrasileiratere@gmail.com', 'mariateresinha', '5826649', 'RSjfmyvt', 'lucio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 101. gerson dos santos de oliveira (ID: 2920187, Username: gerson, Indicador: miguel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2920187, 'gerson dos santos de oliveira', 'gersonsantos@gmail.com', 'gerson', '2920187', 'RSzdk6d1', 'miguel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 102. darla fernanda szymanski (ID: 791825, Username: darla, Indicador: jose)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (791825, 'darla fernanda szymanski', 'darla_szymanski@hotmail.com', 'darla', '791825', 'RS41kben', 'jose', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 103. Rosilda Andrade de souza (ID: 5771074, Username: rosilda, Indicador: nice)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5771074, 'Rosilda Andrade de souza', 'brendasantos6297@gmail.com', 'rosilda', '5771074', 'RSw7qwsk', 'nice', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 104. Danier Siqueira monteiro (ID: 2937609, Username: siqueira, Indicador: jorge)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2937609, 'Danier Siqueira monteiro', 'danielsiqueiramonteiro1960@gmail.com', 'siqueira', '2937609', 'RSeu5eha', 'jorge', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 105. vanda gonçalves ferreira (ID: 3353478, Username: vanda, Indicador: zequinha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3353478, 'vanda gonçalves ferreira', 'vandicactba@gmail.com', 'vanda', '3353478', 'RSc8yp0x', 'zequinha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 106. valdir roberto scheffelmeier (ID: 1720237, Username: valdir, Indicador: vanda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1720237, 'valdir roberto scheffelmeier', 'vscheffelmeier@gmail.com', 'valdir', '1720237', 'RSm995r5', 'vanda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 107. carlos ribeiro de andrade (ID: 2160803, Username: carlosribeiro, Indicador: davi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2160803, 'carlos ribeiro de andrade', 'carlosrandrade0703@gmail.com', 'carlosribeiro', '2160803', 'RSwp7n8v', 'davi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 108. claudinei spindola (ID: 7191506, Username: claudinei, Indicador: silso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7191506, 'claudinei spindola', 'nunonogueiro@gmail.com', 'claudinei', '7191506', 'RShna0d0', 'silso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 109. jose ani cezar correia (ID: 2130334, Username: anicezar, Indicador: claudinei)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2130334, 'jose ani cezar correia', 'joseanicezar047@gmail.com', 'anicezar', '2130334', 'RSelt34e', 'claudinei', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 110. israel fernandes de oliveira (ID: 8131425, Username: israel, Indicador: sidnalva)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8131425, 'israel fernandes de oliveira', 'israeloliveira401981@gmail.com', 'israel', '8131425', 'RSmjvqyg', 'sidnalva', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 111. Geraldo renato Alves de solza (ID: 1795663, Username: renato, Indicador: sidnalva)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1795663, 'Geraldo renato Alves de solza', 'gasrenato@gmail.com', 'renato', '1795663', 'RSt7ipxi', 'sidnalva', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 112. Gilmar neves de campos (ID: 4111550, Username: gilmar10, Indicador: alaor)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4111550, 'Gilmar neves de campos', 'gilmarnevesdecampos2019@gmail.com', 'gilmar10', '4111550', 'RS8nzpyr', 'alaor', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 113. Salete Freitas Farias Lourenço (ID: 5636653, Username: salete, Indicador: nice)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5636653, 'Salete Freitas Farias Lourenço', 'saletefreitas.4321@gmail.com', 'salete', '5636653', 'RSxy3u62', 'nice', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 114. simone de jesus lopes (ID: 6563838, Username: simone, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6563838, 'simone de jesus lopes', 'shiminho100@gmail.com', 'simone', '6563838', 'RS0tfekf', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 115. josé valdeci lopes (ID: 7354951, Username: valdecir, Indicador: simone)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7354951, 'josé valdeci lopes', 'josevaldecilopes71@gmail.com', 'valdecir', '7354951', 'RSbtwsud', 'simone', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 116. Márcia Velozo (ID: 8332954, Username: marciavelozo, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8332954, 'Márcia Velozo', 'vendermais369@gmail.com', 'marciavelozo', '8332954', 'RSlsa9gz', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 117. Fabio Bomfim (ID: 4209211, Username: fabio, Indicador: jorge)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4209211, 'Fabio Bomfim', 'smartbinhoo@hotmail.com', 'fabio', '4209211', 'RSgpy96e', 'jorge', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 118. Dalmon Pereira dos Santos (ID: 6349551, Username: dalmonsantos, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6349551, 'Dalmon Pereira dos Santos', 'dalmon.santos@hotmail.com', 'dalmonsantos', '6349551', 'RSbe2fzi', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 119. Sara Monteiro (ID: 7767970, Username: saritinha123, Indicador: fabio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7767970, 'Sara Monteiro', 'saramonteiro.pedagogia@gmail.com', 'saritinha123', '7767970', 'RSb4z3ys', 'fabio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 120. Joaquim Bomfim (ID: 5755920, Username: joaquim, Indicador: fabio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5755920, 'Joaquim Bomfim', 'joaquimbomfim2019@gmail.com', 'joaquim', '5755920', 'RS2n014q', 'fabio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 121. Andiara Correia (ID: 7258740, Username: andy, Indicador: fabio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7258740, 'Andiara Correia', 'andy.correia@yahoo.com.br', 'andy', '7258740', 'RS1lux8w', 'fabio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 122. Rosely Monteiro (ID: 5161089, Username: rosely, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5161089, 'Rosely Monteiro', 'silvarosely555@gmail.com', 'rosely', '5161089', 'RS4npbav', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 123. sebastiao manuel gonçalves (ID: 9415789, Username: sebastiao, Indicador: darla)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9415789, 'sebastiao manuel gonçalves', 'sebastiaogoncalvespresidente@gmail.com', 'sebastiao', '9415789', 'RSylh9a7', 'darla', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 124. jair da silva fernandes (ID: 6802441, Username: jair, Indicador: darla)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6802441, 'jair da silva fernandes', 'calhasevidroscastelo@gmail.com', 'jair', '6802441', 'RSc5yyrd', 'darla', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 125. emerson gomes lemes (ID: 9604483, Username: emerson, Indicador: jair)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9604483, 'emerson gomes lemes', 'emersonglemes@hotmail.com', 'emerson', '9604483', 'RS4zglfc', 'jair', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 126. jose ronaldo da silva agiar (ID: 7111285, Username: agiar, Indicador: sebastiao)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7111285, 'jose ronaldo da silva agiar', 'jragiar.sil@gmail.com', 'agiar', '7111285', 'RSjfhb4q', 'sebastiao', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 127. ezequiel moreira (ID: 2693309, Username: ezequiel, Indicador: agiar)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2693309, 'ezequiel moreira', 'ezequielmoreira29012008@gmail.com', 'ezequiel', '2693309', 'RSvru79k', 'agiar', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 128. gilda rosa da silva (ID: 839070, Username: gilda, Indicador: ezequiel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (839070, 'gilda rosa da silva', 'gildarosadasilva33@gmail.com', 'gilda', '839070', 'RSsm5bl9', 'ezequiel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 129. Maria Conceição Batista Figueiredo (ID: 5834604, Username: mariaconceicao, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5834604, 'Maria Conceição Batista Figueiredo', 'mariafiguereido91@gmail.com', 'mariaconceicao', '5834604', 'RSapumpd', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 130. Jhonatan Henrique da silva (ID: 6296512, Username: jhonatan, Indicador: jhonny)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6296512, 'Jhonatan Henrique da silva', 'jhonantanhenrique297@gmail.com', 'jhonatan', '6296512', 'RSbdfsv5', 'jhonny', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 131. Neusa De Oliveira Baray (ID: 9232773, Username: neusabry, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9232773, 'Neusa De Oliveira Baray', 'neusabaray.email@gmail.com', 'neusabry', '9232773', 'RSr6f6we', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 132. Maria Madalena Costa (ID: 1595041, Username: madalena, Indicador: neusabry)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1595041, 'Maria Madalena Costa', 'madalenam1956@gmail.com', 'madalena', '1595041', 'RSklwato', 'neusabry', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 133. Vilma Terezinha gomes (ID: 1966950, Username: vilma, Indicador: siqueira)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1966950, 'Vilma Terezinha gomes', 'vilmaterezinha72@gmail.com', 'vilma', '1966950', 'RSpkhmss', 'siqueira', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 134. Marcio Clemente (ID: 4016966, Username: marcinho12, Indicador: jorge)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4016966, 'Marcio Clemente', 'marcio.clemente@yahoo.com.br', 'marcinho12', '4016966', 'RSpxu898', 'jorge', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 135. Marisane Antunes de lima (ID: 9541878, Username: marisane123, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9541878, 'Marisane Antunes de lima', 'marisaneantunes@hotmail.com', 'marisane123', '9541878', 'RS33dcdx', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 136. Érica Farias de Araújo (ID: 240466, Username: erica, Indicador: maxwel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (240466, 'Érica Farias de Araújo', 'ericaf.a01@outlook.com', 'erica', '240466', 'RSwkp11v', 'maxwel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 137. Raffael Richard Rocha (ID: 9916761, Username: rafaelrocha, Indicador: joanamendes)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9916761, 'Raffael Richard Rocha', 'arenared@hotmail.com', 'rafaelrocha', '9916761', 'RSrew6g1', 'joanamendes', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 138. Ezequiel Guimarães (ID: 3417956, Username: ezequielguima, Indicador: rafaelrocha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3417956, 'Ezequiel Guimarães', 'collenguimas@gmail.com', 'ezequielguima', '3417956', 'RSwse4xt', 'rafaelrocha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 139. Arnaldo Rodrigues Figueiredo (ID: 8851832, Username: arnaldo, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8851832, 'Arnaldo Rodrigues Figueiredo', 'rodrigueaarnaldo625@gmail.com', 'arnaldo', '8851832', 'RSgeme53', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 140. murilo luiz dias henrique (ID: 123601, Username: murilolilo, Indicador: topo)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (123601, 'murilo luiz dias henrique', 'murilo.l@grupoeloss.com.br', 'murilolilo', '123601', 'RSswlb9q', 'topo', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 141. Júlio Galvão (ID: 7920234, Username: juliogalvao, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7920234, 'Júlio Galvão', 'julio.adriana.luiz@gmail.com', 'juliogalvao', '7920234', 'RSvqtc8o', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 142. ildefonço ferreira de oliveira (ID: 8520902, Username: afonco, Indicador: erica)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8520902, 'ildefonço ferreira de oliveira', 'aaa@gmail.com', 'afonco', '8520902', 'RSiutiu6', 'erica', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 143. Milena Silva (ID: 2595811, Username: milenasilva, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2595811, 'Milena Silva', 'milenarichene77@gmail.com', 'milenasilva', '2595811', 'RSnv73cn', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 144. Patrike Daniel Pedroso (ID: 1340837, Username: patrike, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1340837, 'Patrike Daniel Pedroso', 'patrikedaniel2@icloud.com', 'patrike', '1340837', 'RSeqofhz', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 145. Diully Einy Rodrigues Castro Mendes Claro (ID: 9794683, Username: diully, Indicador: joanamendes)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9794683, 'Diully Einy Rodrigues Castro Mendes Claro', 'diully-einy@hotmail.com', 'diully', '9794683', 'RS3srj7h', 'joanamendes', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 146. joao vicente jordao (ID: 2640676, Username: vicente, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2640676, 'joao vicente jordao', 'joaovicentejordao@gmail.com', 'vicente', '2640676', 'RSoppd7s', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 147. Rosilene Figueiredo alves (ID: 6747001, Username: rosialves, Indicador: arnaldo)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6747001, 'Rosilene Figueiredo alves', 'rosilenefigueiredoalves@hotmail.com', 'rosialves', '6747001', 'RSktj9a5', 'arnaldo', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 148. Jean Henrique Aparecido da Silva (ID: 287716, Username: jeanhenrique, Indicador: joanamendes)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (287716, 'Jean Henrique Aparecido da Silva', 'diretoriabaraoesilva@gmail.com', 'jeanhenrique', '287716', 'RSgo22r9', 'joanamendes', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 149. Marcio Jakson Soares de Lima (ID: 7372499, Username: marciojj, Indicador: joanamendes)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7372499, 'Marcio Jakson Soares de Lima', 'jjcapas@gmail.com', 'marciojj', '7372499', 'RS9pkn04', 'joanamendes', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 150. Joyce Emile Feitora Rodrigues (ID: 609849, Username: joyce, Indicador: ezequielguima)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (609849, 'Joyce Emile Feitora Rodrigues', 'joyceemile15@hotmail.com', 'joyce', '609849', 'RS5bu12r', 'ezequielguima', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 151. Daniel Ferreira da Silva (ID: 9162624, Username: danielferreira, Indicador: ezequielguima)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9162624, 'Daniel Ferreira da Silva', 'daniel.ferreira.vgt@gmail.com', 'danielferreira', '9162624', 'RSco5zhr', 'ezequielguima', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 152. Ydalmi Josefina Herrera Diaz (ID: 3893104, Username: ydalmi, Indicador: ezequielguima)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3893104, 'Ydalmi Josefina Herrera Diaz', 'ydalmiwork@gmail.com', 'ydalmi', '3893104', 'RSag1f6b', 'ezequielguima', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 153. Arelys Nohemi Herrera (ID: 662793, Username: arelys, Indicador: ezequielguima)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (662793, 'Arelys Nohemi Herrera', 'arelisherreranohemi@gmail.com', 'arelys', '662793', 'RSrd9q1v', 'ezequielguima', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 154. Felipe Pereira Sousa (ID: 6994692, Username: fiii, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6994692, 'Felipe Pereira Sousa', 'fellipe246@gmail.com', 'fiii', '6994692', 'RSt2srs8', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 155. Wild Halama (ID: 2412340, Username: halama1111111111, Indicador: patrike)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2412340, 'Wild Halama', 'halama120121214652@gmail.com', 'halama1111111111', '2412340', 'RSu7ozcu', 'patrike', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 156. Solange Kuhn (ID: 9691030, Username: solangekuhn123, Indicador: marisane123)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9691030, 'Solange Kuhn', 'solangekuhnsmi24@gmail.com', 'solangekuhn123', '9691030', 'RSju7e7x', 'marisane123', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 157. Viviane Cristina da silva (ID: 2637492, Username: vivi10, Indicador: alaor)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2637492, 'Viviane Cristina da silva', 'vicpqna@hotmail.com', 'vivi10', '2637492', 'RS9lr1zb', 'alaor', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 158. Vera Lucia Aparecida Machado de Ramos (ID: 8148133, Username: vera, Indicador: cleuci)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8148133, 'Vera Lucia Aparecida Machado de Ramos', 'veraluciamachado@gmail.com', 'vera', '8148133', 'RS8ov5cb', 'cleuci', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 159. Maria Garcia Guerreiro (ID: 1716620, Username: mariagarcia, Indicador: davi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1716620, 'Maria Garcia Guerreiro', 'mariagarciaguerreiro7@gmail.com', 'mariagarcia', '1716620', 'RSf13arg', 'davi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 160. José risso luiz (ID: 5279317, Username: risso, Indicador: jose)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5279317, 'José risso luiz', 'rissojjlg@hotmail.com', 'risso', '5279317', 'RS1ggm9d', 'jose', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 161. Valdo Nunes de Brito (ID: 8324807, Username: valdo, Indicador: jose)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8324807, 'Valdo Nunes de Brito', 'valdonunesdebrito36@gmail.com', 'valdo', '8324807', 'RSrqbmze', 'jose', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 162. Francine Dias da Conceição Labres de Oliveira (ID: 93208, Username: frandjalo, Indicador: maxwel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (93208, 'Francine Dias da Conceição Labres de Oliveira', 'frandjalo.dias@gmail.com', 'frandjalo', '93208', 'RSwseyey', 'maxwel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 163. Alessandra dos Santos Gobatto (ID: 4087214, Username: alessandra, Indicador: carmiele)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4087214, 'Alessandra dos Santos Gobatto', 'alessandradoss@gmail.com', 'alessandra', '4087214', 'RSlglqc7', 'carmiele', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 164. Pedro Flávio Almeida Silva (ID: 4549644, Username: pedroflavio, Indicador: ewerton)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4549644, 'Pedro Flávio Almeida Silva', 'pedroflavioalmeida777@gmail.com', 'pedroflavio', '4549644', 'RSofn61k', 'ewerton', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 165. Wesley Henrrique (ID: 964320, Username: wesley007, Indicador: israel)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (964320, 'Wesley Henrrique', 'henrriquewesley99@gmail.com', 'wesley007', '964320', 'RS7eeu3y', 'israel', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 166. Geraldo Carvalho Costa (ID: 8918423, Username: geraldo, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8918423, 'Geraldo Carvalho Costa', 'geraldocarvalhocosta1960@gmail.com', 'geraldo', '8918423', 'RSui10a6', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 167. Maria Almeida (ID: 3336809, Username: 123maria, Indicador: pedroflavio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3336809, 'Maria Almeida', 'mariahelenajj1@gmail.com', '123maria', '3336809', 'RSvk8blm', 'pedroflavio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 168. Paulo Kayto de Souza Morgado (ID: 1078961, Username: paulokayto, Indicador: patrike)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1078961, 'Paulo Kayto de Souza Morgado', 'dev.pkayto@gmail.com', 'paulokayto', '1078961', 'RS56ad1z', 'patrike', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 169. Anthony Nessias Borges Luiz (ID: 4302276, Username: anthony, Indicador: jeanhenrique)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4302276, 'Anthony Nessias Borges Luiz', 'anthony.nbl94@gmail.com', 'anthony', '4302276', 'RS24utbf', 'jeanhenrique', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 170. Dalva de Lima Andrade (ID: 6542661, Username: dalva, Indicador: anthony)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6542661, 'Dalva de Lima Andrade', 'dalvalimaandrade0@gmail.com', 'dalva', '6542661', 'RSmsmtca', 'anthony', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 171. Luiza Gerei Szymonek (ID: 8980469, Username: luiza, Indicador: anthony)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8980469, 'Luiza Gerei Szymonek', 'gereiluiza@gmail.com', 'luiza', '8980469', 'RSa5ju4e', 'anthony', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 172. Diego Rogerio da Silva Alves (ID: 8956291, Username: diego, Indicador: jeanhenrique)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8956291, 'Diego Rogerio da Silva Alves', 'diegorogeriosa@gmail.com', 'diego', '8956291', 'RSoruq7e', 'jeanhenrique', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 173. claudemir dos santos gomes (ID: 2221813, Username: claudemir, Indicador: zequinha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2221813, 'claudemir dos santos gomes', 'claudemirdossantosgomes22@gmail.com', 'claudemir', '2221813', 'RSjru5xx', 'zequinha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 174. Jonas Pereira (ID: 7279016, Username: jonas, Indicador: cleuci)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7279016, 'Jonas Pereira', 'sete7queda@gmail.com', 'jonas', '7279016', 'RS6w948z', 'cleuci', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 175. rosilda dias ferreira (ID: 8102137, Username: rosildadias, Indicador: odete)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8102137, 'rosilda dias ferreira', 'rosildadias875@gmail.com', 'rosildadias', '8102137', 'RSi9qylb', 'odete', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 176. Neide maria Da Silva Oliveira (ID: 2658301, Username: neide, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2658301, 'Neide maria Da Silva Oliveira', 'neidems.oliveira@gmail.com', 'neide', '2658301', 'RS6tgrc4', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 177. Vera Lucia Rosa dos Santos (ID: 5403999, Username: verarosa, Indicador: nice)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5403999, 'Vera Lucia Rosa dos Santos', 'veraluciarosa38@gmail.com', 'verarosa', '5403999', 'RSp39hf7', 'nice', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 178. Maria de lurdes gonçalves katcharowski (ID: 1524515, Username: mariadelurdes, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1524515, 'Maria de lurdes gonçalves katcharowski', 'itielcosta67@gmail.com', 'mariadelurdes', '1524515', 'RShgx1tw', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 179. joeli barbosa de almeida (ID: 3100693, Username: joeli, Indicador: nice)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3100693, 'joeli barbosa de almeida', 'joelibarbosa99@gmail.com', 'joeli', '3100693', 'RSehfq7w', 'nice', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 180. leia dos santos (ID: 8446830, Username: leia, Indicador: jose)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8446830, 'leia dos santos', 'leiasantosrosa11@gmail.com', 'leia', '8446830', 'RSmk89m6', 'jose', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 181. Carmem Almeida (ID: 7029894, Username: carmem, Indicador: pedroflavio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7029894, 'Carmem Almeida', 'flavioalmeida1970novo@gmail.com', 'carmem', '7029894', 'RSmd3tov', 'pedroflavio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 182. Manoel Domingos Bruno da Silva (ID: 1051468, Username: domingossp, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1051468, 'Manoel Domingos Bruno da Silva', 'salao20191919@gmail.com', 'domingossp', '1051468', 'RSgxzs0d', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 183. karolina Cordeiro dos Santos (ID: 9024915, Username: karoina, Indicador: rosilda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9024915, 'karolina Cordeiro dos Santos', 'ninasantoskg@gmail.com', 'karoina', '9024915', 'RSt43poo', 'rosilda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 184. Kaue Moreira (ID: 3009043, Username: kauemoreira, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3009043, 'Kaue Moreira', 'kaue.moreira.12@icloud.com', 'kauemoreira', '3009043', 'RSuc7g0t', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 185. Edinelson Manoel Dos Santos (ID: 886874, Username: gatomiau, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (886874, 'Edinelson Manoel Dos Santos', 'edinelsongato@hotmail.com', 'gatomiau', '886874', 'RS0fm2t0', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 186. Laércio Montesso Gonçalves (ID: 4368770, Username: montesso, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4368770, 'Laércio Montesso Gonçalves', 'montesso70@gmail.com', 'montesso', '4368770', 'RS8cu76w', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 187. alda cordeiro da Rosa dos Santos (ID: 4518847, Username: alda, Indicador: rosilda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4518847, 'alda cordeiro da Rosa dos Santos', 'aldarosa2019@gmail.com', 'alda', '4518847', 'RSpckhoi', 'rosilda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 188. Roseli Cruz Novais da Silva Novais (ID: 9627808, Username: roseli, Indicador: montesso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9627808, 'Roseli Cruz Novais da Silva Novais', 'rosecnovais1969@gmail.com', 'roseli', '9627808', 'RSmk03r1', 'montesso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 189. Maria Fernandes Borges Dias (ID: 229849, Username: donamaria, Indicador: adilson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (229849, 'Maria Fernandes Borges Dias', 'mariafernandesborgesdias@gmail.com', 'donamaria', '229849', 'RSuwdd3z', 'adilson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 190. Janecir Spancerski (ID: 548167, Username: janecir, Indicador: marisane123)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (548167, 'Janecir Spancerski', 'janecir.dotlimp@gmail.com', 'janecir', '548167', 'RS7m2l4m', 'marisane123', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 191. João Alves Algarrão (ID: 6813693, Username: joaoalgarrao, Indicador: montesso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6813693, 'João Alves Algarrão', 'joaoalgarrao@gmail.com', 'joaoalgarrao', '6813693', 'RSep3e4c', 'montesso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 192. Osmar Pereira silva (ID: 514573, Username: osmar, Indicador: montesso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (514573, 'Osmar Pereira silva', '1976@gmail.com', 'osmar', '514573', 'RSdi1eos', 'montesso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 193. Veralaine Romano da silva (ID: 1832240, Username: veralaine, Indicador: osmar)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1832240, 'Veralaine Romano da silva', 'veralainenegao@gmail.com', 'veralaine', '1832240', 'RS0047uo', 'osmar', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 194. Edmilson Aparecido da Conceissão (ID: 3594750, Username: edmilson, Indicador: jeanhenrique)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3594750, 'Edmilson Aparecido da Conceissão', 'deliciasepetiscositai@gmail.com', 'edmilson', '3594750', 'RS9dnkiv', 'jeanhenrique', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 195. Claudinei Oliveira (ID: 791303, Username: shuaijiao, Indicador: montesso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (791303, 'Claudinei Oliveira', 'claudinei.70@live.com', 'shuaijiao', '791303', 'RSsy88cp', 'montesso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 196. Elesandro de Souza Vicente (ID: 1024240, Username: sandrocapa, Indicador: patrike)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1024240, 'Elesandro de Souza Vicente', 'sandrovl@outlook.com.br', 'sandrocapa', '1024240', 'RSpglhs6', 'patrike', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 197. Alexsandro Godinho Hoffmann (ID: 968620, Username: alexsandro, Indicador: simone)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (968620, 'Alexsandro Godinho Hoffmann', 'alex.godinho22@yahoo.com', 'alexsandro', '968620', 'RSlznyop', 'simone', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 198. Rafael Grando (ID: 6038051, Username: rafaelgrando, Indicador: simone)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6038051, 'Rafael Grando', 'rafael.grando.21@gmail.com', 'rafaelgrando', '6038051', 'RS7hq5wj', 'simone', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 199. Adriana Vicente Lins (ID: 2013639, Username: adrianalins, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2013639, 'Adriana Vicente Lins', 'linsbonifica@gmail.com', 'adrianalins', '2013639', 'RSyczihn', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 200. Luiz Queiroz (ID: 9349118, Username: vencedortop, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9349118, 'Luiz Queiroz', 'americaluizsantos1976@gmail.com', 'vencedortop', '9349118', 'RS9qq206', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 201. Lismara Cortez Algarrão (ID: 3555595, Username: lismara, Indicador: joaoalgarrao)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3555595, 'Lismara Cortez Algarrão', 'lismara-cortez@hotmail.com', 'lismara', '3555595', 'RSq29ynq', 'joaoalgarrao', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 202. Osnir Ceccon (ID: 141129, Username: ocsuplementos, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (141129, 'Osnir Ceccon', 'cecconosni@hotmail.com', 'ocsuplementos', '141129', 'RSmufmn3', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 203. Sergio Alessandro Braga (ID: 973242, Username: alexsandro100, Indicador: patrike)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (973242, 'Sergio Alessandro Braga', 'salessandrobraga41@gmail.com', 'alexsandro100', '973242', 'RStq7b1v', 'patrike', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 204. Osmar Pereira silva (ID: 514573, Username: osmar, Indicador: montesso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (514573, 'Osmar Pereira silva', '1976@gmail.com', 'osmar', '514573', 'RShl8gj7', 'montesso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 205. Veralaine Romano da silva (ID: 1832240, Username: veralaine, Indicador: osmar)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1832240, 'Veralaine Romano da silva', 'veralainenegao@gmail.com', 'veralaine', '1832240', 'RSooedrv', 'osmar', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 206. Edmilson Aparecido da Conceissão (ID: 3594750, Username: edmilson, Indicador: jeanhenrique)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3594750, 'Edmilson Aparecido da Conceissão', 'deliciasepetiscositai@gmail.com', 'edmilson', '3594750', 'RSvtae1j', 'jeanhenrique', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 207. Claudinei Oliveira (ID: 791303, Username: shuaijiao, Indicador: montesso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (791303, 'Claudinei Oliveira', 'claudinei.70@live.com', 'shuaijiao', '791303', 'RSlp69r4', 'montesso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 208. Elesandro de Souza Vicente (ID: 1024240, Username: sandrocapa, Indicador: patrike)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1024240, 'Elesandro de Souza Vicente', 'sandrovl@outlook.com.br', 'sandrocapa', '1024240', 'RSbm4o0n', 'patrike', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 209. Alexsandro Godinho Hoffmann (ID: 968620, Username: alexsandro, Indicador: simone)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (968620, 'Alexsandro Godinho Hoffmann', 'alex.godinho22@yahoo.com', 'alexsandro', '968620', 'RSn3wkyy', 'simone', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 210. Rafael Grando (ID: 6038051, Username: rafaelgrando, Indicador: simone)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6038051, 'Rafael Grando', 'rafael.grando.21@gmail.com', 'rafaelgrando', '6038051', 'RSc9pzdl', 'simone', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 211. Adriana Vicente Lins (ID: 2013639, Username: adrianalins, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2013639, 'Adriana Vicente Lins', 'linsbonifica@gmail.com', 'adrianalins', '2013639', 'RSpf4gmw', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 212. Luiz Queiroz (ID: 9349118, Username: vencedortop, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9349118, 'Luiz Queiroz', 'americaluizsantos1976@gmail.com', 'vencedortop', '9349118', 'RSrgn2cq', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 213. Lismara Cortez Algarrão (ID: 3555595, Username: lismara, Indicador: joaoalgarrao)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3555595, 'Lismara Cortez Algarrão', 'lismara-cortez@hotmail.com', 'lismara', '3555595', 'RS7evtxj', 'joaoalgarrao', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 214. Osnir Ceccon (ID: 141129, Username: ocsuplementos, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (141129, 'Osnir Ceccon', 'cecconosni@hotmail.com', 'ocsuplementos', '141129', 'RSgq0921', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 215. Sergio Alessandro Braga (ID: 973242, Username: alexsandro100, Indicador: patrike)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (973242, 'Sergio Alessandro Braga', 'salessandrobraga41@gmail.com', 'alexsandro100', '973242', 'RScs7y5b', 'patrike', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 216. Marcos Lima Rovaris (ID: 8452617, Username: marcoslr, Indicador: ramondutra)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8452617, 'Marcos Lima Rovaris', 'marcosl.rovaris@gmaik.com', 'marcoslr', '8452617', 'RSzhw15g', 'ramondutra', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 217. Guilherme Fortuna (ID: 2691209, Username: guilhermefortuna, Indicador: ramondutra)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2691209, 'Guilherme Fortuna', 'guilherme.4tuna@gmail.com', 'guilhermefortuna', '2691209', 'RSci7sdj', 'ramondutra', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 218. Nilzete Andrade (ID: 2351462, Username: nilzete, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2351462, 'Nilzete Andrade', 'nilzetemedeiros@outlook.com', 'nilzete', '2351462', 'RSs684k6', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 219. Edvaldo G da silva (ID: 6483682, Username: vilaparisi, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6483682, 'Edvaldo G da silva', 'negocio12@gmail.com', 'vilaparisi', '6483682', 'RSx0yba2', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 220. Paulo Silva (ID: 2927599, Username: paulosilva, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2927599, 'Paulo Silva', 'paulosilvabilu05@gmail.com', 'paulosilva', '2927599', 'RSj7oatp', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 221. Victor Borges (ID: 6021232, Username: victor, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6021232, 'Victor Borges', 'senavictor508@gmail.com', 'victor', '6021232', 'RSicu3lt', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 222. Gilvania Maria Da Silva Lima Lima (ID: 5062008, Username: gilvania6905, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5062008, 'Gilvania Maria Da Silva Lima Lima', 'gill.933110@gmail.com', 'gilvania6905', '5062008', 'RStnfxhq', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 223. Mayara De Araújo Medeiros Antão (ID: 3615834, Username: mayara, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3615834, 'Mayara De Araújo Medeiros Antão', 'mayara962010@hotmail.com', 'mayara', '3615834', 'RS1dca8q', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 224. Lourinaldo Ernesto Antao (ID: 8693378, Username: lourinaldo, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8693378, 'Lourinaldo Ernesto Antao', 'lourinaldo357@gmail.com', 'lourinaldo', '8693378', 'RSne7sff', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 225. Thayná Duarte (ID: 628258, Username: thayna, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (628258, 'Thayná Duarte', 'thaynaduart19@gmail.com', 'thayna', '628258', 'RSgodkzy', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 226. Luciana Santos (ID: 6308225, Username: lucycelo, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6308225, 'Luciana Santos', 'lucycelo33@gmail.com', 'lucycelo', '6308225', 'RSvuuju2', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 227. Willams Gonçalves (ID: 1444475, Username: willamsg, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1444475, 'Willams Gonçalves', 'willamsgoncalvesserconio@outlook.com', 'willamsg', '1444475', 'RSvp6q52', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 228. Alessandra Rosa de Araújo (ID: 1461923, Username: alessandrarosa, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1461923, 'Alessandra Rosa de Araújo', 'sandra.rosa.10r@gmail.com', 'alessandrarosa', '1461923', 'RSi4dqnn', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 229. Amelia Oliveira Ribeiro (ID: 1020605, Username: ameliaribeiro, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1020605, 'Amelia Oliveira Ribeiro', 'ameliaribeiro287@gmail.com', 'ameliaribeiro', '1020605', 'RS323m7m', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 230. Célia Alves Braga Braga (ID: 5270064, Username: celia5883, Indicador: gilvania6905)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5270064, 'Célia Alves Braga Braga', 'celiabraga1983@gmail.com', 'celia5883', '5270064', 'RSsiuu56', 'gilvania6905', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 231. Emanoel Souza (ID: 3637700, Username: souza, Indicador: alexsandro100)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3637700, 'Emanoel Souza', 'emanoelbaptista5@gmail.com', 'souza', '3637700', 'RSt7odpm', 'alexsandro100', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 232. Marcos Abreu (ID: 2332948, Username: magaiver, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2332948, 'Marcos Abreu', 'magaiver_abreu@hotmail.com', 'magaiver', '2332948', 'RSt6okc2', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 233. Stefanie Rodrigues Hildever (ID: 4713475, Username: vitor5000, Indicador: alexsandro100)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4713475, 'Stefanie Rodrigues Hildever', 'vitorhildever@gmail.com', 'vitor5000', '4713475', 'RS7pis9l', 'alexsandro100', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 234. Maria Goreti Da Rosa (ID: 7679134, Username: goreti1966, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7679134, 'Maria Goreti Da Rosa', 'darosagoreti5@gmail.com', 'goreti1966', '7679134', 'RSkl0by1', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 235. Pedro Henrique (ID: 9303029, Username: rsprolipsibrasil, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9303029, 'Pedro Henrique', 'pedroazevedoigrejauniversal@gmail.com', 'rsprolipsibrasil', '9303029', 'RScsl1fk', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 236. Aguinaldo Andrade de Araújo (ID: 4922571, Username: aguinaldo, Indicador: alessandrarosa)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4922571, 'Aguinaldo Andrade de Araújo', 'aguinaldoandradedearaujo14@gmail.com', 'aguinaldo', '4922571', 'RSt1s8ti', 'alessandrarosa', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 237. giselda fernanda costa arruda (ID: 6966946, Username: giselda, Indicador: maxbrasil)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6966946, 'giselda fernanda costa arruda', 'giseldafernanda88@gmail.com', 'giselda', '6966946', 'RSh6b05k', 'maxbrasil', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 238. Kemeli De Melo Ferreira (ID: 6650832, Username: kemeli, Indicador: vencedortop)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6650832, 'Kemeli De Melo Ferreira', 'kemeli14@hotmail.com.br', 'kemeli', '6650832', 'RSp5mq9y', 'vencedortop', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 239. Manoel Vicente Luiz (ID: 3601772, Username: manoelins, Indicador: adrianalins)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3601772, 'Manoel Vicente Luiz', 'manoelvicenteluiz789@gmail.com', 'manoelins', '3601772', 'RSk6a2sa', 'adrianalins', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 240. Nadeje Lins Serafim (ID: 9856198, Username: nadejelins, Indicador: manoelins)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9856198, 'Nadeje Lins Serafim', 'nadejelinsserafim@gmail.com', 'nadejelins', '9856198', 'RSo2na91', 'manoelins', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 241. Saulo Virgilio Barbosa (ID: 6008864, Username: saulao123, Indicador: montesso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6008864, 'Saulo Virgilio Barbosa', 'saulaomaxprimebarbosa1987@gmail.com', 'saulao123', '6008864', 'RS61w99j', 'montesso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 242. Márcia Souza (ID: 5551879, Username: marciasouza, Indicador: alessandrarosa)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5551879, 'Márcia Souza', 'marciaddb2120@gmail.com', 'marciasouza', '5551879', 'RSk6qrxx', 'alessandrarosa', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 243. Rafael Alves Guido (ID: 5980522, Username: multinivel1, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5980522, 'Rafael Alves Guido', 'rafael.apvs1@hotmail.com', 'multinivel1', '5980522', 'RS45i3gx', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 244. Afonso Santos Da Silva (ID: 6524017, Username: afonso, Indicador: zequinha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6524017, 'Afonso Santos Da Silva', 'afonsoss@hotmail.com', 'afonso', '6524017', 'RSamy1df', 'zequinha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 245. Janete Ferreira (ID: 7527227, Username: jane, Indicador: nice)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7527227, 'Janete Ferreira', 'janeteferreira303@gmail.com', 'jane', '7527227', 'RSx6w5si', 'nice', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 246. Silmara Miranda (ID: 7699916, Username: silmara, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7699916, 'Silmara Miranda', 'silmaramacedo146@yahoo.com.br', 'silmara', '7699916', 'RSinc50o', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 247. CICERO RODRIGUES DOS SANTOS (ID: 5167653, Username: lider10, Indicador: maxbrasil)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5167653, 'CICERO RODRIGUES DOS SANTOS', 'cicerorodrigues001@gmail.com', 'lider10', '5167653', 'RSc6pr75', 'maxbrasil', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 248. Audicir Canal (ID: 7066286, Username: audi3007, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7066286, 'Audicir Canal', 'audicirflp@gmail.com', 'audi3007', '7066286', 'RS50emqy', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 249. Rosemario Martins Bernadino (ID: 7135801, Username: rosemario, Indicador: edilson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7135801, 'Rosemario Martins Bernadino', 'rosemariomb1966@gmail.com', 'rosemario', '7135801', 'RSasj5ny', 'edilson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 250. Geziane Nunes de Almeida (ID: 2334633, Username: nany, Indicador: cleuci)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2334633, 'Geziane Nunes de Almeida', 'nanydealmeidaoliveira1988@gmail.com', 'nany', '2334633', 'RSfbrimr', 'cleuci', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 251. Dilvete Borba Alves (ID: 5223375, Username: dilvete1234, Indicador: goreti1966)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5223375, 'Dilvete Borba Alves', 'dilvetealves2020@gmail.com', 'dilvete1234', '5223375', 'RSndxhpa', 'goreti1966', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 252. CLAUDINEI MOREIRA (ID: 904693, Username: claudineimoreira, Indicador: zequinha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (904693, 'CLAUDINEI MOREIRA', 'zoinho0001@hotmail.com', 'claudineimoreira', '904693', 'RSadx7sl', 'zequinha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 253. Luiz Gustavo Ribeiro] (ID: 4245218, Username: luizribeiro, Indicador: jozi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4245218, 'Luiz Gustavo Ribeiro]', 'rluizgustavo049@gmail.com', 'luizribeiro', '4245218', 'RSawfg7p', 'jozi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 254. Adiclandia Vicente Lins Gozzer (ID: 1048130, Username: adiclandialins, Indicador: nadejelins)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1048130, 'Adiclandia Vicente Lins Gozzer', 'adibonifica@gmail.com', 'adiclandialins', '1048130', 'RStm0vu7', 'nadejelins', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 255. Jacilene Pessoa (ID: 2295392, Username: jacilene, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2295392, 'Jacilene Pessoa', 'jacilenemenezes.bonifica@gmail.com', 'jacilene', '2295392', 'RSs7a9hu', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 256. Rosa Alves de Barros Barros (ID: 2586874, Username: rosaalves, Indicador: gilvania6905)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2586874, 'Rosa Alves de Barros Barros', 'rosaalves194604@gmail.com', 'rosaalves', '2586874', 'RSnwbaxb', 'gilvania6905', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 257. Enildo Vieira januario (ID: 2865441, Username: nildo12rs, Indicador: edilson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2865441, 'Enildo Vieira januario', 'enildo.januario@gmail.com', 'nildo12rs', '2865441', 'RSdko7vj', 'edilson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 258. Roberto Avelino Tomé (ID: 7917812, Username: robertotome, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7917812, 'Roberto Avelino Tomé', 'roberto.tome5@hotmail.com', 'robertotome', '7917812', 'RS66rg5a', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 259. Adnilson De Paula (ID: 8224912, Username: adnilsonvendedor, Indicador: maxbrasil)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8224912, 'Adnilson De Paula', 'adnilsin1980@gmail.com', 'adnilsonvendedor', '8224912', 'RSkswkao', 'maxbrasil', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 260. Adriano Sousa dos Santos (ID: 8112003, Username: adriano, Indicador: alessandrarosa)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8112003, 'Adriano Sousa dos Santos', 'adriano_iva@hotmail.com', 'adriano', '8112003', 'RS6ie59u', 'alessandrarosa', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 261. Teone Quirino Soares (ID: 1267829, Username: teone, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1267829, 'Teone Quirino Soares', 'teonesoares@gmail.com', 'teone', '1267829', 'RSsr6shx', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 262. altamir alves marquardt (ID: 6390609, Username: altamir, Indicador: simone)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6390609, 'altamir alves marquardt', 'altamirmarquardt@gmail.com', 'altamir', '6390609', 'RSjefua1', 'simone', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 263. john herbert do avelar (ID: 5737344, Username: john, Indicador: robertotome)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5737344, 'john herbert do avelar', 'john.avelar@yahoo.com.br', 'john', '5737344', 'RSyljrbq', 'robertotome', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 264. dalverson wagner correia (ID: 8399852, Username: dalverson, Indicador: jhonny)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8399852, 'dalverson wagner correia', 'jdestampas.artesanatos@yahoo.com', 'dalverson', '8399852', 'RS6i9vzn', 'jhonny', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 265. Esolimar Vieira paz (ID: 2806973, Username: esolimar, Indicador: alessandrarosa)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2806973, 'Esolimar Vieira paz', 'esolimarvieirapaz@gmail.com', 'esolimar', '2806973', 'RSd9irsn', 'alessandrarosa', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 266. Tatiana Vasconcelos (ID: 6362034, Username: tatiana, Indicador: alessandrarosa)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6362034, 'Tatiana Vasconcelos', 'tatianavaviana@gmail.com', 'tatiana', '6362034', 'RS0pcx0b', 'alessandrarosa', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 267. marileia rio branco dos santos (ID: 2735381, Username: mari10, Indicador: alaor)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2735381, 'marileia rio branco dos santos', 'maririo2001@gmail.com', 'mari10', '2735381', 'RS8fi6k1', 'alaor', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 268. INES TEREZINHA KOLACHNEK (ID: 8366158, Username: ines10, Indicador: alaor)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8366158, 'INES TEREZINHA KOLACHNEK', 'inestkolachnek@gmail.com', 'ines10', '8366158', 'RSk4bocc', 'alaor', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 269. Joao Medeiros (ID: 5522084, Username: jotace90, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5522084, 'Joao Medeiros', 'jotacemedeiros@gmail.com', 'jotace90', '5522084', 'RSepcpti', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 270. Claudiney Sousa Luna (ID: 6897883, Username: claudiney, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6897883, 'Claudiney Sousa Luna', 'claudineysousaluna@gmail.com', 'claudiney', '6897883', 'RSy581xu', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 271. Nadja Alves (ID: 9446885, Username: nadjaalves, Indicador: alessandrarosa)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9446885, 'Nadja Alves', 'alvesacessorios.eparaja@gmail.com', 'nadjaalves', '9446885', 'RSxcxbkk', 'alessandrarosa', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 272. João Vieira Borges (ID: 6280732, Username: joaovieira, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6280732, 'João Vieira Borges', 'joaovieiraborges4@gmail.com', 'joaovieira', '6280732', 'RSuujq68', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 273. Josias Arruda Coimbra (ID: 8718708, Username: josiascoimbra123, Indicador: jotace90)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8718708, 'Josias Arruda Coimbra', 'josiascoimbraarruda@gmail.com', 'josiascoimbra123', '8718708', 'RS6ijtf6', 'jotace90', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 274. Tiago Santos Miranda (ID: 5912054, Username: esradiamante, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5912054, 'Tiago Santos Miranda', 'tiagomiranda06@gmail.com', 'esradiamante', '5912054', 'RS1t2066', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 275. Jean Farias (ID: 5969457, Username: jean, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5969457, 'Jean Farias', 'jeanfariasc@gmail.com', 'jean', '5969457', 'RSwj0j6p', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 276. Antônio Geraldo (ID: 4228446, Username: agb, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4228446, 'Antônio Geraldo', 'agbtonho@gmail.com', 'agb', '4228446', 'RSy6fdmi', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 277. Pillsr Gama (ID: 4238184, Username: pillar, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4238184, 'Pillsr Gama', 'pgamaproducao@gmail.com', 'pillar', '4238184', 'RS7ls3lb', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 278. José Sebastião aves brito (ID: 5723360, Username: tiao, Indicador: fernanda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5723360, 'José Sebastião aves brito', 'tiao.brito@hotmail.com', 'tiao', '5723360', 'RSwiwwo8', 'fernanda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 279. Leonel Rodrigues (ID: 2924655, Username: top7, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2924655, 'Leonel Rodrigues', 'plenitudebr@yahoo.com.br', 'top7', '2924655', 'RSymi7d1', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 280. Joel Almeida Lara (ID: 6772420, Username: lara, Indicador: jean)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6772420, 'Joel Almeida Lara', 'almeidajoellara1366@gmail.com', 'lara', '6772420', 'RSf8ugxp', 'jean', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 281. Sidney Cunha (ID: 8678750, Username: sidney, Indicador: zequinha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8678750, 'Sidney Cunha', 'sidneycunha5@gmail.com', 'sidney', '8678750', 'RS6vu0lc', 'zequinha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 282. Myrna Lorena Celste Wilson (ID: 7370660, Username: mbalikasaudeebemestar, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7370660, 'Myrna Lorena Celste Wilson', 'mbalika.wilson@gmail.com', 'mbalikasaudeebemestar', '7370660', 'RSpe74ru', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 283. Oséias Soares pinto (ID: 5725195, Username: oseias3420, Indicador: vencedortop)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5725195, 'Oséias Soares pinto', 'oseiassoares786@gmail.com', 'oseias3420', '5725195', 'RS7lzzdz', 'vencedortop', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 284. Lucimari Oliveira (ID: 6781757, Username: aguiafenix, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6781757, 'Lucimari Oliveira', 'sucessoslu@gmail.com', 'aguiafenix', '6781757', 'RSor6f69', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 285. Odair Luna (ID: 4740024, Username: odairluna, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4740024, 'Odair Luna', '1odairluna@gmail.com', 'odairluna', '4740024', 'RSzsfgy6', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 286. Geiza Rodrigues santos (ID: 5994738, Username: geizars, Indicador: esradiamante)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5994738, 'Geiza Rodrigues santos', 'rodriguesantosmb@gmail.com', 'geizars', '5994738', 'RSo43169', 'esradiamante', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 287. José Carlos (ID: 8618916, Username: josecarlos, Indicador: vicente)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8618916, 'José Carlos', 'hidroeletricaguarituba@gmail.com', 'josecarlos', '8618916', 'RSmk34xf', 'vicente', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 288. Fabiano Guizoni (ID: 1460404, Username: luvi, Indicador: aguiafenix)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1460404, 'Fabiano Guizoni', 'fabiano.rodozoni@gmail.com', 'luvi', '1460404', 'RSifmcvj', 'aguiafenix', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 289. Joziel Conceição da silva (ID: 327483, Username: jozielsilva, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (327483, 'Joziel Conceição da silva', 'jozielsilva2016@gmail.com', 'jozielsilva', '327483', 'RSqe9gzp', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 290. Valter dos Santos nascimento (ID: 4215356, Username: lapiduz, Indicador: esradiamante)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4215356, 'Valter dos Santos nascimento', 'lapiduzsgsfamily@gmail.com', 'lapiduz', '4215356', 'RS12v6n5', 'esradiamante', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 291. Edner Guimarães de Andrade (ID: 2921457, Username: ednerandrade, Indicador: esradiamante)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2921457, 'Edner Guimarães de Andrade', 'ednerguimaraes744@gmail.com', 'ednerandrade', '2921457', 'RSul2qpg', 'esradiamante', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 292. Jorgenei Mendes da Silva (ID: 5775405, Username: viversaude, Indicador: esradiamante)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5775405, 'Jorgenei Mendes da Silva', 'jorgenei_ac@hotmail.com', 'viversaude', '5775405', 'RSml8bgh', 'esradiamante', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 293. Silvia Terezinha de Almeida (ID: 5155032, Username: silvia, Indicador: alaor)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5155032, 'Silvia Terezinha de Almeida', 'silviade.almeida@hotmail.com', 'silvia', '5155032', 'RSfjwa4k', 'alaor', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 294. Denilson Souza de lima (ID: 2432273, Username: denilson, Indicador: vencedortop)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2432273, 'Denilson Souza de lima', 'denilson_sdl@hotmail.com', 'denilson', '2432273', 'RShq0olc', 'vencedortop', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 295. JORGE HENRIQUE NUNES DE OLIVEIRA (ID: 7987183, Username: sucessofb, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7987183, 'JORGE HENRIQUE NUNES DE OLIVEIRA', 'jorgeoliveiradiamante@gmail.com', 'sucessofb', '7987183', 'RSihqfdw', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 296. CLAUDIA SUZANE BRUM (ID: 6447640, Username: cbrum, Indicador: sucessofb)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6447640, 'CLAUDIA SUZANE BRUM', 'claudiabrum2022@gmail.com', 'cbrum', '6447640', 'RS3eoz62', 'sucessofb', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 297. Claudenir Augusto da Silva (ID: 9891921, Username: claudenir01, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9891921, 'Claudenir Augusto da Silva', 'claudenir01augusto@gmail.com', 'claudenir01', '9891921', 'RSi2lcx5', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 298. Hamilton José da Rosa zorzenao (ID: 6315565, Username: hamiltonrosa1, Indicador: alaor)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6315565, 'Hamilton José da Rosa zorzenao', 'hamiltonjosedarosa1@gmail.com', 'hamiltonrosa1', '6315565', 'RS2bqiuu', 'alaor', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 299. Maura Rodrigues da Silva ermelino (ID: 4839474, Username: maura, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4839474, 'Maura Rodrigues da Silva ermelino', 'maurarodrigues05@gmail.com', 'maura', '4839474', 'RS946j07', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 300. Firmino Figueiredo dos Santos (ID: 6762842, Username: firmino, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6762842, 'Firmino Figueiredo dos Santos', 'firminofigueredo.1952@gmail.com', 'firmino', '6762842', 'RSe0dy8m', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 301. Cassio Natel (ID: 5689732, Username: cassio, Indicador: josesantos)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5689732, 'Cassio Natel', 'cassio_cocha@outlook.com', 'cassio', '5689732', 'RSu583n7', 'josesantos', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 302. Willer Batista (ID: 7987614, Username: willer, Indicador: esradiamante)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7987614, 'Willer Batista', 'willergrupo@gmail.com', 'willer', '7987614', 'RSuuhq2o', 'esradiamante', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 303. Jocelito Carvalho do Prado (ID: 1847928, Username: jocelito1, Indicador: hamiltonrosa1)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1847928, 'Jocelito Carvalho do Prado', '00000000000000000000@gmail.co', 'jocelito1', '1847928', 'RS2xh6ub', 'hamiltonrosa1', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 304. ernani lima pereira (ID: 5423761, Username: ernani, Indicador: alaor)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5423761, 'ernani lima pereira', 'ernanilimapereira@gmail.com', 'ernani', '5423761', 'RSr8tskk', 'alaor', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 305. Aparicio Monteiro (ID: 8116281, Username: monteiro, Indicador: ernani)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8116281, 'Aparicio Monteiro', 'amf.monteiro79@gmail.com', 'monteiro', '8116281', 'RSdsh3ci', 'ernani', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 306. Rubens Solarevicz (ID: 1501765, Username: rubvicz, Indicador: ernani)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1501765, 'Rubens Solarevicz', 'rubvicz4.0@gmail.com', 'rubvicz', '1501765', 'RS9ird2m', 'ernani', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 307. Thais Alves (ID: 3922646, Username: thaisalves, Indicador: ingrid)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3922646, 'Thais Alves', 'tha.alves29@gmail.com', 'thaisalves', '3922646', 'RSff46x3', 'ingrid', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 308. Jose Carlos messias dos santos (ID: 4105529, Username: josemessias, Indicador: zequinha)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4105529, 'Jose Carlos messias dos santos', 'jc5559884@gmail.com', 'josemessias', '4105529', 'RShwsb92', 'zequinha', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 309. pedro paulista prado (ID: 747015, Username: pedrop, Indicador: josemessias)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (747015, 'pedro paulista prado', 'pedropopo@gmail.com', 'pedrop', '747015', 'RSmczew7', 'josemessias', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 310. Pedro de sousa barros (ID: 9376969, Username: pedrosb, Indicador: esradiamante)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9376969, 'Pedro de sousa barros', 'pedro.sousabarros01@gmail.com', 'pedrosb', '9376969', 'RS0linap', 'esradiamante', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 311. Hamilton José da Rosa zorzenao (ID: 6800588, Username: hamiltonrosa, Indicador: renato)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6800588, 'Hamilton José da Rosa zorzenao', 'hamiltonjosedarosa@gmail.com', 'hamiltonrosa', '6800588', 'RSxikloh', 'renato', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 312. Rogerio Tavares da Veiga (ID: 2194531, Username: rogeriotavares, Indicador: hamiltonrosa)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2194531, 'Rogerio Tavares da Veiga', 'educacionalsaber1@gmail.com', 'rogeriotavares', '2194531', 'RSzovfyy', 'hamiltonrosa', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 313. Alciones luis Rissardi (ID: 9364671, Username: alcionesrissardi, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9364671, 'Alciones luis Rissardi', 'alcioneslrissardi@gmail.com', 'alcionesrissardi', '9364671', 'RSu0lyu5', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 314. Romualdo Bezerra da Silva (ID: 2687833, Username: ronespz, Indicador: mauricio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2687833, 'Romualdo Bezerra da Silva', 'silvaspz14@gmail.com', 'ronespz', '2687833', 'RSm4d0a0', 'mauricio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 315. Alirio Moro (ID: 9425156, Username: morospzmt, Indicador: ronespz)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9425156, 'Alirio Moro', 'aliriomoro05@gmail.com', 'morospzmt', '9425156', 'RSnpapeo', 'ronespz', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 316. Manoel Matos Oliveira (ID: 6767246, Username: manoel551, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6767246, 'Manoel Matos Oliveira', 'manoel00oliveira@gmail.com', 'manoel551', '6767246', 'RSk3uggo', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 317. Sara Bezerra da Silva (ID: 7727600, Username: silvaspz, Indicador: ronespz)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7727600, 'Sara Bezerra da Silva', 'silvaspz12@gmail.com', 'silvaspz', '7727600', 'RSwifnr5', 'ronespz', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 318. José jose Rodrigues (ID: 7967528, Username: jmrodrigues, Indicador: willer)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7967528, 'José jose Rodrigues', 'gerin1231414@gmail.com', 'jmrodrigues', '7967528', 'RSbxz7di', 'willer', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 319. Maria José Santos de Ávila (ID: 4727953, Username: mariaspz, Indicador: morospzmt)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4727953, 'Maria José Santos de Ávila', 'roneb.bezerra@gmail.com', 'mariaspz', '4727953', 'RSpb1oyk', 'morospzmt', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 320. Everton Magnus Cardoso (ID: 5190852, Username: everton, Indicador: manoel551)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5190852, 'Everton Magnus Cardoso', 'tiffanycardoso2011@gmail.com', 'everton', '5190852', 'RSjikx6u', 'manoel551', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 321. Helida Alves Farias (ID: 7557243, Username: helida, Indicador: erica)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7557243, 'Helida Alves Farias', 'h.alvesfarias@gmail.com', 'helida', '7557243', 'RS6ob39i', 'erica', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 322. Luciano Lopes Sena (ID: 7308989, Username: lucianosena, Indicador: esradiamante)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7308989, 'Luciano Lopes Sena', 'senadigital2020@gmail.com', 'lucianosena', '7308989', 'RS67y8dc', 'esradiamante', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 323. Andreia Pacheco da Silva (ID: 5281789, Username: 5a9h2n9c3, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5281789, 'Andreia Pacheco da Silva', 'pachecoandreiadasilva7878@gmail.com', '5a9h2n9c3', '5281789', 'RSalzmqv', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 324. Paola Emanuelle Figueiredo (ID: 264132, Username: paola2205, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (264132, 'Paola Emanuelle Figueiredo', 'paola.emanuelle.gmm@gmail.com', 'paola2205', '264132', 'RSpw3j8h', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 325. Urbano Barreto (ID: 478629, Username: barreto, Indicador: souza)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (478629, 'Urbano Barreto', 'urbano.issqn@gmail.com', 'barreto', '478629', 'RSsk9ili', 'souza', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 326. Josué Cabral da Luz (ID: 9316505, Username: cabral, Indicador: ernani)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9316505, 'Josué Cabral da Luz', 'cabraldaluz04@gmail.com', 'cabral', '9316505', 'RSxxwmby', 'ernani', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 327. Odenir Paulo de Oliveira (ID: 4596438, Username: denisoliveira, Indicador: ernani)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4596438, 'Odenir Paulo de Oliveira', 'comunidadeplenoser@gmail.com', 'denisoliveira', '4596438', 'RSv2yrql', 'ernani', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 328. Marcos Da Silva (ID: 719223, Username: marquin, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (719223, 'Marcos Da Silva', 'marcoslsilva85@gmail.com', 'marquin', '719223', 'RS4baqz6', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 329. Gledison Roberto (ID: 16527, Username: gledison, Indicador: mauricio)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (16527, 'Gledison Roberto', 'gledisonroberto@hotmail.com', 'gledison', '16527', 'RSm5zrre', 'mauricio', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 330. Ezequiel Alves da Fonseca (ID: 7683321, Username: ezequielfonseca, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7683321, 'Ezequiel Alves da Fonseca', 'ezequielbingofonseca@gmail.com', 'ezequielfonseca', '7683321', 'RSd0f56h', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 331. Chagas pinto (ID: 7877785, Username: chagascom, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7877785, 'Chagas pinto', 'fc321247@gmail.com', 'chagascom', '7877785', 'RSfy4y8f', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 332. carlos gomes cavalcante (ID: 5127583, Username: carlos, Indicador: joaoalgarrao)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5127583, 'carlos gomes cavalcante', 'gomescavalcantecarlos13@gmail.com', 'carlos', '5127583', 'RS2rl147', 'joaoalgarrao', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 333. Jardel Rubem Gaioso Carneiro (ID: 5791006, Username: lojaonline, Indicador: esradiamante)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5791006, 'Jardel Rubem Gaioso Carneiro', 'sucesso.foco@gmail.com', 'lojaonline', '5791006', 'RSrsgwah', 'esradiamante', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 334. João Nazaré do Socorro Ferreira (ID: 3060979, Username: compreaqui, Indicador: lojaonline)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3060979, 'João Nazaré do Socorro Ferreira', 'joaonazareferreira1@gmail.com', 'compreaqui', '3060979', 'RS9fphu0', 'lojaonline', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 335. José Rene Lira de Queiroz (ID: 2281656, Username: maissaude, Indicador: lojaonline)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2281656, 'José Rene Lira de Queiroz', 'renelineker@gmail.com', 'maissaude', '2281656', 'RS53yfdr', 'lojaonline', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 336. Aldo Silvestre Dos Santos (ID: 8919528, Username: maisvida, Indicador: maissaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8919528, 'Aldo Silvestre Dos Santos', 'aldosilvestre2016@gmail.com', 'maisvida', '8919528', 'RS6mj2z7', 'maissaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 337. Antônio Marcos Costa (ID: 8044065, Username: antoniomarcos, Indicador: compreaqui)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8044065, 'Antônio Marcos Costa', 'mmnamcjp@gmail.com', 'antoniomarcos', '8044065', 'RSis5nss', 'compreaqui', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 338. Osmar pererira de godoy (ID: 1977768, Username: godoy, Indicador: vicente)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1977768, 'Osmar pererira de godoy', 'osmarpereriradegodoy@gmail.com', 'godoy', '1977768', 'RS8uz79s', 'vicente', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 339. Emanuel Davi (ID: 9113238, Username: emanuel, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9113238, 'Emanuel Davi', 'emanuelscheidt20@gmail.com', 'emanuel', '9113238', 'RS1bhthu', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 340. Mauro Bellinel (ID: 172896, Username: mauro, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (172896, 'Mauro Bellinel', 'maurobellinelo925@outlook.com', 'mauro', '172896', 'RSzwx2d8', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 341. Lediane Gonçalves santos (ID: 4739150, Username: leydy10, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4739150, 'Lediane Gonçalves santos', 'leydy7408@gmail.com', 'leydy10', '4739150', 'RSgbzdr4', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 342. Izaac Pinheiro da Silva Filho (ID: 9302092, Username: mrpinheiro, Indicador: domingossp)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9302092, 'Izaac Pinheiro da Silva Filho', 'izaacsilvafilho@gmail.com', 'mrpinheiro', '9302092', 'RS4qhpsx', 'domingossp', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 343. Luis Fernando Ilário Rodrigues (ID: 9035882, Username: luis, Indicador: erica)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9035882, 'Luis Fernando Ilário Rodrigues', 'daviluisfernando0@gmail.com', 'luis', '9035882', 'RS78e6vw', 'erica', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 344. Wagner Oliveira (ID: 651671, Username: wagner01, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (651671, 'Wagner Oliveira', 'wagneroliversilva8119@gmail.com', 'wagner01', '651671', 'RSc12wal', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 345. Abismael Belo (ID: 7446304, Username: abisamgela, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7446304, 'Abismael Belo', 'abismaelnivel58@gmail.com', 'abisamgela', '7446304', 'RScf642e', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 346. José Marcio (ID: 4705288, Username: xtnzjob, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4705288, 'José Marcio', 'rsrodriguesinbox@gmail.com', 'xtnzjob', '4705288', 'RS41nxix', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 347. Salvador dos Reus (ID: 6961338, Username: reidosul, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6961338, 'Salvador dos Reus', 'salvareis27@gmail.com', 'reidosul', '6961338', 'RSrvxg2b', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 348. Alisson Breno Ribeiro (ID: 7756586, Username: alisson, Indicador: celso)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (7756586, 'Alisson Breno Ribeiro', 'brenoalisson718@gmail.com', 'alisson', '7756586', 'RS1eefkd', 'celso', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 349. Helenice Moreno de Oliveira (ID: 5470981, Username: segredodasaude, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5470981, 'Helenice Moreno de Oliveira', 'helenice.moreno@gmail.com', 'segredodasaude', '5470981', 'RSet3bmq', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 350. Francisco das chagas Pereira Araujo (ID: 1081172, Username: diamante, Indicador: rsprolipsi)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1081172, 'Francisco das chagas Pereira Araujo', 'franciscoaraujoa77@gmail.com', 'diamante', '1081172', 'RSbc23pc', 'rsprolipsi', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 351. Mauricio Martins Viana (ID: 5997730, Username: viana, Indicador: rubvicz)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5997730, 'Mauricio Martins Viana', 'vianamauricio1@hotmail.com', 'viana', '5997730', 'RSr2f87q', 'rubvicz', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 352. Rozangela Bodi Santana (ID: 6386735, Username: rozangela0784, Indicador: leonina)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6386735, 'Rozangela Bodi Santana', 'zanja0784@gmail.com', 'rozangela0784', '6386735', 'RSu48v0f', 'leonina', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 353. Sonia Maria de Carvalho (ID: 4751043, Username: produtosnaturais, Indicador: segredodasaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4751043, 'Sonia Maria de Carvalho', 'soniamarianioaque@gmail.com', 'produtosnaturais', '4751043', 'RS0kj6hu', 'segredodasaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 354. Nara Timm Vianna (ID: 1694875, Username: nararejanetimmvianna, Indicador: segredodasaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1694875, 'Nara Timm Vianna', 'casa.artcor@gmail.com', 'nararejanetimmvianna', '1694875', 'RSqm7txr', 'segredodasaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 355. Andréia Bigas de lima (ID: 8571710, Username: deiasaude, Indicador: segredodasaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8571710, 'Andréia Bigas de lima', 'bigassantos@gmail.com', 'deiasaude', '8571710', 'RSk0us11', 'segredodasaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 356. Izaías Vieira Costa (ID: 3446858, Username: saudenatural, Indicador: segredodasaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3446858, 'Izaías Vieira Costa', 'izaiascosta1971@gmail.com', 'saudenatural', '3446858', 'RSmpuxau', 'segredodasaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 357. Rosineia Aparecida Rodrigues (ID: 3540357, Username: rosi, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3540357, 'Rosineia Aparecida Rodrigues', 'rosineiarodrigues82@gmail.com', 'rosi', '3540357', 'RSgt7l2y', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 358. Jose Vidal (ID: 8754330, Username: jose153830, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8754330, 'Jose Vidal', 'vijosegilberto693@gmail.com', 'jose153830', '8754330', 'RSmwim3s', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 359. Nagila Marques Martins de Souza (ID: 6472348, Username: nagilamarques, Indicador: segredodasaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6472348, 'Nagila Marques Martins de Souza', 'nagilamarquesmartins@gmail.com', 'nagilamarques', '6472348', 'RSkgi1el', 'segredodasaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 360. Sergio Filgueiras magalhaes (ID: 9053548, Username: sergio124588, Indicador: emclaro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9053548, 'Sergio Filgueiras magalhaes', 'sergiomontanhasfm@gmail.com', 'sergio124588', '9053548', 'RS61qc8d', 'emclaro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 361. anderson fabre (ID: 5109565, Username: anderson2025, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5109565, 'anderson fabre', 'loppnowdayane@gmail.com', 'anderson2025', '5109565', 'RSo9oa5r', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 362. Maria Sarmento (ID: 3591780, Username: mariasarmento, Indicador: ameliaribeiro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (3591780, 'Maria Sarmento', 'josianesarmento1984@gmail.com', 'mariasarmento', '3591780', 'RSvh0rck', 'ameliaribeiro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 363. Analia Silvana Marques Martins (ID: 6466954, Username: analiamarques, Indicador: nagilamarques)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6466954, 'Analia Silvana Marques Martins', 'analiasilvanamarquesmartins@gmail.com', 'analiamarques', '6466954', 'RS6dbp4k', 'nagilamarques', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 364. Jaira Marques de Oliveira (ID: 5880433, Username: jaira, Indicador: nagilamarques)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5880433, 'Jaira Marques de Oliveira', 'nagilaentremaressp@hotmail.com.br', 'jaira', '5880433', 'RSrnk45s', 'nagilamarques', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 365. Israel Santana (ID: 8440910, Username: santana93, Indicador: michael)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8440910, 'Israel Santana', 'prisraelsantana23@gmail.com', 'santana93', '8440910', 'RSh0i5of', 'michael', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 366. Vital érg -- Corporation -- (ID: 8672866, Username: elizeucasella, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8672866, 'Vital érg -- Corporation --', 'elizeucasella31@gmail.com', 'elizeucasella', '8672866', 'RSr7aikx', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 367. Murilo Henrique Amaral Vieira (ID: 9683739, Username: murilov, Indicador: ewerton)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9683739, 'Murilo Henrique Amaral Vieira', 'murilohvieira22@gmail.com', 'murilov', '9683739', 'RSj21mu5', 'ewerton', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 368. Gilmara dos santos de lima (ID: 2384842, Username: gilmara, Indicador: murilov)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2384842, 'Gilmara dos santos de lima', 'gilmaralimasa77@gmail.com', 'gilmara', '2384842', 'RSnmg5um', 'murilov', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 369. Jhulia Almeida (ID: 4683823, Username: jhulia, Indicador: segredodasaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4683823, 'Jhulia Almeida', 'jhuliaalmeida.s@icloud.com', 'jhulia', '4683823', 'RS66d7fv', 'segredodasaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 370. Maria Alice Pimentel (ID: 5782294, Username: maria2025, Indicador: murilov)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (5782294, 'Maria Alice Pimentel', 'alice_splender@hotmail.com', 'maria2025', '5782294', 'RSue4zx6', 'murilov', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 371. Nivaldo Estevão (ID: 8529625, Username: nivaldo123, Indicador: segredodasaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (8529625, 'Nivaldo Estevão', 'nivaldo.ne17@gmail.com', 'nivaldo123', '8529625', 'RSntkjm0', 'segredodasaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 372. Adelir Roberto (ID: 9677719, Username: adelir, Indicador: adilson)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (9677719, 'Adelir Roberto', 'linaagabriele@gmail.com', 'adelir', '9677719', 'RSusjiwv', 'adilson', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 373. Lilian De Jesus (ID: 2680829, Username: liliandejesus, Indicador: ameliaribeiro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2680829, 'Lilian De Jesus', 'lilianbessadejesus2022@gmail.com', 'liliandejesus', '2680829', 'RS7m9xto', 'ameliaribeiro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 374. pablo douglas (ID: 6063979, Username: pablodejesus, Indicador: ameliaribeiro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6063979, 'pablo douglas', '608706@prof.sed.sc.gov.br', 'pablodejesus', '6063979', 'RScyj2my', 'ameliaribeiro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 375. Valdival Ribeiro Braga (ID: 1180209, Username: valdibraga, Indicador: ameliaribeiro)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1180209, 'Valdival Ribeiro Braga', 'waldiribeiro45@gmail.com', 'valdibraga', '1180209', 'RSa1rkbr', 'ameliaribeiro', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 376. Sonia Maria Pantosa (ID: 4897389, Username: sonia123, Indicador: segredodasaude)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (4897389, 'Sonia Maria Pantosa', 'soniamariapantosa@gmail.com', 'sonia123', '4897389', 'RSrpda7i', 'segredodasaude', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 377. daniel sa (ID: 6347068, Username: danielsa, Indicador: miranda)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (6347068, 'daniel sa', 'danielsamanjutencoes@gmail.com', 'danielsa', '6347068', 'RSj4n8ld', 'miranda', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 378. Maria Aparecida da Silva Cordeiro (ID: 2238387, Username: cidams2025, Indicador: saudenatural)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (2238387, 'Maria Aparecida da Silva Cordeiro', 'cida4218285@hotmail.com', 'cidams2025', '2238387', 'RSgueqvw', 'saudenatural', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- 379. nilza coelho (ID: 1668096, Username: nilza, Indicador: cidams2025)
INSERT INTO consultants (id, nome_completo, email, username, codigo_consultor, senha_hash, patrocinador_ref, pin_inicial, ativo_sigma, created_at) 
VALUES (1668096, 'nilza coelho', 'nylza.c@hotmail.com', 'nilza', '1668096', 'RS35icid', 'cidams2025', 'Consultor', false, NOW())
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT COUNT(*) as total_cadastrados FROM consultants;
SELECT id, nome_completo, username, patrocinador_ref FROM consultants ORDER BY id LIMIT 20;
