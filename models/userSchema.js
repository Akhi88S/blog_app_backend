const { mongoose } = require("mongoose");
const slugify = require("slugify");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      unique: true,
    },
    userId: {
      type: String,
      unique: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
UserSchema.pre("save", function (next) {
  this.userId = slugify(this.name + "-" + this.email, { lower: true });
  next();
});

const userModel = mongoose.model("User", UserSchema);
module.exports = userModel;
