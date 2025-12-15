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

    role : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);    

module.exports = User;