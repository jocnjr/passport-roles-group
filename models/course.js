const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const courseSchema = new Schema({
  title: String,
  leadTeacher: String,
  startDate: Date,
  endDate: Date,
  TAs: String,
  courseImg: String,
  description: String,
  status: {type: String, enum: ['ON', 'OFF']}
}, {
  timestamps: true
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;