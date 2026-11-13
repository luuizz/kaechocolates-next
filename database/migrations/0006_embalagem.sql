-- Dados da embalagem desenhada: segunda linha do painel do sabor e selo "ALTO EM"
alter table public.products
  add column package_note text check (package_note is null or length(package_note) <= 40),
  add column high_sugar boolean not null default true,
  add column high_fat boolean not null default true;

update public.products set high_sugar = false where badge = 'Zero açúcar';

update public.products set package_note = 'com café' where slug = 'cafezinho-64' and package_note is null;
