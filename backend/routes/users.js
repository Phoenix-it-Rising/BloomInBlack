const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ GET USER
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, bio, avatar_url FROM users WHERE id = $1",
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
  }
});

// ✅ ✅ ✅ FIXED UPDATE USER (THIS IS THE KEY)
router.put("/:id", async (req, res) => {
  try {
    const { username, bio, avatar_url } = req.body;

    console.log("Updating avatar:", avatar_url?.substring(0, 50)); // debug

    const result = await pool.query(
      `
      UPDATE users
      SET username = $1,
          bio = $2,
          avatar_url = $3
      WHERE id = $4
      RETURNING id, username, bio, avatar_url
      `,
      [username, bio, avatar_url, req.params.id]
    );

    console.log("DB result:", result.rows[0]); // debug

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;