const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    profilePicture: {
      type: String,
      required: false,
      default: "https://avatar.iran.liara.run/public",
    },
    password: {
      type: String,
      required: true,
    },
  },

  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);    

module.exports = User;