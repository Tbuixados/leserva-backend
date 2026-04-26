import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import {
  Category,
  CategoryType,
} from '../../categories/entities/category.entity';

config();

const categories = [
  {
    name: 'Peluquería',
    slug: 'peluqueria',
    type: CategoryType.BEAUTY,
    icon: 'scissors',
  },
  {
    name: 'Barbería',
    slug: 'barberia',
    type: CategoryType.BEAUTY,
    icon: 'razor',
  },
  {
    name: 'Manicura y uñas',
    slug: 'manicura',
    type: CategoryType.BEAUTY,
    icon: 'sparkles',
  },
  {
    name: 'Pedicura',
    slug: 'pedicura',
    type: CategoryType.BEAUTY,
    icon: 'footprints',
  },
  {
    name: 'Depilación',
    slug: 'depilacion',
    type: CategoryType.BEAUTY,
    icon: 'feather',
  },
  {
    name: 'Cejas y pestañas',
    slug: 'cejas-pestanas',
    type: CategoryType.BEAUTY,
    icon: 'eye',
  },
  {
    name: 'Centro de estética',
    slug: 'estetica',
    type: CategoryType.BEAUTY,
    icon: 'star',
  },
  {
    name: 'Limpieza de cutis',
    slug: 'limpieza-cutis',
    type: CategoryType.BEAUTY,
    icon: 'droplet',
  },
  {
    name: 'Maquillaje',
    slug: 'maquillaje',
    type: CategoryType.BEAUTY,
    icon: 'palette',
  },
  {
    name: 'Micropigmentación',
    slug: 'micropigmentacion',
    type: CategoryType.BEAUTY,
    icon: 'edit',
  },
  { name: 'Masajes', slug: 'masajes', type: CategoryType.BEAUTY, icon: 'hand' },
  { name: 'Spa', slug: 'spa', type: CategoryType.BEAUTY, icon: 'leaf' },
  {
    name: 'Bronceado',
    slug: 'bronceado',
    type: CategoryType.BEAUTY,
    icon: 'sun',
  },
  {
    name: 'Tatuajes',
    slug: 'tatuajes',
    type: CategoryType.BEAUTY,
    icon: 'pen',
  },
  {
    name: 'Piercing',
    slug: 'piercing',
    type: CategoryType.BEAUTY,
    icon: 'circle',
  },
  {
    name: 'Podología',
    slug: 'podologia',
    type: CategoryType.BEAUTY,
    icon: 'activity',
  },
];

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Category],
});

async function seed() {
  await dataSource.initialize();

  const repo = dataSource.getRepository(Category);
  const existing = await repo.count();

  if (existing > 0) {
    console.log('Las categorías ya existen, saltando seeder.');
    await dataSource.destroy();
    return;
  }

  await repo.save(categories);
  console.log(`✅ ${categories.length} categorías insertadas correctamente.`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error en el seeder:', err);
  process.exit(1);
});
