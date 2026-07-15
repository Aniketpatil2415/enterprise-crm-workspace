import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 🔥 अपनी वो एग्ज़ैक्ट ईमेल डाल जिससे तूने CRM में साइन अप किया है
  const adminEmail = 'founder@fusionbyte.com'; // Change this to your exact email

  const admin = await prisma.user.update({
    where: { email: adminEmail },
    data: { isSuperAdmin: true },
  });

  console.log('✅ God Mode Activated for:', admin.email);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });