
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



/*  
  To hash a password:
var bcrypt = require('bcrypt');
var salt = bcrypt.gen_salt_sync(10);
var hash = bcrypt.encrypt_sync("B4c0/\/", salt);

To check a password:
var bcrypt = require('bcrypt');
var salt = bcrypt.gen_salt_sync(10);
var hash = bcrypt.encrypt_sync("B4c0/\/", salt); bcrypt.compare_sync("B4c0/\/", hash); // true
bcrypt.compare_sync("not_bacon", hash); // false
*/
var bcrypt = require('bcrypt');
var encrypted = function(inString){
  var salt = bcrypt.gen_salt_sync(10);
  var hash = bcrypt.encrypt_sync(inString, salt);
  return hash;
}
var compareEncrypted= function(inString,hash){
  console.log(inString,hash)
  return bcrypt.compare_sync(inString, hash);
}


var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/db');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var RoleSchema = new Schema({
  key: String
})
var UserSchema = new Schema({
  email: { type: String, validate: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i },
  password_encrypted: String,
  roles: [RoleSchema],
  vendor_id: String
});
UserSchema.static('authenticate', function(email, password, next){
  this.find({email:email}, function(err,data){
    console.log(data)
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



var getUser = function(req, res, next){
  User.find({},function(err, data){
    req.data = data;
    next();
  });
}

var validateLogin = function(req, res, next){
  var params = req.body
  console.log(params);
  User.authenticate(params.email,params.password,function(err, data){
    if(err)
      console.log(err)
    else{
      /* I think we'll base most decisions off of this, keep it safe */
      req.session.role = data.roles[0].key
      req.session.email = data.email
    }
    req.data = data;
    req.err = err;
    next()
  })
}

var securedArea = function(req, res, next){
  console.log(req.session)
  if(req.session.role == 'admin')
    next()
  else
    res.send({})
}


// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'KickbackCard.com'
  });
});

app.get('/login', function(req, res, next){
  res.render('_login', {
    layout: 'layout_partial.jade'
  })
})

app.get('/admin', securedArea, getUser, function(req, res, next){
  res.send({
    all: req.data
  });
})
app.post('/login', validateLogin, function(req, res, next){
  res.send({
    data: req.data,
    err: req.err
  })
})

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
