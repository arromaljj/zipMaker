const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const app = express();
const PORT = 3001;
const HOST = "localhost";
const indexRouter = require("./fileZip.js");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);

app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

app.listen(PORT, HOST, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
