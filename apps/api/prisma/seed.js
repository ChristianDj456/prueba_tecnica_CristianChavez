const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const arls = ['SURA', 'Colmena', 'Bolívar', 'Positiva'];
  const eps  = ['SURA', 'Sanitas', 'Nueva EPS', 'Compensar'];
  const pfs  = ['Porvenir', 'Protección', 'Colfondos', 'Skandia'];

  await Promise.all(arls.map(name => prisma.arl.upsert({ where: { name }, update: {}, create: { name } })));
  await Promise.all(eps.map(name => prisma.eps.upsert({ where: { name }, update: {}, create: { name } })));
  await Promise.all(pfs.map(name => prisma.pensionFund.upsert({ where: { name }, update: {}, create: { name } })));

  const email = 'admin@local.test';
  const passwordHash = await bcrypt.hash('Admin123*', 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: passwordHash, role: 'ADMIN' }
  });

  console.log('Seed OK: catálogos + admin (admin@local.test / Admin123*)');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
