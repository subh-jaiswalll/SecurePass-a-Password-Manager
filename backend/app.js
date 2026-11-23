require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const app = express();

const connectDb = require("./utils/db.js");
const userRoutes = require("./routes/userRoute.js");
const passwordRoutes = require("./routes/PasswordRoute.js");

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);

app.use(
  morgan("combined", {
    stream: accessLogStream,
  }),
);

app.use("/api/user", userRoutes);
app.use("/api/passwords", passwordRoutes);

app.get("/", (req, res) => {
  res.send("Hi");
});

connectDb()
  .then(() => {
    console.log("Database connection is created...");

    app.listen(process.env.PORT, () =>
      console.log(`Server is running at PORT ${process.env.PORT}`),
    );
  })
  .catch((err) => {
    console.log("Database connection is failed", err);
  });
