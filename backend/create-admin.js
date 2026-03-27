const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const emailInput = 'bdalrhmnaljdy395@gmail.com'; // Added @gmail.com for valid email login format
  const passwordInput = 'Ghoomaan';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordInput, salt);

  try {
    const adminUser = await prisma.user.upsert({
      where: { email: emailInput },
      update: {
        passwordHash: passwordHash,
        role: 'Admin'
      },
      create: {
        fullName: 'Admin bdalrhmnaljdy',
        phoneNumber: '000000000',
        email: emailInput,
        passwordHash: passwordHash,
        role: 'Admin',
        isVerified: true,
        city: 'صنعاء'
      }
    });
    console.log('Admin user created successfully!');
    console.log('Account (Email):', adminUser.email);
    console.log('Password:', passwordInput);
    console.log('Role:', adminUser.role);
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
