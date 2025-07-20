const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lapublica';

// Function to generate slug from firstName and lastName
function generateSlug(firstName, lastName) {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

async function generateUserSlugs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all users that don't have a slug
    const users = await usersCollection.find({ slug: { $exists: false } }).toArray();
    console.log(`Found ${users.length} users without slugs`);

    for (const user of users) {
      if (!user.firstName || !user.lastName) {
        console.log(`Skipping user ${user._id} - missing firstName or lastName`);
        continue;
      }

      let baseSlug = generateSlug(user.firstName, user.lastName);
      let slug = baseSlug;
      let counter = 1;

      // Check for existing slugs and add number if needed
      while (await usersCollection.findOne({ slug, _id: { $ne: user._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Update the user with the new slug
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { slug: slug } }
      );

      console.log(`Updated user ${user.firstName} ${user.lastName} with slug: ${slug}`);
    }

    console.log('All users updated with slugs!');
  } catch (error) {
    console.error('Error generating user slugs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
generateUserSlugs();