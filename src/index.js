//  استيراد المكتبات المطلوبة | import the required libraries
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import setupRouts from "./app/routes/route";
//  تأكد من تنزيل الوحدات المطلوبة | make sure to download the required modules

// لا تنسى تحديد وظيفة الخادم | don't forget to define the server function that listens to requests
const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost/Project3", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to DB! Let's create an app");
    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    console.log("App is created! let's setup routes");
    setupRouts(app);
    console.log("App routes are added! Let's listen on 7000");
    app.listen(7000);
  } catch (error) {
    console.error(err);
  }
};
start();
