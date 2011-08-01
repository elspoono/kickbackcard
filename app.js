
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
  app.use(express.session({ secret: 'We are never invisible enough.' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});



var md5 = function(inString){
  return inString;
}


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db');

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var UserSchema = new Schema({
  email: { type: String, validate: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/ },
  password_md5: String,
  roles: [
    {type: String, enum:['admin', 'vendor', 'customer', 'visitor'], default: 'visitor'}
  ],
  vendor_id: String
});

//UserSchema.pre('authenticate', function (next, email,){
//});

var User = mongoose.model('User',UserSchema);

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
