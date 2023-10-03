const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true, // Enforce uniqueness for slug
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    desc: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    date: {
      type: Number,
      default: Date.now(),
    },
    likes: {
      type: Array,
      default: [],
    },
    uId: {
      type: String,
      default: "user-id",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
postSchema.pre("save", function (next) {
  this.id = slugify(this.title + "-" + Date.now(), { lower: true });
  next();
});

const postModel = mongoose.model("Post", postSchema);
module.exports = postModel;
