import { SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(database) {
  // 1. Criação da tabela
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      flavor TEXT,
      price REAL NOT NULL,
      oldPrice REAL,
      rating REAL,
      tag TEXT,
      category TEXT,
      image TEXT
    );
  `);

    await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profileImage TEXT
    );
  `);

    // Adiciona coluna profileImage em bancos já existentes
  try {
    await database.execAsync(`ALTER TABLE users ADD COLUMN profileImage TEXT;`);
  } catch (e) {
    // Coluna já existe, ignorar
  }

  // 2. Verificação de Seed (Popula o banco se estiver vazio)
  const count = await database.getFirstAsync('SELECT COUNT(*) as total FROM products');
  
  if (count.total === 0) {
    await database.execAsync(`
      INSERT INTO products (name, flavor, price, oldPrice, rating, tag, category, image)
      VALUES 
      ('Evo Whey Isolate', 'Chocolate Belga', 249.90, 289.90, 4.9, 'ESGOTADO', 'Whey Protein', 'whey_isolate'),
      ('Whey Isolate Morango', 'Morango Silvestre', 259.90, NULL, 4.8, 'TOP 1', 'Whey Protein', 'whey_isolate_morango'),
      ('Pure Creatine Evo', '100% Monohidratada', 129.90, 159.90, 5.0, NULL, 'Creatina', 'creatina_pure'),
      ('Creatina Monohidratada', 'Pura - 300g', 110.00, NULL, 4.9, 'PROMO', 'Creatina', 'creatina_monohidratada'),
      ('Nitro Evo Pre-Workout', 'Frutos Tropicais', 189.90, NULL, 4.8, NULL, 'Pré-Treino', 'pre_treino'),
      ('Explosion Pre-Workout', 'Frutas Vermelhas', 195.00, 210.00, 4.7, 'NOVIDADE', 'Pré-Treino', 'pre_treino_explosion'),
      ('Hipercalórico Choco', 'Chocolate Suíço', 149.90, 179.90, 4.5, NULL, 'Massa', 'hipercalorico_choco'),
      ('Hipercalórico Morango', 'Morango Cream', 149.90, NULL, 4.6, NULL, 'Massa', 'hipercalorico_morango'),
      ('Evo Daily Multi-Vit 90', 'Complexo A-Z', 89.90, NULL, 4.7, 'NOVIDADE', 'Vitaminas', 'multivitaminico90'),
      ('Multivitamínico 80 Caps', 'Essencial', 75.00, 95.00, 4.6, NULL, 'Vitaminas', 'multivitaminico80'),
      ('Aminoácidos Cápsula', 'BCAA Recovery', 115.00, NULL, 4.8, NULL, 'Aminoácidos', 'aminoacidos_capsula'),
      ('Glutamina Pro', 'Pura Glutamina', 98.00, NULL, 4.9, NULL, 'Aminoácidos', 'aminoacidos_glutamina'),
      ('Vitaminas', 'Complexo A-Z', 89.90, NULL, 4.7, 'NULL', 'Vitaminas', 'vitaminas'),
      ('BCAA em Pó', 'Limão Refrescante', 105.00, 120.00, 4.7, NULL, 'Aminoácidos', 'aminoacidos_po');
    `);
    
    console.log("Banco de dados Elite Evo semeado com sucesso!");
  }
}