// Seed en JavaScript puro: se ejecuta con "node prisma/seed.js",
// sin ts-node ni TypeScript, para evitar problemas de compilacion.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Admin inicial - cedula valida de ejemplo, cambiala en produccion
  const adminPass = await bcrypt.hash('Admin1234', 10);
  await prisma.user.upsert({
    where: { cedula: '00100000001' },
    update: {},
    create: {
      cedula: '00100000001',
      password: adminPass,
      nombre: 'Administrador',
      telefono: '8090000000',
      role: 'ADMIN',
    },
  });

  // Categorias iniciales
  const categorias = [
    { nombre: 'Empanadas', orden: 1 },
    { nombre: 'Refrescos', orden: 2 },
    { nombre: 'Batidas', orden: 3 },
    { nombre: 'Salsas', orden: 4 },
  ];
  for (const c of categorias) {
    await prisma.category.upsert({
      where: { nombre: c.nombre },
      update: {},
      create: c,
    });
  }
  const empanadasCat = await prisma.category.findUnique({
    where: { nombre: 'Empanadas' },
  });

  // Productos de ejemplo (asignados a la categoria Empanadas)
  // Solo se crean si NO existe ya un producto con ese nombre, para que
  // correr el seed varias veces no duplique productos.
  const productosBase = [
    { nombre: 'Empanada de Pollo', descripcion: 'Pollo guisado criollo', imagen: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', precio: 60, categoryId: empanadasCat.id },
    { nombre: 'Empanada de Queso', descripcion: 'Queso derretido', imagen: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', precio: 55, categoryId: empanadasCat.id },
    { nombre: 'Empanada de Carne', descripcion: 'Carne molida sazonada', imagen: 'https://images.unsplash.com/photo-1625938145312-c88c6e9eaf12?w=400', precio: 65, categoryId: empanadasCat.id },
    { nombre: 'Empanada Mixta', descripcion: 'Pollo, queso y vegetales', imagen: 'https://images.unsplash.com/photo-1568901839119-631418a3910d?w=400', precio: 70, categoryId: empanadasCat.id },
  ];
  for (const prod of productosBase) {
    const yaExiste = await prisma.product.findFirst({
      where: { nombre: prod.nombre },
    });
    if (!yaExiste) {
      await prisma.product.create({ data: prod });
    }
  }

  // Delivery de ejemplo
  await prisma.delivery.createMany({
    data: [
      { nombre: 'Juan Repartidor', telefono: '8095551111' },
      { nombre: 'Pedro Motor', telefono: '8295552222' },
    ],
    skipDuplicates: true,
  });

  // Configuracion del negocio
  await prisma.businessConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log('Seed completado. Admin: cedula 00100000001 / pass Admin1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
