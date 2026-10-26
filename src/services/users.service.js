const prisma = require("../db");
const { formatPaginationMeta } = require("../utils/pagination");

const userSummarySelect = {
  id: true,
  username: true,
  fullname: true,
};

const createUser = async (data) => {
  return await prisma.user.create({
    data,
  });
};

const listUsers = async ({
  page = 1,
  limit = 10,
  skip = 0,
  take = 10,
  sortBy = "createdAt",
  order = "desc",
  isPrivate,
  search,
  hasPosts,
} = {}) => {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (hasPosts !== undefined) {
    where.posts = hasPosts ? { some: {} } : { none: {} };
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: formatPaginationMeta(page, limit, total),
  };
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true, likes: true },
      },
    },
  });
};

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

const getUserPosts = async (userId, { page = 1, limit = 10, skip = 0, take = 10 } = {}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const where = { authorId: userId };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
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

const getUserLikedPosts = async (userId, { page = 1, limit = 10, skip = 0, take = 10 } = {}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const where = {
    likes: {
      some: {
        userId,
      },
    },
  };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

module.exports = {
  createUser,
  listUsers,
  listUser: listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
};
