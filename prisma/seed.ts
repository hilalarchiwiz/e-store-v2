import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding banners...');

    const banners = [
        {
            order: 1,
            type: 'HERO',
            title: "Apple iPhone 14 Plus",
            description: "iPhone 14 has the same superspeedy chip that's in iPhone 13 Pro, A15 Bionic, with a 5-core GPU, powers all the latest features.",
            buttonText: "Buy Now",
            link: "/products/iphone-14-plus",
            imageUrl: "https://your-storage.com/iphone-14.png",
            bgColor: "#f2f4f7", // Light grey/blue
            isActive: true,
        },
        {
            order: 2,
            type: 'PROMO_HALF',
            title: "Foldable Motorised Treadmill",
            description: "Workout At Home",
            buttonText: "Grab Now",
            link: "/category/fitness",
            imageUrl: "https://your-storage.com/treadmill.png",
            bgColor: "#e0f2f1", // Light teal
            isActive: true,
        },
        {
            order: 3,
            type: 'PROMO_HALF',
            title: "Apple Watch Ultra",
            description: "The aerospace-grade titanium case strikes the perfect balance of everything.",
            buttonText: "Buy Now",
            link: "/products/apple-watch-ultra",
            imageUrl: "https://your-storage.com/apple-watch.png",
            bgColor: "#fef1e8", // Light peach/orange
            isActive: true,
        },
    ];

    for (const banner of banners) {
        await prisma.banner.upsert({
            where: { id: banner.order }, // Using order as a temporary ID reference for seeding
            update: banner,
            create: banner,
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });