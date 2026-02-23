-- Limpar dados existentes para evitar duplicação em execuções repetidas
DELETE FROM career_levels_digital;

-- Inserir Níveis de Carreira Digital
INSERT INTO career_levels_digital (name, display_order, required_volume, commission_percentage, award, active) VALUES
('RS One Star', 1, 10000.00, 30.00, 'Placa RS One Star', true),
('RS Two Star', 2, 100000.00, 35.00, 'Headset Gamer Premium + Placa RS Two Star', true),
('RS Three Star', 3, 250000.00, 40.00, 'Kit Creator Light (Teclado/Mouse/Mic/Ring Light) + Placa RS Three Star', true),
('RS Pro Star', 4, 500000.00, 45.00, 'PC i9 PRO BUILDER (i9/16GB/SSD) + Placa RS Pro Star', true),
('RS Prime Star', 5, 1000000.00, 50.00, 'Cruzeiro RS Premium Pack + Kit RS Prime + Placa RS Prime Star', true),
('RS Elite Star', 6, 2000000.00, 55.00, 'Elite Travel Pack (Viagem Int) + Kit Elite + Placa RS Elite Star', true),
('RS Legend Star', 7, 5000000.00, 60.00, 'THE LEGEND PACK (Carro 0km) + Placa RS Legend Star', true);
