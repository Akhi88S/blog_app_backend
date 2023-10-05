const { mongoose } = require("mongoose");
const slugify = require("slugify");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    id: {
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
  this.id = slugify(this.name + parseInt(Date.now() + Math.random()), {
    lower: true,
  });
  next();
});

const userModel = mongoose.model("User", UserSchema);
module.exports = userModel;
