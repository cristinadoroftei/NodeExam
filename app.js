const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require('csurf')
const flash = require('connect-flash');
const multer = require('multer');
const crypto = require("crypto")


const path = require("path");

const MONGODB_URI = "mongodb+srv://cristina:Poison123239@cluster0-ndbei.mongodb.net/shop?retryWrites=true&w=majority"

const app = express();
const server = require('http').createServer(app);

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

//destination and filename are 2 functions which will be called for every incoming file 
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  filename: (req, file, callback) => {
    const fileName = crypto.randomBytes(10).toString("hex")
    const extension = file.mimetype.split('/').pop();
    callback(null, fileName + "." + extension);
  }
})

const fileFilter = (req, file, callback) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
    callback(null, true);
  } else {
    callback(null, false);
  }


}

const rootDir = require("./util/path.js");

const adminRoutes = require("./routes/admin.js");
const shopRoutes = require("./routes/shop.js");
const authRoutes = require("./routes/auth.js");

const errorsController = require("./controllers/errors.js");

const User = require("./models/user.js");

app.use(express.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))


app.use(express.static(path.join(rootDir, "public")));
app.use('/images',express.static(path.join(rootDir, "images")));
app.use(
  session({
    //signing the hash which stores our id in the cookie
    secret: "my secret",
    //the session will not be saved on every request that is done, but only if something changes to the session
    resave: false,
    //ensure that no session gets saved for a request where it doesn't need to be saved
    saveUninitialized: false,
    //where the session will be stored in the database
    store: store
     })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res,next) => {
  //set local variables that are passed into the views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})



//middleware created because, otherwise, /addToCart would not work, because .populate() is a function provided by Mongoose.
//the user saved in the req.session.user it is retrieved from the MongoDB, but is NOT a Mongoose object.
//in req.user we will have a Mongoose model user
app.use((req,res, next) =>  {
  //throw new Error("Sync Dummy") -> this works because we are outside async code and express will detect this and execute the next() error handling middleware
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then((user) => {
    if(!user) {
      return next();
    }
      req.user = user;
      next();
  })
  .catch((err) => {
    //throw new Error(err) -> this does NOT work here because we are inside an async code
    next(new Error(err))
  });
})




app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.set("view engine", "ejs");
app.set("views", "views");



app.get('/500', errorsController.get500);

app.use(errorsController.getPageNotFound);

app.use((error, req, res, next) => {
  res.redirect("/500")
})

mongoose
  .connect(
    MONGODB_URI
  )
  .then((result) => {
    //if you leave findOne()  without any argument, the method will return the first user it finds
    server.listen(3000);
    console.log("Connected!");

    const io = require('socket.io')(server)

    const users = {}
    //everytime a user loads our website, this is going to be called
    io.on('connection', socket => {
      socket.on('new-user', name => {
        users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
      })
      socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message',{ message: message, name: users[socket.id] })
      })
      socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id]
      })

    })
  })
  .catch((err) => {
    console.log(err);
  });
