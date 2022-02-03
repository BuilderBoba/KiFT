var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// var url = require("url");
// var queryData = url.parse("https://ipfs.io/ipfs/QmcSDaUtxdug64dGrbjrnqnpyLgLWEjWYL5UoUYwtnXAtU", true);
// console.log(queryData);

const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://kiftmaster:root1234@kift.q7pbt.mongodb.net/testDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(app.get("port"), () => {
      console.log(`app is listening in http://localhost:${app.get("port")}`);
    });
  })
  .catch((err) => console.log(err));

var indexRouter = require("./routes/index");
const klaytnRouter = require("./routes/klaytnRouter");

var app = express();
const port = 80;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
``;
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/klaytn", klaytnRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use((req, res) => {
  res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.set("port", port);

module.exports = app;
