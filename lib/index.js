"use strict";

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _route = _interopRequireDefault(require("./app/routes/route"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  استيراد المكتبات المطلوبة | import the required libraries
//  تأكد من تنزيل الوحدات المطلوبة | make sure to download the required modules
// لا تنسى تحديد وظيفة الخادم | don't forget to define the server function that listens to requests
const start = async () => {
  try {
    await _mongoose.default.connect("mongodb://localhost/Project3", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log("Connected to DB! Let's create an app");
    const app = (0, _express.default)();
    app.use(_bodyParser.default.urlencoded({
      extended: true
    }));
    app.use(_bodyParser.default.json());
    console.log("App is created! let's setup routes");
    (0, _route.default)(app);
    console.log("App routes are added! Let's listen on 7000");
    app.listen(7000);
  } catch (error) {
    console.error(err);
  }
};

start();