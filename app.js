
/**
 * Module dependencies.
 */

var express = require('express');



/**********************************
 * 
 * Generic Libraries Setup
 * 
 * geo, pdfkit, nodemailer, bcrypt and mongoose
 * 
 * 
 **********************************/
var im = require('imagemagick');

var validURLCharacters = '$-_.+!*\'(),0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var db_uri = process.env.MONGOHQ_URL || 'mongodb://localhost:27017/db';

var geo = require('geo');

require('coffee-script');
var PDFDocument = require('pdfkit');

var nodemailer = require('nodemailer');

nodemailer.SMTP = {
  host: 'smtp.sendgrid.net',
  port: 25,
  use_authentication: true,
  user: process.env.SENDGRID_USERNAME,
  pass: process.env.SENDGRID_PASSWORD,
  domain: process.env.SENDGRID_DOMAIN
}

var bcrypt = require('bcrypt');
var encrypted = function(inString){
  var salt = bcrypt.gen_salt_sync(10);
  var hash = bcrypt.encrypt_sync(inString, salt);
  return hash;
}
var compareEncrypted= function(inString,hash){
  return bcrypt.compare_sync(inString, hash);
}



var url = require('url').parse(db_uri);
var mongodb = require('mongodb');
var dbAuth = {};
if (url.auth) {
  auth = url.auth.split(':', 2);
  dbAuth.username = auth[0];
  dbAuth.password = auth[1];
}
var Db = mongodb.Db
  , Server = mongodb.Server
  , db = new Db(url.pathname.replace(/^\//, ''),
                              new Server(url.hostname,
                                               url.port))
  , mongoStore = require('connect-mongodb');

var mongoose = require('mongoose');
mongoose.connect(db_uri);
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'fkd32aFD5Ssnfj$5#@$0k;',
    store: new mongoStore({db: db, username: dbAuth.username, password: dbAuth.password})
  }));
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
  email: { type: String, validate: /\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i, set: function(v){ return v.toLowerCase() } },
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
var UserBackup = mongoose.model('UserBackup',UserSchema);
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
 * Vendor Schema
 * 
 * Role / Vendor / Auth handling / Default Data
 * 
 * 
 **********************************/
/* Role / Vendor mongoose Schemas */
var ClientSchema = new Schema({
  client_secret: String,
  date_added: Date
})
var KickerSchema = new Schema({
  url_string: String,
  deal_id: String,
  reusable: Boolean,
  kick_ids: [String],
  date_added: Date
})
var KickSchema = new Schema({
  kicker_id: String,
  redeem_id: String,
  client_id: String,
  redeemed: Boolean,
  date_added: Date
})
var RedeemSchema = new Schema({
  client_id: String,
  kicker_id: String,
  date_added: Date,
  kick_ids: [String]
})
var Client = mongoose.model('Client',ClientSchema);
var Kicker = mongoose.model('Kicker',KickerSchema);
var Kick = mongoose.model('Kick',KickSchema);
var Redeem = mongoose.model('Redeem',RedeemSchema);


var DealSchema = new Schema({
  buy_item: String,
  buy_qty: Number,
  get_type: String,
  get_item: String,
  tag_line: String,
  vendor_id: String,
  archived: {type: Boolean, default: false}
})
DealSchema.virtual('default_tag_line').get(function(){
  var tag_line = '';
  if(this.get_type == '1 FREE')
    tag_line = 'Buy '+this.buy_qty+' '+this.buy_item+' and get one '+this.get_item+' FREE!';
  if(this.get_type == 'Dollar(s) Off')
    tag_line = 'Buy '+this.buy_qty+' '+this.buy_item+' and get '+this.get_item+' dollars off!';
  if(this.get_type == 'Percent Off')
    tag_line = 'Buy '+this.buy_qty+' '+this.buy_item+' and get '+this.get_item+' percent off!';
  return tag_line;
})
var Deal = mongoose.model('Deal',DealSchema);
var DealBackup = mongoose.model('DealBackup',DealSchema);

