const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
const router = express.Router();
const postModel = require("./models/postmodel");
// app.use((req, res, next) => {
//   console.log("req and res", req.body);
//   next();
// });
app.use(cors());

router.route("/").get(async (req, res) => {
  try {
    res.send("connected");
  } catch (e) {
    res.send("not connected");
  }
});

router.route("/add").post(async (req, res) => {
  try {
    console.log("req and res newpost", req.body);

    const newPost = await postModel.create(req.body);
    res.status(201).json({
      status: "Created",
      data: newPost,
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e.message,
    });
  }
});

router.route("/get").get(async (req, res) => {
  try {
    console.log("posts query", req?.query?.id);
    let posts;
    const id = req.query.id;

    if (id) {
      posts = await postModel.findOne({ id: id });
    } else posts = await postModel.find();
    console.log("posts data", posts);

    res.status(200).json({
      status: "Success",
      data: posts,
    });
  } catch (e) {
    res.status(404).json({
      status: "fail",
      message: e.message,
    });
  }
});

router.route("/update").patch(async (req, res) => {
  try {
    console.log("update", req?.query?.id);

    const id = req?.query?.id;
    const updatedPost = await postModel.findOneAndUpdate({ id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: updatedPost,
    });
  } catch (e) {
    console.log("err", e);
    res.status(400).json({
      status: "fail",
      message: e,
    });
  }
});

router.route("/delete").delete(async (req, res) => {
  try {
    console.log("delete id", req.query.id);
    const posts = await postModel.findOneAndDelete({ id: req.query.id });
    res.status(200).json({
      status: "success",
      data: posts,
    });
  } catch (e) {
    console.log("err", e);
    res.status(404).json({
      status: "fail",
      message: e,
    });
  }
});

app.use("/post", router);
module.exports = app;
