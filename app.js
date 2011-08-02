
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


var md5 = function(inString){
  return inString;
}


var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/db');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var RoleSchema = new Schema({
  key: String
})
var UserSchema = new Schema({
  email: { type: String, validate: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i },
  password_md5: String,
  roles: [RoleSchema],
  vendor_id: String
});
UserSchema.static('authenticate', function(email, password, next){
  this.find({email:email,password_md5:md5(password)}, next)
});
var User = mongoose.model('User',UserSchema);

User.count({},function(err,data){
  if(err)
    error(err)
  else if (data == 0){
    var user = new User();
    user.email = 't@t.com';
    user.password_md5 = md5('123456');
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

app.get('/test', getUser, function(req, res, next){
  res.send({
    all: req.data
  });
})

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
