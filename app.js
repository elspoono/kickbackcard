
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
 * geo, pdfkit, nodemailer, bcrypt and mongoose
 * 
 * 
 **********************************/
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
var DealSchema = new Schema({
  buy_item: String,
  buy_qty: Number,
  get_type: String,
  get_qty: Number,
  get_item: String,
  vendor_id: String,
  archived: {type: Boolean, default: false}
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
  var params = req.body || {}
  var id = params.id || ''
  if(id=='')
    next()
  else
    Deal.findById(params.id,function(err, data){
      req.err = err
      if(typeof(data)=='object'){
        if(data.get_type == '1 FREE')
          data.tag_line = 'Buy '+data.buy_qty+' '+data.buy_item+' and get one '+data.get_item+' FREE!';
        if(data.get_type == 'Dollar(s) Off')
          data.tag_line = 'Buy '+data.buy_qty+' '+data.buy_item+' and get '+data.get_item+' dollars off!';
        if(data.get_type == 'Percent Off')
          data.tag_line = 'Buy '+data.buy_qty+' '+data.buy_item+' and get '+data.get_item+' percent off!';
        req.data = data
      }
      next()
    });
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
    res.redirect('/login') 
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
      deal: req.data
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
















var qrcode = require(__dirname + '/qrcode.js')


app.get('/print.pdf', function(req, res, next){
  
  var doc = new PDFDocument()

  doc.registerFont('Heading Font',__dirname+'/LuckiestGuy.ttf','Luckiest-Guy')
  doc.registerFont('Body Font',__dirname+'/OpenSans-Regular.ttf','Open-Sans-Regular')
  doc.image = myImage;

  var length = 500;

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

    offset = [offset[0]+18,offset[1]+36]
    setDoc()
    doc.fontSize(16)
    doc.font('Body Font')
    doc.text('Jimmy John\'s')
    doc.font('Heading Font')
    doc.moveDown().fontSize(9)
    doc.text('Buy 10 subs get 1 FREE sub!')




    offset = [offset[0]+135,offset[1]-18]
    var ecclevel = 4;
    var wd = 125;
    var ht = 125;

    var string = 'http://kckb.ac/test'+Math.random()/card;
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
  var offset = [54,54]
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
    res.redirect('/admin')
  else{
    var mystring = 'http://maps.googleapis.com/maps/api/staticmap?center=Phoenix%20AZ&'
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
  res.send({
    vendors: req.data
  })
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
