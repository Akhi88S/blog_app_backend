const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
const router = express.Router();
const postModel = require("./models/postSchemal");
const userModel = require("./models/userSchema");
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
    // console.log("posts query", req?.query);
    let posts;
    const id = req.query.id;
    const search = req.query.search;
    if (id) {
      posts = await postModel.findOne({ id: id });
    } else if (search) {
      // Use a regular expression to match the exact word "title" (case-sensitive)
      const regex = new RegExp(search);
      posts = await postModel
        .find({
          $or: [{ title: { $regex: regex } }, { desc: { $regex: regex } }],
        })
        .sort({ date: -1 });
    } else {
      posts = await postModel.find().sort({ date: -1 });
    }
    // console.log("posts data", posts);

    res.status(200).json({
      status: "Success",
      data: posts,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({
      status: "fail",
      message: e.message,
    });
  }
});

router.route("/update").patch(async (req, res) => {
  try {
    // console.log("update", req?.query?.id);

    const id = req?.query?.id;
    const payload = { ...req.body };
    payload["likes"] = Array.from(new Set([...(payload?.likes || [])]));
    const updatedPost = await postModel.findOneAndUpdate({ id: id }, payload, {
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

router.route(`/signup`).post(async (req, res) => {
  try {
    const newUser = await userModel.create(req.body);
    res.status(201).json({
      status: "Created",
      user: newUser,
    });
  } catch (error) {
    console.log("err log", error);
    let message = "";
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        message = "email already exists";
      }
      if (error.keyPattern.name) {
        message = "username already exists";
      }
    } else {
      console.log(error);
      message = error?.message;
    }
    res.status(401).json({
      status: "fail",
      message: message,
    });
  }
});

router.route("/login").post(async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDetails = await userModel.findOne({ email: email });
    console.log("user details", userDetails);
    if (userDetails && password === userDetails?.password)
      res.status(200).json({
        status: "Success",
        message: "Login successfull",
        userData: {
          name: userDetails?.name,
          email,
          id: userDetails?.id || "test_user_id",
        },
      });
    else throw Error("Unauthorized");
  } catch (e) {
    res.status(401).json({
      status: "fail",
      message: "Unauthorized",
    });
  }
});

app.use("/post", router);
app.use("/user", router);
module.exports = app;
