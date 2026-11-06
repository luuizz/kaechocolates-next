-- Catálogo inicial: as 14 barras do site atual, caixas do kit e planos do clube.
-- Preços, descontos e planos são provisórios: ajuste pelo painel (/admin).
-- Usa "on conflict do nothing" para não sobrescrever o que já foi editado.

insert into public.products
  (slug, name, cacao, line, label_color, tile_color, label_text, price, compare_at_price, weight, short, badge, sold_out, image, sort_order)
values
  ('guru-60', 'Guru', 60, 'intensos', '#151515', '#c9a54c', 'light', 32.70, 35.00, '70 g', 'Edição limitada para quem gosta de descobrir.', 'Edição limitada', false, null, 10),
  ('acai-37', 'Açaí', 37, 'brancos', '#5b3a8e', '#6c3f99', 'light', 32.70, 35.00, '70 g', 'Chocolate branco com açaí da Amazônia.', null, false, null, 20),
  ('cumaru-55', 'Cumaru', 55, 'ao-leite', '#1f7fc1', '#1c7cbf', 'dark', 32.70, 35.00, '70 g', 'Ao leite com cumaru, a "baunilha brasileira".', null, false, null, 30),
  ('zero-acucar-cumaru-55', 'Cumaru zero açúcar', 55, 'ao-leite', '#151515', '#1c7cbf', 'light', 32.70, 35.00, '70 g', '55% ao leite com cumaru, sem adição de açúcar.', 'Zero açúcar', false, null, 40),
  ('caipira-37', 'Caipira', 37, 'brancos', '#3aa55a', '#3ea85c', 'dark', 32.70, 35.00, '70 g', 'Branco com milho e especiarias. Festa junina em barra.', null, false, null, 50),
  ('chocada-55', 'Chocada', 55, 'ao-leite', '#c6342b', '#df8a2c', 'light', 32.70, 35.00, '70 g', 'Ao leite com doce de leite e crocante.', null, false, null, 60),
  ('nibs-37', 'Branco com nibs', 37, 'brancos', '#e8b630', '#efb72d', 'dark', 32.70, 35.00, '70 g', 'Branco com nibs de cacau e açúcar mascavo.', null, false, '/images/produtos/branco-nibs-37.png', 70),
  ('pingado-55', 'Pingado', 55, 'ao-leite', '#b58a4f', '#c49d61', 'dark', 32.70, 35.00, '70 g', 'Ao leite com café: o pingado da padaria.', null, false, null, 80),
  ('castanha-64', 'Castanha e flor de sal', 64, 'intensos', '#e2708e', '#eba3ad', 'dark', 32.70, 35.00, '70 g', 'Castanha de caju e flor de sal.', null, false, '/images/produtos/castanha-flor-de-sal-64.png', 90),
  ('cupuacu-64', 'Cupuaçu', 64, 'intensos', '#e47a24', '#e37a2f', 'dark', 32.70, 35.00, '70 g', 'O primo amazônico do cacau, ácido e frutado.', null, false, '/images/produtos/cupuacu-64.png', 100),
  ('cafezinho-64', 'Cafezinho', 64, 'intensos', '#5f7a2a', '#6c7f31', 'light', 32.70, 35.00, '70 g', 'Intenso com café, para depois do almoço.', null, false, null, 110),
  ('pao-de-mel-64', 'Pão de mel', 64, 'intensos', '#8f78bf', '#9d87c8', 'dark', 32.70, 35.00, '70 g', 'Intenso com especiarias de pão de mel.', null, false, null, 120),
  ('intenso-71', 'Intenso', 71, 'intensos', '#d01b2e', '#de2f35', 'light', 32.70, 35.00, '70 g', 'Só cacau da Bahia e açúcar.', null, false, '/images/produtos/intenso-71.png', 130),
  ('prodigio-64', 'Prodígio', 64, 'intensos', '#151515', '#c9a54c', 'light', 32.70, 35.00, '70 g', 'Edição limitada com coco.', 'Edição limitada', true, null, 140)
on conflict (slug) do nothing;

insert into public.kit_boxes (id, name, size, discount, note, sort_order)
values
  ('p', 'Caixa P', 3, 0.05, 'Para provar', 10),
  ('m', 'Caixa M', 6, 0.08, 'A mais pedida', 20),
  ('g', 'Caixa G', 9, 0.12, 'Para chocólatras', 30)
on conflict (id) do nothing;

insert into public.club_plans (id, name, bars, price, color, pitch, perks, featured, sort_order)
values
  ('degustacao', 'Degustação', 2, 59.90, '#efb72d', 'Para conhecer a Kaê sem pressa.', array['2 barras por mês', 'Ficha de degustação', 'Frete grátis']::text[], false, 10),
  ('chocolatra', 'Chocólatra', 4, 109.90, '#e2708e', 'O equilíbrio perfeito entre novidade e favoritos.', array['4 barras por mês', '1 edição limitada por caixa', 'Ficha de degustação', 'Frete grátis']::text[], true, 20),
  ('familia', 'Família', 6, 159.90, '#1c7cbf', 'Para dividir em casa (ou não).', array['6 barras por mês', '2 edições limitadas por caixa', 'Ficha de degustação', 'Frete grátis', '10% off na loja']::text[], false, 30)
on conflict (id) do nothing;

insert into public.club_periods (id, label, months, discount, note, sort_order)
values
  ('mensal', 'Mensal', 1, 0, 'Cancele quando quiser', 10),
  ('trimestral', 'Trimestral', 3, 0.05, '5% off', 20),
  ('semestral', 'Semestral', 6, 0.1, '10% off', 30)
on conflict (id) do nothing;
