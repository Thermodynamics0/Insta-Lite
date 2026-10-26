const prisma = require("../db");
const { formatPaginationMeta } = require("../utils/pagination");

const userSummarySelect = {
  id: true,
  username: true,
  fullname: true,
};

const createPost = async (data) => {
  // Check if author exists
  const user = await prisma.user.findUnique({
    where: { id: data.authorId },
  });

  if (!user) {
    const error = new Error("User not found");
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  return await prisma.post.create({
    data,
  });
};

const listPosts = async ({
  page = 1,
  limit = 10,
  skip = 0,
  take = 10,
  sortBy = "createdAt",
  order = "desc",
  location,
  search,
  from,
  to,
} = {}) => {
  const where = {};

  if (location) {
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search) {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = new Date(from);
    }
    if (to) {
      where.createdAt.lt = new Date(to);
    }
  }

  let orderBy;
  if (sortBy === "likes") {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: "desc" },
    ];
  } else {
    orderBy = { [sortBy]: order };
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        author: {
          select: userSummarySelect,
        },
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    meta: formatPaginationMeta(page, limit, total),
  };
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: userSummarySelect,
      },
      _count: {
        select: { likes: true },
      },
    },
  });
};

const updatePost = async (id, data) => {
  return await prisma.post.update({
    where: { id },
    data,
  });
};

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id },
  });
};

const getPostLikes = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return null;
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    select: {
      user: {
        select: userSummarySelect,
      },
    },
    orderBy: {
      user: {
        username: "asc",
      },
    },
  });

  return likes.map((l) => l.user);
};

module.exports = {
  createPost,
  listPosts,
  listPost: listPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostLikes,
};
