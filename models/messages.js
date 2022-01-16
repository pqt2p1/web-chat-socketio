const mongoose = require("mongoose");
const msgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Msg = mongoose.model("msg", msgSchema);
module.exports = Msg;
