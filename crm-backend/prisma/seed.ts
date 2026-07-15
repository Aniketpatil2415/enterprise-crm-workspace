import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. अपना सही Firebase UID यहाँ डाल
  const myFirebaseUid = 'FIREBASE_UID_YAHAN_DAL'; 

  // 2. Prisma को बताओ कि हम firebaseUid से यूज़र ढूँढ रहे हैं
  const admin = await prisma.user.update({
    where: { firebaseUid: myFirebaseUid }, 
    data: { isSuperAdmin: true },
  });

  console.log('✅ God Mode Activated for:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });