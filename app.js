if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: {origin: "*"}})

const userRoutes = require("./routes/users");
const mainPagesRoutes = require("./routes/mainPages");
const dashboardRoutes = require("./routes/dashboard");
const hubRoutes = require("./routes/hubs");
const profileRoutes = require("./routes/profiles");
const HubsController = require("./controllers/hubs");

const MongoDBStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/FloraView";

const corsOptions ={
  origin:'http://strawberry-custard-75142.herokuapp.com', 
  methods:['GET','POST'],
  credentials:true,       
  optionSuccessStatus:200,
}

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(methodOverride("_method"));
app.use(cors(corsOptions))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes which should handle requests
app.use("/", userRoutes);
app.use("/", mainPagesRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/hubs", hubRoutes);
app.use("/profiles", profileRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Serving on port ${port}`);
});

io.on('connection', function(socket) {
  HubsController.respond(socket)
})
