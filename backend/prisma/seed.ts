import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 🔄 Reset tables and restart IDs
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "Stream", 
      "TrackLike", 
      "Payout", 
      "Track", 
      "Profile", 
      "User" 
    RESTART IDENTITY CASCADE;
  `);

  // 🔐 Passwords
  const fanPassword = await bcrypt.hash('Supersecure123', 10);
  const artistPassword = await bcrypt.hash('ArtistPro456', 10);

  // 👤 Create a Fan
  const fan = await prisma.user.create({
    data: {
      email: 'fan2@example.com',
      password: fanPassword,
      role: Role.FAN,
      subscriptionActive: true,
      profile: {
        create: {
          bio: 'Test fan user for login',
          avatarUrl: 'https://i.pravatar.cc/150?u=fan2',
        },
      },
    },
  });

  // 🎤 Create an Artist and their Tracks
  const artist = await prisma.user.create({
    data: {
      email: 'artist1@example.com',
      password: artistPassword,
      role: Role.ARTIST,
      subscriptionActive: true,
      profile: {
        create: {
          bio: 'Professional test artist',
          avatarUrl: 'https://i.pravatar.cc/150?u=artist1',
        },
      },
      tracks: {
        create: [
          {
            title: 'Dreaming in Code',
            artist: 'Artist One',
            artwork: 'https://picsum.photos/seed/track1/400/400',
          },
          {
            title: 'Beats of Tomorrow',
            artist: 'Artist One',
            artwork: 'https://picsum.photos/seed/track2/400/400',
          },
        ],
      },
    },
    include: { tracks: true },
  });

  console.log('🎵 Created artist and tracks.');

  // 🎧 Simulate streams
  await prisma.stream.create({
    data: {
      trackId: artist.tracks[0].id,
      userId: fan.id,
    },
  });

  console.log('🎧 Stream created.');

  // ❤️ Fan likes the first track
  await prisma.trackLike.create({
    data: {
      trackId: artist.tracks[0].id,
      userId: fan.id,
    },
  });

  console.log('❤️ Track liked.');

  // 💰 Simulate a payout for the artist
  await prisma.payout.create({
    data: {
      artistId: artist.id,
      amount: 120.5,
    },
  });

  console.log('💰 Payout created.');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