var VendorSchema = new Schema({
  name: { type: String, validate: /\b.{1,1500}\b/i },
  address: { type: String, validate: /\b.{1,1500}\b/i },
  coordinates: Array,
  description: { type: String },
  hours: { type: String },
  contact: { type: String },
  deal_ids: [String],
  user_ids: [String]
})
var Vendor = mongoose.model('Vendor',VendorSchema);
var VendorBackup = mongoose.model('VendorBackup',VendorSchema);



/***


GLOBAL ROUTE STUFF

***/

app.get('*',function(req,res,next){
  var headers = req.headers;
  if(
    headers['x-real-ip']
    && headers['x-forwarded-proto']!='https'
  )
    res.redirect('https://www.kickbackcard.com'+req.url)
  else
    next()
})


/**********************************
 *
 * Route MiddleWare
 * 
 * Kick and Clienting
 *
 **********************************/
var mrg = require(__dirname + '/mrg')
var createClient = function(req, res, next){
  var client = new Client();
  client.client_secret = encrypted(mrg.generate()+'');
  client.save(function(err,data){
    req.err = err;
    req.client = data;
    next()
  })
}
app.get('/createClient', createClient, function(req, res, next){
  res.send({
    err: req.err,
    client: req.client
  })
})
app.post('/k:id',function(req,res,next){
  Client.findById(req.body.client_id,function(err,data){
    if(err)
      res.send({err:err})
    else{

      /*
        Validate the shared token against the secret/client_id/kick_id
      */

      var isValid = bcrypt.compare_sync(data.client_secret+data._id+req.params.id, req.body.client_shared);
      if(!isValid)
        res.send({err:'Invalid Token'})
      else{
        Kicker.find({url_string:req.params.id}, [], function(err,kicker){
          if(err || kicker.length==0)
            res.send({
              err: err || 'Kicker not found'
            })
          else
            Deal.findById(kicker[0].deal_id,function(err,deal){


              /*
               * Okay, we found the deal and the kicker, now what? :) lol
               */
              
              console.log(req.body)

              res.send({
                err: err,
                deal: deal,
                kicker: kicker
              });
            })
        })
      }
    }
  })
})
app.get('/k:id',function(req,res,next){
  res.send('',{
      Location:'/'
  },302);
})

/**********************************
 * 
 * Route Middleware
 * 
 * Get Vendor Data
 * 
 * 
 **********************************/
