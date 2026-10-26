const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostLikes,
} = require("../services/posts.service");
const { parsePagination } = require("../utils/pagination");

const create = async (req, res) => {
  try {
    const { imageUrl, authorId, caption, location } = req.body || {};

    if (!imageUrl || !authorId) {
      return res
        .status(400)
        .json({ error: "imageUrl and authorId are required" });
    }

    const postData = { imageUrl, authorId: Number(authorId) };
    if (caption !== undefined) postData.caption = caption;
    if (location !== undefined) postData.location = location;

    const post = await createPost(postData);
    res.status(201).json(post);
  } catch (err) {
    if (err.code === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Failed to create post" });
  }
};

const list = async (req, res) => {
  try {
    const { sortBy, order, location, search, from, to } = req.query;

    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }

    const allowedSortBy = ["createdAt", "updatedAt", "likes"];
    if (sortBy !== undefined && !allowedSortBy.includes(sortBy)) {
      return res.status(400).json({
        error: "sortBy must be one of: createdAt, updatedAt, likes",
      });
    }

    const allowedOrder = ["asc", "desc"];
    if (order !== undefined && !allowedOrder.includes(order)) {
      return res.status(400).json({ error: "order must be asc or desc" });
    }

    if (
      (from !== undefined && isNaN(Date.parse(from))) ||
      (to !== undefined && isNaN(Date.parse(to)))
    ) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }

    const sortField = sortBy || "createdAt";
    const sortOrder = order || "desc";

    const result = await listPosts({
      page: pagination.page,
      limit: pagination.limit,
      skip: pagination.skip,
      take: pagination.take,
      sortBy: sortField,
      order: sortOrder,
      location,
      search,
      from,
      to,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

const getOne = async (req, res) => {
  try {
    const post = await getPostById(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updateData = {};

    if (req.body.caption !== undefined) updateData.caption = req.body.caption;
    if (req.body.location !== undefined) updateData.location = req.body.location;

    const updatedPost = await updatePost(id, updateData);
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deletePost(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

const getLikesHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const likes = await getPostLikes(id);

    if (likes === null) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(likes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post likes" });
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  getLikes: getLikesHandler,
};
