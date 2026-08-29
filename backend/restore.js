require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function restore() {
  await prisma.systemSetting.upsert({
    where: { id: 'global' },
    update: {
      aboutUsText: 'متجر طيب هو المتجر الإلكتروني الأول في اليمن المتخصص ببيع العطور الأصلية فقط بأسعار أقل من الموقع الرسمي مع ضمان الأصالة وتوصيل سريع لجميع المحافظات',
      contactEmail: 'Teeb_Store@gmail.com',
      contactPhone: '+967 774405120',
      facebookUrl: '',
      twitterUrl: '',
      whatsappUrl: '',
      instagramUrl: '',
      shippingOfferText: 'شحن مجاني للطلبات فوق 200 ر س ',
      seoTitle: 'طيب للعطور | عطور أصلية وفاخرة في اليمن',
      seoDescription: 'متجر طيب - أروع العطور الفاخرة التي تلبي كافة الأذواق وتضفي لمسة من الأناقة على إطلالتك.',
      enableDarkModeToggle: true
    },
    create: {
      id: 'global',
      aboutUsText: 'متجر طيب هو المتجر الإلكتروني الأول في اليمن المتخصص ببيع العطور الأصلية فقط بأسعار أقل من الموقع الرسمي مع ضمان الأصالة وتوصيل سريع لجميع المحافظات',
      contactPhone: '+967 774405120',
      facebookUrl: '',
      twitterUrl: '',
      whatsappUrl: '',
      instagramUrl: '',
      shippingOfferText: 'شحن مجاني للطلبات فوق 200 ر س ',
      seoTitle: 'طيب للعطور | عطور أصلية وفاخرة في اليمن',
      seoDescription: 'متجر طيب - أروع العطور الفاخرة التي تلبي كافة الأذواق وتضفي لمسة من الأناقة على إطلالتك.',
    }
  });
  console.log('Restored');
}
restore().finally(() => prisma.$disconnect());
