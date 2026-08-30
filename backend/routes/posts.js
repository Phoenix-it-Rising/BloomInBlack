const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ CREATE POST (WITH IMAGE)
router.post("/", async (req, res) => {
  try {
    const { content, user_id, image_url } = req.body;

    const result = await pool.query(
      `
      INSERT INTO posts (content, user_id, image_url)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [content, user_id, image_url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
  }
});

// ✅ GET USER POSTS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        posts.id,
        posts.content,
        posts.created_at,
        posts.user_id,
        users.username,
        users.avatar_url,
        COUNT(DISTINCT likes.id) AS like_count,
        COUNT(DISTINCT comments.id) AS comment_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON posts.id = likes.post_id
      LEFT JOIN comments ON posts.id = comments.post_id
      GROUP BY 
        posts.id,
        posts.user_id,
        users.username,
        users.avatar_url
      ORDER BY posts.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error"});
  }
});

// ✅ GET POSTS BY USER ID
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(`
      SELECT 
        posts.id,
        posts.content,
        posts.created_at,
        users.username,
        users.avatar_url,
        COUNT(likes.id) AS like_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON posts.id = likes.post_id
      WHERE posts.user_id = $1
      GROUP BY posts.id, users.username, users.avatar_url
      ORDER BY posts.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:postId/like", async (req, res) => {
  const { user_id } = req.body;
  const postId = req.params.postId;

  try {
    await pool.query(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [user_id, postId]
    );

    res.json({ message: "Post liked" });
  } catch (err) {
    console.error(err);
  }
});

router.delete("/:postId/like", async (req, res) => {
  const { user_id } = req.body;
  const postId = req.params.postId;

  try {
    await pool.query(
      `DELETE FROM likes
       WHERE user_id = $1 AND post_id = $2`,
      [user_id, postId]
    );

    res.json({ message: "Like removed" });
  } catch (err) {
    console.error(err);
  }
});

router.post("/:postId/comment", async (req, res) => {
  const { content, user_id, parent_comment_id } = req.body;

  const result = await pool.query(
    `
    INSERT INTO comments
    (content, user_id, post_id, parent_comment_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [content, user_id, req.params.postId, parent_comment_id || null]
  );

  res.json(result.rows[0]);
});

// GET COMMENTS
router.get("/:postId/comments", async (req, res) => {
  try {
    const postId = req.params.postId;

    const result = await pool.query(`
      SELECT 
        comments.id,
        comments.content,
        comments.created_at,
        comments.parent_comment_id,
        users.username,
        users.avatar_url
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at ASC
    `, [postId]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
``
