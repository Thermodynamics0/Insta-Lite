const { likePost, unlikePost } = require("../services/likes.service");

const like = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const result = await likePost(postId, Number(userId));
    res.status(201).json(result);
  } catch (err) {
    if (err.code === "POST_NOT_FOUND") {
      return res.status(404).json({ error: "Post not found" });
    }
    if (err.code === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    res.status(500).json({ error: "Failed to like post" });
  }
};

const unlike = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = Number(req.params.userId);

    await unlikePost(postId, userId);
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }
    res.status(404).json({ error: "Like not found" });
  }
};

module.exports = {
  like,
  unlike,
};
