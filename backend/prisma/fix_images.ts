
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SURF_IMAGES = [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1416331108676-a22edb5be43c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
];

const AVATAR_IMAGES = [
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
];

function getRandomImage(list: string[]) {
    return list[Math.floor(Math.random() * list.length)];
}

function isBroken(url: string | null) {
    if (!url) return true;
    if (url.includes('api/images/uploads')) return true;
    if (url.includes('/uploads/')) return true;
    if (url.includes('clasedesurf.com/api')) return true;
    if (url.includes('surfschool-backend')) return true;
    return false;
}

async function main() {
    console.log('Fixing broken images...');

    // 1. Fix Classes
    const classes = await prisma.class.findMany();
    for (const cls of classes) {
        let needsUpdate = false;
        let newImages = [...(cls.images || [])];

        if (newImages.length === 0) {
            newImages = [getRandomImage(SURF_IMAGES)];
            needsUpdate = true;
        } else {
            newImages = newImages.map(img => {
                if (isBroken(img)) {
                    needsUpdate = true;
                    return getRandomImage(SURF_IMAGES);
                }
                return img;
            });
        }

        if (needsUpdate) {
            await prisma.class.update({
                where: { id: cls.id },
                data: { images: newImages },
            });
            console.log(`Fixed class: ${cls.title}`);
        }
    }

    // 2. Fix Instructors
    const instructors = await prisma.instructor.findMany();
    for (const inst of instructors) {
        if (isBroken(inst.profileImage)) {
            await prisma.instructor.update({
                where: { id: inst.id },
                data: { profileImage: getRandomImage(AVATAR_IMAGES) },
            });
            console.log(`Fixed instructor ID: ${inst.id}`);
        }
    }

    // 3. Fix Schools
    const schools = await prisma.school.findMany();
    for (const school of schools) {
        let updates: any = {};
        if (isBroken(school.logo)) updates.logo = getRandomImage(AVATAR_IMAGES);
        if (isBroken(school.coverImage)) updates.coverImage = getRandomImage(SURF_IMAGES);

        if (Object.keys(updates).length > 0) {
            await prisma.school.update({
                where: { id: school.id },
                data: updates,
            });
            console.log(`Fixed school: ${school.name}`);
        }
    }

    // 4. Fix User Profiles
    const users = await prisma.user.findMany({ where: { profilePhoto: { not: null } } });
    for (const user of users) {
        if (isBroken(user.profilePhoto)) {
            await prisma.user.update({
                where: { id: user.id },
                data: { profilePhoto: getRandomImage(AVATAR_IMAGES) }
            });
            console.log(`Fixed user: ${user.name}`);
        }
    }

    // 5. Fix Products (New)
    const products = await prisma.product.findMany();
    for (const prod of products) {
        if (isBroken(prod.image)) {
            await prisma.product.update({
                where: { id: prod.id },
                data: { image: getRandomImage(SURF_IMAGES) }
            });
            console.log(`Fixed product: ${prod.name}`);
        }
    }

    console.log('Image repair completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
