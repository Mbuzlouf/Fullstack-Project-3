// في هذا الملف ، قم بإعداد وحدة المستخدم (المدرس) الخاصة بك | in this file, set up your user module

// 1. قم باستيراد مكتبة moongoose | import the mongoose library
import { Schema, model } from "mongoose";
import shortId from "shortid";
const hashPassword = require("../helper");
// 2. قم بتحديد مخطط المدرس | start defining your user schema

const TeacherSchema = new Schema({
  name: String,
  birthdate: String,
  password: String,
  email: { type: String, unique: true },
  salt: String,
});

// 3. إنشاء نموذج المدرس | create  the user model
// تخزين كلمة السر بعد عمل الهاش

TeacherSchema.pre("save", async function (next) {
  this.salt = shortId.generate();
  this.password = await hashPassword(this.password, this.salt);
  next();
});

const TeacherModel = new model("teacher", TeacherSchema);

// 4. تصدير الوحدة | export the module
module.exports = TeacherModel;
