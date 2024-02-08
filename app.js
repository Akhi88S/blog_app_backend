const express = require("express");
const axios = require("axios");
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

router.route("/generate-random-pickuplines").get(async (req, res) => {
  try {
    const response = await axios.get(process.env.API);

    res.status(200).json({
      status: "Success",
      data: response.data,
    });
  } catch (e) {
    console.log("err", e);
    res.status(404).json({
      status: "fail",
      message: res.data,
    });
  }
});

router.route("/generate-reply").get(async (req, res) => {
  try {
    const userInput = req.query.userInput;
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      messages: [
        {
          role: "system",
          content:
            "You're an assistant that behaves like a love guru who gives very short and quirk",
        },
        { role: "user", content: userInput },
      ],
    };

    const completionsRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      }
    );

    const response = await completionsRes.json();
    res.status(200).json({
      status: "Success",
      data: response.choices[0].message.content,
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e.message,
    });
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
app.use("/utility", router);
app.use("/", router);
module.exports = app;
