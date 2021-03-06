require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var cors = require("cors");

const User = require("./model/user");
const jobRoutes = require("./routes/job");
const userRoutes = require("./routes/user");

const auth = require("./middleware/auth");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.use(cors());

app.use("/", jobRoutes);
app.use("/", userRoutes);

app.post("/login", async (req, res, next) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY
      );

      // save user token
      // user.token = token;
      user.tokens = user.tokens.concat({ token });
      await user.save();

      // redirect user
      // res.status(201).json({ redirect: "/" });

      res.status(201).json({ token, userId: user._id });
      next();
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
    res.status(201).json({ redirect: "/login" });
  }
});

app.get("/createdTasks", auth, async (req, res) => {
  // gets a user and populates it with jobs created with user
  const user = await User.findById({ _id: req.body.id });
  await user.populate("jobs");

  res.status(201).json({ jobs: user.jobs });
});

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

// This should be the last route else any after it won't work
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: "false",
//     message: "Page not found",
//     error: {
//       statusCode: 404,
//       message: "You reached a route that is not defined on this server",
//     },
//   });
// });

module.exports = app;
