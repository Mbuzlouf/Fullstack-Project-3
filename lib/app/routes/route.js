"use strict";

require("core-js/modules/web.dom.iterable.js");

var joi = _interopRequireWildcard(require("@hapi/joi"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _helper = _interopRequireDefault(require("../helper"));

var _Teacher = _interopRequireDefault(require("../models/Teacher"));

var _Student = _interopRequireDefault(require("../models/Student"));

var _crypto = require("crypto");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const setupRouts = app => {
  app.get("/students", async (req, res) => {
    const conditions = {};

    try {
      const token = req.headers.authorization;

      if (!token) {
        res.statusCode = 401;
        res.send("You have no permissions");
        return;
      }

      const decodedToken = _jsonwebtoken.default.decode(token);

      const user = await _Teacher.default.findById(decodedToken.sub);

      if (!user) {
        res.statusCode = 401;
        res.send("You have no permissions");
        return;
      }

      _jsonwebtoken.default.verify(token, user.salt);
    } catch (error) {
      res.statusCode = 401;
      res.send(error.message);
    }

    const students = await _Student.default.find(conditions);
    res.send(students);
  });
  app.get("/students/:id", async (req, res) => {
    const conditions = {};

    if (req.params.id) {
      conditions.id = {
        $in: req.params.id
      };
      const studentId = await _Student.default.findById(req.params.id);
      res.send(studentId);
    }
  });
  app.get("*", (req, res) => {
    res.send("You wrote an invalid URL");
  }); // POSTS
  //   Teacher Register

  app.post("/teacher/register", async (req, res) => {
    const {
      name,
      email,
      password,
      birthdate
    } = req.body;
    const MySchema = joi.object({
      email: joi.string().email().required(),
      name: joi.string().required(),
      password: joi.string().min(6).required(),
      birthdate: joi.string().required()
    });
    const validationResult = MySchema.validate(req.body);

    if (validationResult.error) {
      res.statusCode = 400;
      res.send(validationResult.error.details[0].message);
      return;
    }

    try {
      const newTeacher = new _Teacher.default({
        name,
        birthdate,
        email,
        password
      });
      await newTeacher.save();
      res.send(newTeacher);
    } catch (error) {
      res.statusCode = 400;
      res.send(error.message);
    }
  }); // Student Register

  app.post("/student/register", async (req, res) => {
    const {
      name,
      email,
      city,
      birthdate
    } = req.body;
    const MySchema = joi.object({
      email: joi.string().email(),
      name: joi.string().required(),
      city: joi.string().required(),
      birthdate: joi.string().required()
    });
    const validationResult = MySchema.validate(req.body);

    if (validationResult.error) {
      res.statusCode = 400;
      res.send(validationResult.error.details[0].message);
      return;
    }

    try {
      const newStudent = new _Student.default({
        name,
        birthdate,
        city,
        email
      });
      await newStudent.save();
      res.send(newStudent);
    } catch (error) {
      res.statusCode = 400;
      res.send(error.message);
    }
  }); //   Teacher Login

  app.post("/teacher/login", async (req, res) => {
    const {
      email,
      password
    } = req.body;
    const teacher = await _Teacher.default.findOne({
      email
    });

    if (!teacher) {
      res.statusCode = 401;
      res.send("No user Found!");
    } else {
      if (teacher.password === (0, _helper.default)(password, teacher.salt)) {
        const token = _jsonwebtoken.default.sign({
          sub: teacher._id
        }, teacher.salt, {
          expiresIn: 300000000000000000000000000000000
        });

        res.send(token);
      } else {
        res.statusCode = 401;
        res.send("Password is WRONG!");
      }
    }
  }); // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  //PUTS
  //   Teacher Edit

  app.put("/teacher/:id", async (req, res) => {
    const {
      id
    } = req.params;
    const teacher = await _Teacher.default.findById(id);

    if (!teacher) {
      res.statusCode = 400;
      res.send("The user id is invalid");
    } else {
      const {
        birthdate,
        name,
        email
      } = req.body;

      if (email || birthdate || name) {
        teacher.birthdate = birthdate;
        teacher.email = email;
        teacher.name = name;
        teacher.save();
      }

      res.send(teacher);
    }
  }); //   Student Edit

  app.put("/student/:id", async (req, res) => {
    const {
      id
    } = req.params;
    const student = await _Student.default.findById(id);

    if (!student) {
      res.statusCode = 400;
      res.send("The user id is invalid");
    } else {
      const {
        birthdate,
        name,
        city
      } = req.body;

      if (city || birthdate || name) {
        student.birthdate = birthdate;
        student.city = city;
        student.name = name;
        student.save();
      }

      res.send(student);
    }
  }); // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
  //DELETE

  app.delete("/delete/:id", async (req, res) => {
    const {
      id
    } = req.params;
    const student = await _Student.default.deleteOne({
      _id: id
    });
    res.send("You successfully deleted your account");
  }); // /////////////////////////////////////////////////////////
  // /////////////////////////////////////////////////////////
}; // 3. تصدير الوحدة | export the module


module.exports = setupRouts;