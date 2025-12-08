const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    lib: {
      type: String,
      required: true,
      unique: true,
      upercase: true,
      trim: true,
    },

    permissions: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: false,
      trim: true,
    },
  },

  { timestamps: true, versionKey: false }
);

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;