var getVendor = function(req, res, next){
  var params = req.body || {}
  var id = params.id || ''
  if(id=='')
    next()
  else
    Vendor.findById(params.id,function(err, vendor){
      req.err = err
      if(err)
        next()
      else
        User.find({vendor_id:vendor._id},function(err, data){
          req.err = err
          if(err)
            next()
          else
            Deal.find({vendor_id:vendor._id,archived:false},function(err, data){
              req.err = err
              vendor.deals = data
              req.vendor = vendor
              next()
            })
        })
    });
}
var get10Vendors = function(req, res, next){
  var params = req.body || {}
  var skip = params.skip || 0

  Vendor.find({},['coordinates','name','address','contact'],{skip:skip,limit:10,sort:{name:1}},function(err, data){
    req.err = err
    req.data = data
    next()
  });
}
var checkName = function(req, res, next){
  var params = req.body || {}
  req.name = params.name || ''
  req.name = req.name.replace(/(^\s{1,}|\s{1,}$)/g,'').replace(/\s{1,}/g,' ')
  var handleReturn = function(err, data){
    if(err)
      error(err)
    req.err = err
    req.data = data
    next()
  };
  if(params.id)
    Vendor.count({name:req.name,_id:{$ne:params.id}},handleReturn)
  else
    Vendor.count({name:req.name},handleReturn)
}
var addDeal = function(req, res, next){
  var params = req.body || {}
  Vendor.findById(params.vendor_id,function(err,vendor){
    if(err||!vendor){
      req.err = err
      next()
    }else{
      var deal = new Deal()
      deal.buy_qty = 10
      deal.buy_item = 'lunches'
      deal.get_type = '1 FREE'
      deal.get_item = 'lunch'
      deal.vendor_id = vendor._id
      deal.save(function(err,data){
        req.data = data
        if(err){
          req.err = err
          next() 
        }else{
          vendor.deal_ids.push(data._id)
          vendor.save(function(err,data){
            req.err = err
            next()
          })
        }
      })
    }
  })
}
var saveDeal = function(req, res, next){
  var params = req.body || {}
  Deal.findById(params.id,function(err,data){
    if(err){
      req.err = err
      next()
    }else{
      if(params.buy_qty && params.buy_qty.match(/\b\d{1,1500}\b/))
        data.buy_qty = params.buy_qty
      if(params.buy_item && params.buy_item.match(/\b.{1,1500}\b/))
        data.buy_item = params.buy_item
      if(params.get_type && params.get_type.match(/\b.{1,1500}\b/))
        data.get_type = params.get_type
      if(params.get_item && params.get_item.match(/\b.{1,1500}\b/))
        data.get_item = params.get_item
      if(params.tag_line && params.tag_line.match(/\b.{1,1500}\b/))
        data.tag_line = params.tag_line;
      else if(params.tag_line == '')
        data.tag_line = '';
      if(params.archive)
        data.archived = true
      data.save(function(err,data){
        req.err = err
        next()
      })
    }
  })
}
var saveVendor = function(req, res, next){
  var params = req.body || {}
  if(
    !params.name.match(/\b.{1,1500}\b/i)
    || !params.address.match(/\b.{1,1500}\b/i)
    || params.description.length > 1500
    || params.hours.length > 1500
    || params.contact.length > 1500
  ){
    req.err = 'parameter validation failed'
    next()
  }else{
    var sensor = false;
    geo.geocoder(geo.google, params.address, false, function(formattedAddress, latitude, longitude) {
      params.coordinates = [latitude, longitude, formattedAddress]
      if(params.id){
        Vendor.findById(params.id,function(err,data){
          if(err){
            req.data = data
            req.err = err
            next()
          }else{
            data.name = params.name
            data.address = params.address
            data.coordinates = params.coordinates
            data.description = params.description
            data.hours = params.hours
            data.contact = params.contact
            data.save(function(err,data){
              req.data = data
              req.err = err
              next()
            })
          }
        })
      }else{
        var vendor = new Vendor()
        vendor.name = params.name
        vendor.address = params.address
        vendor.coordinates = params.coordinates
        vendor.description = params.description
        vendor.hours = params.hours
        vendor.contact = params.contact
        vendor.save(function(err,data){
          req.data = data
          req.err = err
          next()
        })
      }
    });
  }
}
var deleteVendor = function(req, res, next){
  var params = req.body || {}
  if(params.id){
    Vendor.findById(params.id,function(err,data){
      if(err){
        req.err = err
        next()
      }else{
        var vendor = new VendorBackup()
        vendor.name = data.name
        vendor.address = data.address
        vendor.save(function(err,data){
          Vendor.remove({_id: params.id},function(err,data){
            req.err = err
            next()
          })
        })
      }
    })
  }else{
    req.err = 'bad parameters'
    next()
  }
}
var getDeal = function(req, res, next){
  var params = req.body || req.params || {}
  var id = params.id || ''
  if(id=='')
    next()
  else
    Deal.findById(params.id,function(err, data){
      req.err = err
      req.deal = data
      next()
    });
}

var getVendorFromDeal = function(req, res, next){
  if(req.deal)
    Vendor.find({deal_ids:req.deal._id},function(err, data){
      req.err = err
      req.vendor = data.length>=1 ? data[0] : {}
      next()
    });
  else
    next()
}


/**********************************
 * 
 * Route Middleware
 * 
 * Get User Data, login validation and security
 * 
 * 
 **********************************/
