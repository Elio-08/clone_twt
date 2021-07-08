const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passportLocal = require("passport-local").Strategy;

const app = express();
var data = require('./data.js');

passport.use(new passportLocal(function(username, password, done){
    const userInfo = data.users.find(x => (x.usuario === username || x.correo === username) && x.password === password);
    if (userInfo !== undefined)
    return done(null, {id: userInfo.id});
}));
passport.serializeUser(function(user, done){
  done(null,user.id);
});
passport.deserializeUser(function(id, done){
  const userInfo = data.users.find(x => x.id === id);
  done(null, userInfo);
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(data.wordSecret));
app.use(session({
    secret: data.wordSecret,
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res, next)=>{ 
  if (req.isAuthenticated()) return next();

  res.redirect("/login");
}, (req, res)=>{
  res.redirect("home");
});


app.get("/login", (req, res)=>{

res.render("login", { msgError: '', username: '' });

});


app.post("/login", (req, res, next)=>{ 
   
  const {username, password} = req.body;
  let msgError = '';
  
  if (!data.users.find(x => (x.usuario === username || x.correo === username)))
  {
    msgError = 'Usuario no registrado';
  }
  else if (!data.users.find(x => (x.usuario === username || x.correo === username) && x.password === password))
  {
    msgError = 'La constraseña es incorrecta';
  }
  
  if (msgError.length > 0){
   return res.render("login", { msgError: msgError, username: username });
  }

  data.loginLogs.push({ usuario: username, 
                        sesion_inicio: data.formatDate(new Date()), 
                        sesion_final: null });
  next();

}, passport.authenticate('local',{
    successRedirect: "/",
    failureRedirect: "/login"
}));

app.get("/register", (req, res)=>{

  res.render("register", { msgError: '', 
                           form:{ user: '',
                                  username: '',
                                  email: '',
                                  password: '',
                                  passwordC: '' }});
    
});
    
    
app.post("/register", (req, res)=>{
   
  const {user,
         username,
         email,
         password,
         passwordC} = req.body;

  let msgError= '';

  if (password !== passwordC)
  {
    msgError = "Las contraseñas no coinciden";
  }
  else if (data.users.length > 0 && data.users.find(x => x.usuario === user))
  {
    msgError = "El usuario ya existe";
  }
  else if (data.users.length > 0 && data.users.find(x => x.correo === email))
  {
    msgError = "El correo ya existe";
  }

  if (msgError.length > 0)
  {
    res.render("register", { msgError: msgError,  
                             form:{ user: user,
                                    username: username,
                                    email: email,
                                    password: password,
                                    passwordC: passwordC }});
     return;
  }
  
  const newUser = { "id": data.users.length > 0 ? data.users[data.users.length - 1].id + 1 : 1,
                    "usuario": user,
                    "nombre": username,
                    "correo": email,
                    "password": password }; 

  data.users.push(newUser); 
  res.render("registerSuccessful", { msg: "Felicidades " + user + ", ahora está registrado(a) en Twiterx©"});
    
});

app.post("/registerSuccessful", (req, res)=>{ 

res.redirect("login");

});

app.get("/home", (req, res)=>{
   
  if (req.isAuthenticated())
  return res.render("home", { user: req.user.usuario, 
                              tweets: data.tweets }); 
    
  res.redirect("/login");
});

app.post("/home", (req, res)=>{

   const {texto} = req.body;

   if (texto.trim().length > 0){
    
    let newTweet = {
      usuario: req.user.usuario,
      texto: texto,
      fecha: data.formatDate(new Date())
    }
    
    data.tweets.splice(0,0,newTweet); 
   }

   res.render("home", { user: req.user.usuario, 
                        tweets: data.tweets });

});

app.get("/home/logout", (req, res)=>{
  

  data.loginLogs.map((i)=>{

    if (i.usuario === req.user.usuario && i.sesion_final === null)
    i.sesion_final = data.formatDate(new Date());

    return i;
  })

  req.logout(); console.log(data.loginLogs);
  res.redirect('/');

});

app.listen("4000", ()=> console.log("Servidor iniciado"))