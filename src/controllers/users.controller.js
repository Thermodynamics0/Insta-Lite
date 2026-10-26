const {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
} = require("../services/users.service");
const { parsePagination } = require("../utils/pagination");

const create = async (req, res) => {
  try {
    const { username, email, fullname, bio, isPrivate } = req.body || {};

    if (!username || !email || !fullname) {
      return res
        .status(400)
        .json({ error: "username, email and fullname are required" });
    }

    const userData = { username, email, fullname };
    if (bio !== undefined) {
      userData.bio = bio;
    }
    if (isPrivate !== undefined) {
      userData.isPrivate = isPrivate;
    }

    const result = await createUser(userData);
    res.status(201).json(result);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "username or email already taken" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const list = async (req, res) => {
  try {
    const { sortBy, order, isPrivate, search, hasPosts } = req.query;

    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const allowedSortBy = ["createdAt", "username", "fullname"];
    if (sortBy !== undefined && !allowedSortBy.includes(sortBy)) {
      return res.status(400).json({
        error: "sortBy must be one of: createdAt, username, fullname",
      });
    }

    const allowedOrder = ["asc", "desc"];
    if (order !== undefined && !allowedOrder.includes(order)) {
      return res.status(400).json({ error: "order must be asc or desc" });
    }

    if (isPrivate !== undefined && isPrivate !== "true" && isPrivate !== "false") {
      return res.status(400).json({ error: "isPrivate must be true or false" });
    }

    if (hasPosts !== undefined && hasPosts !== "true" && hasPosts !== "false") {
      return res.status(400).json({ error: "hasPosts must be true or false" });
    }

    const sortField = sortBy || "createdAt";
    const sortOrder = order || "desc";
    const isPrivateBool =
      isPrivate !== undefined ? isPrivate === "true" : undefined;
    const hasPostsBool =
      hasPosts !== undefined ? hasPosts === "true" : undefined;

    const result = await listUsers({
      page: pagination.page,
      limit: pagination.limit,
      skip: pagination.skip,
      take: pagination.take,
      sortBy: sortField,
      order: sortOrder,
      isPrivate: isPrivateBool,
      search,
      hasPosts: hasPostsBool,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getOne = async (req, res) => {
  try {
    const user = await getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = {};

    if (req.body.fullname !== undefined) updateData.fullname = req.body.fullname;
    if (req.body.bio !== undefined) updateData.bio = req.body.bio;
    if (req.body.isPrivate !== undefined) updateData.isPrivate = req.body.isPrivate;

    const updatedUser = await updateUser(id, updateData);
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteUser(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

const getUserPostsHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const result = await getUserPosts(id, {
      page: pagination.page,
      limit: pagination.limit,
      skip: pagination.skip,
      take: pagination.take,
    });

    if (result === null) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
};

const getUserLikedPostsHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const result = await getUserLikedPosts(id, {
      page: pagination.page,
      limit: pagination.limit,
      skip: pagination.skip,
      take: pagination.take,
    });

    if (result === null) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user liked posts" });
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  getUserPosts: getUserPostsHandler,
  getUserLikedPosts: getUserLikedPostsHandler,
};
