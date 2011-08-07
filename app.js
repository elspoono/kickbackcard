
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'fkd32aFD5Ssnfj$5#@$0k;' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


var error = function(err){
  console.log(err);
}


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
  error = function(){};
});







/**********************************
 * 
 * Generic Libraries Setup
 * 
 * bcrypt and mongoose
 * 
 * 
 **********************************/
var bcrypt = require('bcrypt');
var encrypted = function(inString){
  var salt = bcrypt.gen_salt_sync(10);
  var hash = bcrypt.encrypt_sync(inString, salt);
  return hash;
}
var compareEncrypted= function(inString,hash){
  return bcrypt.compare_sync(inString, hash);
}
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/db');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;








/**********************************
 * 
 * User Schema
 * 
 * Role / User / Auth handling / Default Data
 * 
 * 
 **********************************/
/* Role / User mongoose Schemas */
var RoleSchema = new Schema({
  key: String
})
var UserSchema = new Schema({
  email: { type: String, validate: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i },
  password_encrypted: String,
  roles: [RoleSchema],
  vendor_id: String
});
/* Auth Handling */
UserSchema.static('authenticate', function(email, password, next){
  this.find({email:email}, function(err,data){
    if(err){
      error(err)
      next(err)
    }else{
      if(data.length>0)
        if (compareEncrypted(password,data[0].password_encrypted))
          next(null,data[0])
        else
          next('Password incorrect.')
      else
        next('Email not found.')
    }
  })
});
/* Default Data */
var User = mongoose.model('User',UserSchema);
User.count({},function(err,data){
  if(err)
    error(err)
  else if (data == 0){
    var user = new User();
    user.email = 't@t.com';
    user.password_encrypted = encrypted('123456');
    user.roles = [{key:'admin'}];
    user.save(function(err,data){
      if(err)
        error(err)
    })
  }
})





/**********************************
 * 
 * Route Middleware
 * 
 * Get User Data, login validation and security
 * 
 * 
 **********************************/
/* Returns all users for now */
var getUser = function(req, res, next){
  User.find({},function(err, data){
    req.data = data;
    next();
  });
}
var checkEmail = function(req, res, next){
  var params = req.body
  req.email = params.email
  User.count({email:params.email},function(err, data){
    if(err)
      error(err)
    req.err = err
    req.data = data
    next()
  })
}
var saveUser = function(req, res, next){
  var params = req.body
  if(
    !params.email.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)
    || !params.password.match(/\b.{6,1500}\b/i)
    || !params.roles.match(/\b(user|admin)\b/i)
  ){
    req.err = 'parameter validation failed'
  }else{
    var user = new User()
    user.email = params.email
    user.password_encrypted = encrypted(params.password);
    user.roles = [{key:params.role}];
    user.save(function(err,data){
      req.data = data
      req.err = err
      next()
    })
  }
}
/* Ensures a valid login, and sets session variables */
var validateLogin = function(req, res, next){
  var params = req.body
  User.authenticate(params.email,params.password,function(err, data){
    if(err)
      error(err)
    else{
      
      /*
       * TODO : move session storage out of memory
       */

      /* I think we'll base most decisions off of this session.role */
      req.session.role = data.roles[0].key
      req.session.email = data.email
    }
    req.data = data;
    req.err = err;
    next()
  })
}
/* Secures an area based on the above session variables */
var securedArea = function(req, res, next){
  if(req.session.role == 'admin')
    next()
  else{
    req.session.previousPath = req.route.path;
    res.redirect('/login') 
  }
}






/**********************************
 * 
 * User schema routes
 * 
 * checkEmail
 * 
 * 
 **********************************/
app.post('/checkEmail', checkEmail, function(req, res, next){
  res.send({
    err: req.err,
    data: req.data,
    email: req.email
  })
})
app.post('/saveUser', securedArea, saveUser, function(req, res, next){
  res.send({
    err: req.err,
    data: req.data
  })
})



/**********************************
 * 
 * Static Pages
 * 
 * Home page.
 * 
 * 
 **********************************/
app.get('/', function(req, res){
  if(req.session.role == 'admin')
    res.redirect('/admin')
  else
    res.render('index', {
      title: 'KickbackCard.com'
    });
});





/**********************************
 * 
 * Login
 * 
 * login get and post and error passing
 * 
 * 
 **********************************/
app.get('/login', function(req, res){
  res.render('login', {
    title: 'KickbackCard.com: Login'
  })
})
app.post('/login', validateLogin, function(req, res, next){
  if(req.err)
    res.render('login', {
      title: 'KickbackCard.com: Login: Error',
      err: req.err
    })
  else{
    if(typeof(req.session.previousPath)!='undefined'){
      var myPreviousPath = req.session.previousPath
      res.redirect(myPreviousPath)
    }else
      res.redirect('/admin')
  }
})





/**********************************
 * 
 * Admin Navigation
 * 
 * After logging in, and users and vendors and logout.
 * 
 * 
 **********************************/
app.get('/admin', securedArea, getUser, function(req,res, next){
  res.render('admin', {
    all: req.data,
    view: 'users',
    title: 'KickbackCard.com: Admin'
  })
})
app.get('/users', securedArea, getUser, function(req,res, next){
  res.render('admin', {
    all: req.data,
    view: 'users',
    title: 'KickbackCard.com: Admin: Users'
  })
})
app.get('/vendors', securedArea, getUser, function(req,res, next){
  res.render('admin', {
    all: req.data,
    view: 'vendors',
    title: 'KickbackCard.com: Admin: Vendors'
  })
})
app.get('/logout', function(req, res, next){
  req.session.destroy(function(err){
    next()
  })
}, function(req, res, next){
  res.redirect('home')
})





/**********************************
 * 
 * Generic Handlers
 * 
 * partials.
 * 
 * 
 **********************************/
app.get('/_:partial', function(req, res, next){
  res.render('_'+req.params.partial, {
    layout: 'layout_partial.jade'
  })
})




app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
