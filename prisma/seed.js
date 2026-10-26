const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function main() {
  // 1. Delete all rows: children first (likes -> posts -> users)
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create all users in one query and get created rows back
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users,
  });

  // 3. Build lookup: username -> id
  const userMap = new Map(createdUsers.map((u) => [u.username, u.id]));

  // 4. Create all posts in one query replacing author with authorId
  const postsToCreate = posts.map((p) => ({
    imageUrl: p.imageUrl,
    caption: p.caption,
    location: p.location,
    authorId: userMap.get(p.author),
    createdAt: p.createdAt,
  }));

  const createdPosts = await prisma.post.createManyAndReturn({
    data: postsToCreate,
  });

  // 5. Build lookup: insta## -> post id
  const postMap = new Map(
    createdPosts.map((p) => [p.imageUrl.split("/")[4], p.id])
  );

  // 6. Create all likes in one query
  const likesToCreate = likes.map((l) => ({
    userId: userMap.get(l.user),
    postId: postMap.get(l.post),
  }));

  const createdLikes = await prisma.like.createMany({
    data: likesToCreate,
  });

  // 7. Print counts
  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
