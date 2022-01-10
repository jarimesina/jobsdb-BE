const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
});

const UserDetail = mongoose.model("userDetail", UserDetailsSchema);

module.exports = UserDetail;