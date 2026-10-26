const express = require("express");
const router = express.Router();
const {
  create,
  list,
  getOne,
  update,
  remove,
  getLikes,
} = require("../controllers/posts.controller");
const { like, unlike } = require("../controllers/likes.controller");

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

// Likes routes
router.get("/:id/likes", getLikes);
router.post("/:id/likes", like);
router.delete("/:id/likes/:userId", unlike);

module.exports = router;
