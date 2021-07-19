import * as joi from "@hapi/joi";
import jwt from "jsonwebtoken";
import hashPassword from "../helper";
import TeacherModel from "../models/Teacher";
import StudentModel from "../models/Student";
import { verify } from "crypto";

const setupRouts = (app) => {
  app.get("/students", async (req, res) => {
    const conditions = {};

    try {
      const token = req.headers.authorization;

      if (!token) {
        res.statusCode = 401;
        res.send("You have no permissions");
        return;
      }

      const decodedToken = jwt.decode(token);
      const user = await TeacherModel.findById(decodedToken.sub);

      if (!user) {
        res.statusCode = 401;
        res.send("You have no permissions");
        return;
      }
      jwt.verify(token, user.salt);
    } catch (error) {
      res.statusCode = 401;
      res.send(error.message);
    }

    const students = await StudentModel.find(conditions);
    res.send(students);
  });

  app.get("/students/:id", async (req, res) => {
    const conditions = {};
    if (req.params.id) {
      conditions.id = { $in: req.params.id };
      const studentId = await StudentModel.findById(req.params.id);
      res.send(studentId);
    }
  });

  app.get("*", (req, res) => {
    res.send("You wrote an invalid URL");
  });
  // POSTS

  //   Teacher Register
  app.post("/teacher/register", async (req, res) => {
    const { name, email, password, birthdate } = req.body;
    const MySchema = joi.object({
      email: joi.string().email().required(),
      name: joi.string().required(),
      password: joi.string().min(6).required(),
      birthdate: joi.string().required(),
    });

    const validationResult = MySchema.validate(req.body);
    if (validationResult.error) {
      res.statusCode = 400;
      res.send(validationResult.error.details[0].message);
      return;
    }
    try {
      const newTeacher = new TeacherModel({
        name,
        birthdate,
        email,
        password,
      });
      await newTeacher.save();
      res.send(newTeacher);
    } catch (error) {
      res.statusCode = 400;
      res.send(error.message);
    }
  });

  // Student Register
  app.post("/student/register", async (req, res) => {
    const { name, email, city, birthdate } = req.body;
    const MySchema = joi.object({
      email: joi.string().email(),
      name: joi.string().required(),
      city: joi.string().required(),
      birthdate: joi.string().required(),
    });

    const validationResult = MySchema.validate(req.body);
    if (validationResult.error) {
      res.statusCode = 400;
      res.send(validationResult.error.details[0].message);
      return;
    }
    try {
      const newStudent = new StudentModel({
        name,
        birthdate,
        city,
        email,
      });
      await newStudent.save();
      res.send(newStudent);
    } catch (error) {
      res.statusCode = 400;
      res.send(error.message);
    }
  });

  //   Teacher Login
  app.post("/teacher/login", async (req, res) => {
    const { email, password } = req.body;
    const teacher = await TeacherModel.findOne({ email });
    if (!teacher) {
      res.statusCode = 401;
      res.send("No user Found!");
    } else {
      if (teacher.password === hashPassword(password, teacher.salt)) {
        const token = jwt.sign({ sub: teacher._id }, teacher.salt, {
          expiresIn: 300000000000000000000000000000000,
        });
        res.send(token);
      } else {
        res.statusCode = 401;
        res.send("Password is WRONG!");
      }
    }
  });
  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////

  //PUTS

  //   Teacher Edit
  app.put("/teacher/:id", async (req, res) => {
    const { id } = req.params;
    const teacher = await TeacherModel.findById(id);
    if (!teacher) {
      res.statusCode = 400;
      res.send(`The user id is invalid`);
    } else {
      const { birthdate, name, email } = req.body;
      if (email || birthdate || name) {
        teacher.birthdate = birthdate;
        teacher.email = email;
        teacher.name = name;

        teacher.save();
      }
      res.send(teacher);
    }
  });

  //   Student Edit
  app.put("/student/:id", async (req, res) => {
    const { id } = req.params;
    const student = await StudentModel.findById(id);
    if (!student) {
      res.statusCode = 400;
      res.send(`The user id is invalid`);
    } else {
      const { birthdate, name, city } = req.body;

      if (city || birthdate || name) {
        student.birthdate = birthdate;
        student.city = city;
        student.name = name;

        student.save();
      }
      res.send(student);
    }
  });
  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////

  //DELETE
  app.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    const student = await StudentModel.deleteOne({ _id: id });
    res.send("You successfully deleted your account");
  });
  // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
};

// 3. تصدير الوحدة | export the module
module.exports = setupRouts;