var getUser = function(req, res, next){
  var params = req.body || {}
  var id = params.id || ''
  if(id=='')
    next()
  else
    User.findById(params.id,function(err, data){
      req.err = err
      req.user = data
      next()
    });
}
var get10Users = function(req, res, next){
  var params = req.body || {}
  var skip = params.skip || 0

  User.find({},{},{skip:skip,limit:10,sort:{email:1}},function(err, data){
    req.data = data;
    next();
  });
}
var checkEmail = function(req, res, next){
  var params = req.body || {}
  req.email = params.email || ''
  req.email = req.email.toLowerCase()
  var handleReturn = function(err, data){
    if(err)
      error(err)
    req.err = err
    req.data = data
    next()
  };
  if(params.id)
    User.count({email:req.email,_id:{$ne:params.id}},handleReturn)
  else
    User.count({email:req.email},handleReturn)
}
var saveUser = function(req, res, next){
  var params = req.body || {}
  if(
    !params.email.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)
    || (!params.password.match(/\b.{6,1500}\b/i) && !params.id)           /* password is optional only when id is passed */
    || !params.role.match(/\b(vendor|admin)\b/i)
  ){
    req.err = 'parameter validation failed'
    next()
  }else if(params.id){
    User.findById(params.id,function(err,data){
      if(err){
        req.data = data
        req.err = err
        next()
      }else{
        data.email = params.email
        if(params.password && params.password != '')
          data.password_encrypted = encrypted(params.password)
        data.roles = [{key:params.role}]
        data.save(function(err,data){
          req.data = data
          req.err = err
          next()
        })
      }
    })
  }else if(params.vendor_id){
    Vendor.findById(params.vendor_id,function(err,vendor){
      if(err){
        req.data = vendor
        req.err = err
        next()
      }else{
        var user = new User()
        user.email = params.email
        user.password_encrypted = encrypted(params.password)
        user.roles = [{key:params.role}]
        user.vendor_id = vendor._id;
        user.save(function(err,data){
          req.data = data
          if(err){
            req.err = err
            next() 
          }else{
            vendor.user_ids.push(user._id)
            vendor.save(function(err,data){
              req.err = err
              next()
            })
          }
        })
      }
    })
  }else{
    var user = new User()
    user.email = params.email
    user.password_encrypted = encrypted(params.password)
    user.roles = [{key:params.role}]
    user.save(function(err,data){
      req.data = data
      req.err = err
      next()
    })
  }
}
var deleteUser = function(req, res, next){
  var params = req.body || {}
  if(params.id){
    User.findById(params.id,function(err,data){
      if(err){
        req.err = err
        next()
      }else{
        var user = new UserBackup()
        user.email = data.email
        user.password_encrypted = data.password_encrypted
        user.roles = data.roles
        user.save(function(err,data){
          User.remove({_id: params.id},function(err,data){
            req.err = err
            next()
          })
        })
      }
    })
  }else{
    req.err = 'bad parameters'
    next()
  }
}
/* Ensures a valid login, and sets session variables */
var validateLogin = function(req, res, next){
  var params = req.body || {}
  req.email = params.email || ''
  req.email = req.email.toLowerCase()
  User.authenticate(req.email,params.password,function(err, data){
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
    res.send('',{
        Location:'/login'
    },302);
  }
}
var securedFunction = function(req, res, next){
  if (req.session.role != 'admin')
    res.send({
      err: 'no permissions'
    })
  else
    next()
}


/**********************************
 * 
 * User schema routes
 * 
 * 
 * 
 * 
 **********************************/
app.post('/get10Users', securedFunction, get10Users, function(req, res, next){
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.render('_list_users', {
      layout: 'layout_partial.jade',
      users: req.data
    })
})
app.post('/getUser', securedFunction, getUser, function(req, res, next){
  var params  = req.body || {}
  var role = params.role || 'admin'
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.render('_form_user', {
      layout: 'layout_partial.jade',
      user: req.user || {roles:[{key:role}]}
    })
})
app.post('/checkEmail', checkEmail, function(req, res, next){
  res.send({
    err: req.err,
    data: req.data,
    email: req.email
  })
})
app.post('/saveUser', securedFunction, saveUser, function(req, res, next){
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.render('_row_user', {
      layout: 'layout_partial.jade',
      user: req.data
    })
})
app.post('/deleteUser', securedFunction, deleteUser, function(req, res, next){
  res.send({
    err: req.err
  })
})



/**********************************
 * 
 * User schema routes
 * 
 * 
 * 
 * 
 **********************************/
app.post('/get10Vendors', securedFunction, get10Vendors, function(req, res, next){
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.render('_list_vendors', {
      layout: 'layout_partial.jade',
      vendors: req.data
    })
})
app.post('/getVendor', securedFunction, getVendor, function(req, res, next){
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.render('_form_vendor', {
      layout: 'layout_partial.jade',
      vendor: req.vendor || {}
    })
})
app.post('/checkName', checkName, function(req, res, next){
  res.send({
    err: req.err,
    data: req.data,
    name: req.name
  })
})
app.post('/saveVendor', securedFunction, saveVendor, function(req, res, next){
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.render('_row_vendor', {
      layout: 'layout_partial.jade',
      vendor: req.data
    })
})
app.post('/saveDeal', securedFunction, saveDeal, function(req, res, next){
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.send({})
})
app.post('/deleteVendor', securedFunction, deleteVendor, function(req, res, next){
  res.send({
    err: req.err
  })
})
app.post('/addDeal', securedFunction, addDeal, function(req, res, next){
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.render('_row_deal', {
      layout: 'layout_partial.jade',
      deal: req.data
    })
})
app.post('/printDeal', securedFunction, getDeal, function(req, res, next){
  if(req.err)
    res.send({
      err: req.err
    })
  else
    res.render('_form_print', {
      layout: 'layout_partial.jade',
      deal: req.deal
    })
})





























/*
PDFImage - embeds images in PDF documents
By Devon Govett
*/
var Data, JPEG, PDFImage, PNG, fs;
fs = require('fs');
Data = require('pdfkit/lib/data');
JPEG = require('pdfkit/lib/image/jpeg');
PNG = require('pdfkit/lib/image/png');
PDFImage = (function() {
function PDFImage() {}
PDFImage.open = function(filename) {
  var data, firstByte;
  if (typeof filename === 'string') {
    this.contents = fs.readFileSync(filename);
    if (!this.contents) {
      return;
    }
    this.data = new Data(this.contents);
  } else if (typeof filename === 'object') {
    this.data = new Data(filename);
  } else {
    return;
  }
  this.filter = null;
  data = this.data;
  firstByte = data.byteAt(0);
  if (firstByte === 0xFF && data.byteAt(1) === 0xD8) {
    return new JPEG(data);
  } else if (firstByte === 0x89 && data.stringAt(1, 3) === "PNG") {
    return new PNG(data);
  } else {
    throw new Error('Unknown image format.');
  }
};
return PDFImage;
})();
var myImage = function(src, x, y, options) {
  var bh, bp, bw, h, hp, image, ip, label, obj, w, wp, _base, _ref, _ref2, _ref3;
  if (typeof x === 'object') {
    options = x;
    x = null;
  }
  x = x || (options != null ? options.x : void 0) || this.x;
  y = y || (options != null ? options.y : void 0) || this.y;
  if (this._imageRegistry[src]) {
    _ref = this._imageRegistry[src], image = _ref[0], obj = _ref[1], label = _ref[2];
  } else {
    image = PDFImage.open(src);
    obj = image.object(this);
    label = "I" + (++this._imageCount);
    this._imageRegistry[src] = [image, obj, label];
  }
  w = (options != null ? options.width : void 0) || image.width;
  h = (options != null ? options.height : void 0) || image.height;
  if (options) {
    if (options.width && !options.height) {
      wp = w / image.width;
      w = image.width * wp;
      h = image.height * wp;
    } else if (options.height && !options.width) {
      hp = h / image.height;
      w = image.width * hp;
      h = image.height * hp;
    } else if (options.scale) {
      w = image.width * options.scale;
      h = image.height * options.scale;
    } else if (options.fit) {
      _ref2 = options.fit, bw = _ref2[0], bh = _ref2[1];
      bp = bw / bh;
      ip = image.width / image.height;
      if (ip > bp) {
        w = bw;
        h = bw / ip;
      } else {
        h = bh;
        w = bh * ip;
      }
    }
  }
  if (this.y === y) {
    this.y += h;
  }
  y = this.page.height - y - h;
  if ((_ref3 = (_base = this.page.xobjects)[label]) == null) {
    _base[label] = obj;
  }
  this.save();
  this.addContent("" + w + " 0 0 " + h + " " + x + " " + y + " cm");
  this.addContent("/" + label + " Do");
  this.restore();
  return this;
}







var url_string = function(){
  var psuedo = '';
  var l = validURLCharacters.length-1;
  for(var i = 0; i<9; i++){
    psuedo += validURLCharacters[Math.round(mrg.generate_real()*l)];
  }
  return psuedo;
}

/*
TODO : Make this middleware, use it from both kicker generation functions.
*/
var generateKickers = function(req, res, next){

  var qty = req.params.qty || 1;

  var strings = []
  for(var i = 0; i<qty; i++){
    strings.push(url_string())
  }
  Kicker.find({url_string:{$in:strings}},[],function(err,data){
    if(err)
      res.send({err:err})
    else if(data.length!=0)
      res.send({err:'Collision!'})
    else{
      for(var i in strings){
        var kicker = new Kicker();
        kicker.url_string = strings[i];
        kicker.deal_id = req.deal._id;
        kicker.reusable = (req.params.qty?false:true);
        kicker.save()
        console.log(kicker);
      }
      req.strings = strings;
      next() 
    }
  })
}



var findNearestSpaceInAt = function(s,m){
  for(var i = 0; i < s.length; i++){
    var p = (
      i%2
        ?(m+(i+1)/2)
        :(m-(i)/2)
    )
    if(s.charAt(p)==' ')
      return p;
  }
  return false;
}

var addLineBreaks = function(s){
  var l = s.length;

  if(l<20){
    
  }else if(l>=20&&l<40){

    var m = Math.floor(l/2);
    var p = findNearestSpaceInAt(s,m);
    if(p)
      s = s.substr(0,p)+' \n'+s.substr(p+1,l)
  }else{
    var m = Math.floor(l/3);
    var p1 = findNearestSpaceInAt(s,m);
    var p2 = findNearestSpaceInAt(s,m*2);
    if(p1 && p2 && p1!=p2)
      s = s.substr(0,p1)+' \n'+s.substr(p1+1,p2-p1)+' \n'+s.substr(p2+1,l)
    
  }
  return s;
}

var fixBrokenPNG = function(inPNG){
  var p = inPNG.indexOf('B`')
  if(p<500)
    inPNG = inPNG.substr(p+3,inPNG.length)

  return inPNG;
}



var generateDealNameVendorText = function(req, res, next){
  

  var params = req.params || {}
  
  var deal_text = addLineBreaks(
    (!req.deal.tag_line || req.deal.tag_line.length==0)
      ?req.deal.default_tag_line
      :req.deal.tag_line
  );
  var vendor_name = addLineBreaks(req.vendor.name);


  im.convert([
    __dirname+'/public/images/_.png',
    '-background','transparent',
    '-fill','black',
    '-font', __dirname+'/LuckiestGuy.ttf',
    '-size','900x300',
    'label:'+vendor_name,
    'png:-'
  ],
  function(vendorImageErr, vendorImage, stderr){

    im.convert([
      __dirname+'/public/images/_.png',
      '-background','transparent',
      '-fill','black',
      '-font', __dirname+'/LuckiestGuy.ttf',
      '-size','900x300',
      'label:'+deal_text,
      'png:-'
    ],
    function(dealImageErr, dealImage, stderr){

      if(!vendorImage || !dealImage){
        res.send({
          vendorImageErr: vendorImageErr,
          dealImageErr: dealImageErr
        })
      }else{
        req.vendorImage = vendorImage;
        req.dealImage = dealImage;
        next();
      }
    });
  });
};







var qrcode = require(__dirname + '/qrcode.js')


app.get('/deal/:id/kicks-:qty.pdf', /*securedArea,*/ getDeal, getVendorFromDeal, generateKickers, generateDealNameVendorText, function(req, res, next){
  
  var params = req.params || {}
  
  var doc = new PDFDocument()

  doc.registerFont('Heading Font',__dirname+'/LuckiestGuy.ttf','Luckiest-Guy')
  doc.registerFont('Body Font',__dirname+'/OpenSans-Regular.ttf','Open-Sans-Regular')
  doc.image = myImage;

  var length = params.qty || 500;

  var originalStartPoint = [54+252,36-144]
  var startPoint = originalStartPoint

  for(var card = 0; card<length; card++){
      
    if((card/10)==Math.floor(card/10)&&card!=0){
      doc.addPage()
      startPoint = originalStartPoint
    }

    if(card%2)
      startPoint = [startPoint[0]+252,startPoint[1]]
    else
      startPoint = [startPoint[0]-252,startPoint[1]+144]
  


    var offset = startPoint;
    var setDoc = function(){
      doc.x = offset[0]
      doc.y = offset[1]
    }

    setDoc()
    doc.image(__dirname + '/public/images/bizbg.png',0,0,{fit:[252,144]})

    offset = [offset[0]+18,offset[1]+24]
    setDoc()

    doc.image(new Buffer(fixBrokenPNG(req.vendorImage),'binary'),0,0,{fit:[130,60]})

    offset = [offset[0]+0,offset[1]+44]
    setDoc()
    doc.image(new Buffer(fixBrokenPNG(req.dealImage),'binary'),0,0,{fit:[100,50]})




    offset = [offset[0]+135,offset[1]-44]
    var ecclevel = 4;
    var wd = 125;
    var ht = 125;

    var string = 'http://kckb.ac/k'+req.strings[card];
    string = string.substr(0,30)
    var qrCode = qrcode.genframe(string);
    var qf = qrCode.qf
    var width = qrCode.width

    var i,j;
    var px = wd;
    if( ht < wd )
        px = ht;
    px /= width+10;
    px=Math.round(px - 0.5);

    doc.fillColor('black')
    for( i = 0; i < width; i++ )
        for( j = 0; j < width; j++ )
            if( qf[j*width+i] )
                doc.rect(px*(4+i)+offset[0],px*(4+j)+offset[1],px,px).fill()      
  }


  var output = doc.output()
  res.send(new Buffer(output,'binary'),{
    'Content-Type' : 'application/pdf'
  })

    /*

/*
  var QRCode = require('qrcode')
  QRCode.toDataURL('http://kckb.ac/123',function(err,url){

    url = url.replace(/^[^,]*,/,'')
    doc.image(new Buffer(url, 'base64'),500,100,{fit:[50,50]})

    var output = doc.output()
    res.send(new Buffer(output,'binary'),{
      'Content-Type' : 'application/pdf'
    })

  })
*/

/*
  var output  = doc.output()
  res.send(new Buffer(output,'binary'),{
    'Content-Type' : 'application/pdf'
  })
*/

})

app.get('/deal/:id/kicker.pdf', getDeal, getVendorFromDeal, generateKickers, generateDealNameVendorText, function(req, res, next){


  var doc = new PDFDocument()

  doc.registerFont('Heading Font',__dirname+'/LuckiestGuy.ttf','Luckiest-Guy')
  doc.registerFont('Body Font',__dirname+'/OpenSans-Regular.ttf','Open-Sans-Regular')
  doc.image = myImage;


  var offset = [0,0];
  var setDoc = function(){
    doc.x = offset[0]
    doc.y = offset[1]
  }
  setDoc()

  doc.image(__dirname + '/public/images/kicker-bg-opaque.png',0,0,{width:612,height:792})

  offset = [340,64]
  setDoc()
  doc.image(new Buffer(fixBrokenPNG(req.vendorImage),'binary'),0,0,{fit:[210,80]})

  offset = [340,132];
  setDoc();
  doc.image(new Buffer(fixBrokenPNG(req.dealImage),'binary'),0,0,{fit:[180,80]})







  offset = [335,230]
  var ecclevel = 4;
  var wd = 250;
  var ht = 250;

  var string = 'http://kckb.ac/k'+req.strings[0];
  
  string = string.substr(0,30)
  var qrCode = qrcode.genframe(string);
  var qf = qrCode.qf
  var width = qrCode.width

  var i,j;
  var px = wd;
  if( ht < wd )
      px = ht;
  px /= width+10;
  px=Math.round(px - 0.5);

  doc.fillColor('black')
  for( i = 0; i < width; i++ )
      for( j = 0; j < width; j++ )
          if( qf[j*width+i] )
              doc.rect(px*(4+i)+offset[0],px*(4+j)+offset[1],px,px).fill()   



  /* Back Side */
  doc.addPage();

  offset = [0,0];
  setDoc()
  doc.image(__dirname + '/public/images/kicker-back.png',0,0,{width:612,height:792});

  var output = doc.output()
  res.send(new Buffer(output,'binary'),{
    'Content-Type' : 'application/pdf'
  })

})



/**********************************
 * 
 * Send Email Routes
 * 
 * 
 * 
 * 
 **********************************/
app.post('/sendWelcomeEmail', securedFunction, function(req, res, next){
  var params = req.body || {}
  var email = params.email || ''
  var continued = false
  if(!email.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)){
    req.err = 'invalid email'
    next()
  }else
    // send an e-mail
    nodemailer.send_mail({
      sender: 'help@foozeballcard.com',
      to:email,
      subject:'FoozeballCard: Welcome!',
      html: '<p>Welcome to fooozeball card '+email+'</p>',
      body:'Welcome to foozeball card '+email+''
    },function(err, data){
      req.err = err
      req.data = data
      if(!continued)
        next()
      continued = true
    });
}, function(req, res, next){
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
app.get('/', get10Vendors, function(req, res){
  if(req.session.role == 'admin')
    res.send('',{
        Location:'/admin'
    },302);
  else{
    var mystring = '//maps.googleapis.com/maps/api/staticmap?center=Phoenix%20AZ&'
    for(var i in req.data){
      var thisVendor = req.data[i]
      if(typeof(thisVendor.coordinates)=='object' && thisVendor.coordinates.length == 3)
        mystring += '&markers=color:red%7Clabel:V%7C'+thisVendor.coordinates[0]+','+thisVendor.coordinates[1]
    }
    mystring += '&zoom=10&size=250x331&sensor=false'
    res.render('index', {
      title: 'KickbackCard.com',
      mapUrl: mystring
    });
  }
});

app.get('/vendors.json', get10Vendors, function(req, res){
  res.send(req.data)
})





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
      res.send('',{
          Location:myPreviousPath
      },302);
    }else
      res.send('',{
          Location:'/admin'
      },302);
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
app.get('/admin', securedArea, get10Vendors, function(req,res, next){
  res.render('admin', {
    vendors: req.data,
    view: 'vendors',
    title: 'KickbackCard.com: Admin'
  })
})
app.get('/users', securedArea, get10Users, function(req,res, next){
  res.render('admin', {
    users: req.data,
    view: 'users',
    title: 'KickbackCard.com: Admin: Users'
  })
})
app.get('/vendors', securedArea, get10Vendors, function(req,res, next){
  res.render('admin', {
    vendors: req.data,
    view: 'vendors',
    title: 'KickbackCard.com: Admin: Vendors'
  })
})
app.get('/logout', function(req, res, next){
  req.session.destroy(function(err){
    next()
  })
}, function(req, res, next){
  res.send('',{
      Location:'/'
  },302);
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


app.get('/robots.txt', function(req, res, next){
  res.send('User-agent: *\nDisallow: /',{'Content-Type':'text/plain'})
});


app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
