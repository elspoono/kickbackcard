
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
 * geo, bcrypt and mongoose
 * 
 * 
 **********************************/
var geo = require('geo');

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

  Vendor.find({},{},{skip:skip,limit:10,sort:{name:1}},function(err, data){
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
      req.data = data
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



app.get('/lowerUsers',function(req,res,next){
  User.find({},function(err,data){
    for(var i in data){
      data[i].email = data[i].email.toLowerCase()
      data[i].save(function(err,updated){ 
      })
    }
  })
  res.send({})
})


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
