import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
      role: Role.ADMIN,
    },
  });

  // Productos de ejemplo
  await prisma.product.createMany({
    data: [
      { nombre: 'Empanada de Pollo', descripcion: 'Pollo guisado criollo', imagen: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', precio: 60 },
      { nombre: 'Empanada de Queso', descripcion: 'Queso derretido', imagen: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', precio: 55 },
      { nombre: 'Empanada de Carne', descripcion: 'Carne molida sazonada', imagen: 'https://images.unsplash.com/photo-1625938145312-c88c6e9eaf12?w=400', precio: 65 },
      { nombre: 'Empanada Mixta', descripcion: 'Pollo, queso y vegetales', imagen: 'https://images.unsplash.com/photo-1568901839119-631418a3910d?w=400', precio: 70 },
    ],
    skipDuplicates: true,
  });

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
