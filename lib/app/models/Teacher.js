"use strict";

var _mongoose = require("mongoose");

var _shortid = _interopRequireDefault(require("shortid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// في هذا الملف ، قم بإعداد وحدة المستخدم (المدرس) الخاصة بك | in this file, set up your user module
// 1. قم باستيراد مكتبة moongoose | import the mongoose library
const hashPassword = require("../helper"); // 2. قم بتحديد مخطط المدرس | start defining your user schema


const TeacherSchema = new _mongoose.Schema({
  name: String,
  birthdate: String,
  password: String,
  email: {
    type: String,
    unique: true
  },
  salt: String
}); // 3. إنشاء نموذج المدرس | create  the user model
// تخزين كلمة السر بعد عمل الهاش

TeacherSchema.pre("save", async function (next) {
  this.salt = _shortid.default.generate();
  this.password = await hashPassword(this.password, this.salt);
  next();
});
const TeacherModel = new _mongoose.model("teacher", TeacherSchema); // 4. تصدير الوحدة | export the module

module.exports = TeacherModel;