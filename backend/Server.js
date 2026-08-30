const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");

app.use("/users", userRoutes);
app.use("/posts", postRoutes);



app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});