
/*************************
 * 
 * Module dependencies.
 * 
 *************************/

var express = require('express');

var get = require('get');

var http = require('http');

/**********************************
 * 
 * Generic Libraries Setup
 * 
 * geo, pdfkit, nodemailer, bcrypt and mongoose
 * 
 **********************************/


var im = require('imagemagick');

var validURLCharacters = '-_.+!*,0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var db_uri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/staging';

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

var yelp = require("yelp").createClient({
  consumer_key: "eq6BAiYIY0RsNqW-A8gfxw", 
  consumer_secret: "5eQ8zi9j9naNVHb28gXKr6-uwaU",
  token: "wnIjFR8UhGlwBt_f2wYSY8a3lbc3GlWt",
  token_secret: "KKML2M7SsQvjEZ2hc1l98sO3s4g"
});

// mkdir myproj
// cd myproj
// git clone https://github.com/unscene/node-oauth.git



/*
Your API credentials are shown below. Please keep them safe.
Key
eef68a4879ad5230d58f3d2cb080ffab04e6a8d57
Secret
7e76ba07d2d21cfdf05a921077b4a1ce

var mooKey = 'eef68a4879ad5230d58f3d2cb080ffab04e6a8d57';
var mooSecret = '7e76ba07d2d21cfdf05a921077b4a1ce';
*/


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
  var auth = url.auth.split(':', 2);
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

var io = require('socket.io').listen(app);
io.configure(function (){
  io.set('transports', ['xhr-polling']);
  io.set('authorization', function (data, next) {
    var cookies = data.headers.cookie.split(/; */);
    var sid = false;
    for(var i in cookies){
      var cookie = cookies[i].split(/=/);
      if(cookie[0]=='connect.sid')
        sid = cookie[1]
    }
    sessionStore.get(unescape(sid),function(err,session){
      if(session){
        data.session = session;
        next(null,true)
      }else
        next(null,false)
    });
  });
});

// Configuration
var sessionStore = new mongoStore({db: db, username: dbAuth.username, password: dbAuth.password});
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    script:false,
    scripts: []
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'fkd32aFD5Ssnfj$5#@$0k;',
    store: sessionStore
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
  vendor_id: String,
  date_added: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
});
/* Auth Handling */
UserSchema.static('authenticate', function(email, password, next){
  this.find({email:email,active:true}, function(err,data){
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
 * Vendor Schema
 * 
 * Role / Vendor / Auth handling / Default Data
 * 
 * 
 **********************************/
/* Role / Vendor mongoose Schemas */
var ClientSchema = new Schema({
  client_secret: String,
  facebook_id: String,
  date_added: {type: Date, default: Date.now}
})
var KickerSchema = new Schema({
  url_string: String,
  deal_id: String,
  reusable: Boolean,
  kick_ids: [String],
  date_added: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
})
var KickSchema = new Schema({
  kicker_id: String,
  redeem_id: String,
  deal_id: String,
  client_id: String,
  scan_id: String,
  redeemed: Boolean,
  date_added: {type: Date, default: Date.now}
});
var KicktotalSchema = new Schema({
  _id:{
    deal_id: String,
    date_added: Date,
  },
  count: Number
})
var RedeemSchema = new Schema({
  url_string: String,
  client_id: String,
  deal_id: String,
  kick_ids: [String],
  date_added: {type: Date, default: Date.now}
})
var Client = mongoose.model('Client',ClientSchema);
var Kicker = mongoose.model('Kicker',KickerSchema);
var Kick = mongoose.model('Kick',KickSchema);
var Kicktotal = mongoose.model('kicktotals',KicktotalSchema);
var Redeem = mongoose.model('Redeem',RedeemSchema);



var ShareSchema = new Schema({
  client_id: String,
  deal_id: String,
  kick_id: String,
  date_added: {type: Date, default: Date.now}
})
var Share = mongoose.model('Share',ShareSchema);

var NewsSchema = new Schema({
  deal_id: String,
  client_id: String,
  type: String,
  kick_id: String,
  share_id: String,
  redeem_id: String,
  date_added: {type: Date, default: Date.now},
  date_number: Number
});
var News = mongoose.model('News',NewsSchema);



var DealSchema = new Schema({
  buy_item: String,
  buy_qty: Number,
  get_item: String,
  tag_line: String,
  vendor_id: String,
  date_added: {type: Date, default: Date.now},
  active: {type: Boolean, default: true}
})
DealSchema.virtual('default_tag_line').get(function(){
  var tag_line = 'Buy '+this.buy_qty+' '+this.buy_item+' and Get '+this.get_item+'';
  return tag_line;
})
var Deal = mongoose.model('Deal',DealSchema);

var VendorSchema = new Schema({
  name: { type: String, validate: /\b.{1,1500}\b/i },
  address: { type: String, validate: /\b.{1,1500}\b/i },
  factual_id: String,
  coordinates: [Number],
  real_address: {type: String},
  hours: { type: String },
  yelp_url: String,
  site_url: String,
  contact: { type: String },
  deal_ids: [String],
  deals: [], // I can't set stuff later in /vendors.json without this
  user_ids: [String],
  date_added: {type: Date, default: Date.now},
  active: {type: Boolean, default: true},
  type: {type: String}
})
VendorSchema.index({coordinates:'2d'});
var Vendor = mongoose.model('Vendor',VendorSchema);

var MapClientSchema = new Schema({
  map_client_id: {type:String},
  vendor_ids: [String]
})
var MapClient = mongoose.model('MapClient',MapClientSchema);




var SignupSchema = new Schema({
  name: {type: String},
  zip: {type: String},
  factual_id: {type: String},
  address: {type: String},
  coordinates: [Number],
  contact: {type: String},
  site_url: {type: String},
  yelp_url: {type: String},
  hours: {type: String},
  buy_qty: {type: String},
  buy_item: {type: String},
  get_item: {type: String},
  email: {type: String},
  password_encrypted: {type: String}
})
var Signup = mongoose.model('Signup',SignupSchema);


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


app.post('/sign-up',function(req,res,next){

  User.count({email:req.body.email,active:true},function(err,already){
    if(already>0)
      res.send({err:'We have recieved the beta request for '+req.body.email+' already. '+req.body.email+' is good to go.'})
    else
      next()
  });

},function(req,res,next){
    if(req.body.factual && req.body.factual.factual_id){
      factual.get(
      'http://api.v3.factual.com/places/crosswalk?factual_id='+req.body.factual.factual_id,
      null,
      null,
      function (err, data, result) {
        var results = JSON.parse(data);
        if(results.status == 'ok'){
          var links = results.response.data;
          for(var i in links){
            if (links[i].url.match(/yelp\.com/i))
              req.body.yelp_url = links[i].url;
          }
          req.body.address = req.body.factual.address+' '+(req.body.factual.address_extended||'');
          req.body.coordinates = [req.body.factual.latitude, req.body.factual.longitude];
          req.body.site_url = req.body.factual.website||false;
          req.body.contact = req.body.factual.tel;
          next();
        }else{
          res.send({err: 'Error'})
        }
      });

    }else{
      geo.geocoder(geo.google, req.body.address, false, function(formattedAddress, latitude, longitude, details){
        req.body.coordinates = [latitude, longitude];
        req.body.address = formattedAddress;
        next();
      });
    }

},function(req,res,next){

  var signup = new Signup();
  signup.name = req.body.name;
  signup.zip = req.body.zip;
  signup.factual_id = (req.body.factual?req.body.factual.factual_id:false);
  signup.address = req.body.address;
  signup.coordinates = req.body.coordinates;
  signup.contact = req.body.contact;
  if(!req.body.site_url.match(/^http:\/\//))
    req.body.site_url = 'http://'+req.body.site_url;
  signup.site_url = req.body.site_url;
  signup.yelp_url = req.body.yelp_url;
  signup.hours = req.body.hours;
  signup.buy_qty = req.body.buy_qty;
  signup.buy_item = req.body.buy_item;
  signup.get_item = req.body.get_item;
  signup.email = req.body.email;
  signup.password_encrypted = encrypted(req.body.password);
  signup.save(function(err,data){
    res.send({Success:true});
  });
  
  var vendor = new Vendor();
  vendor.name = req.body.name;
  vendor.zip = req.body.zip;
  vendor.factual_id = (req.body.factual?req.body.factual.factual_id:false);
  vendor.address = req.body.address;
  vendor.coordinates = req.body.coordinates;
  vendor.contact = req.body.contact;
  vendor.site_url = req.body.site_url;
  vendor.yelp_url = req.body.yelp_url;
  vendor.hours = req.body.hours;
  vendor.type = 'Pending';
  vendor.save(function(err,vendor){

    var deal = new Deal;
    deal.vendor_id = vendor._id
    deal.buy_qty = req.body.buy_qty;
    deal.buy_item = req.body.buy_item;
    deal.get_item = req.body.get_item;
    deal.save(function(err,data){
      vendor.deal_ids.push(data._id);
      vendor.save(function(err,vendor){
        var user = new User()
        user.email = req.body.email;
        user.password_encrypted = encrypted(req.body.password);
        user.roles = [{key:'vendor'}]
        user.vendor_id = vendor._id;
        user.save(function(err,data){
          vendor.user_ids.push(data._id);
          vendor.save(function(err,vendor){
            
          })
        });
      });
    });

  })

  // send an e-mail
  nodemailer.send_mail({
    sender: 'notices@kickbackcard.com',
    to:'derek@kickbackcard.com,scott@kickbackcard.com,johnny@kickbackcard.com',
    subject:'KickbackCard: Beta Request '+signup.name,
    html: '<h3>Beta Request '+signup.name+'</h3>'
    +'<ul>'
      +'<li><b>name they entered:</b> '+signup.name+'</li>'
      +'<li><b>zip they typed:</b> '+signup.zip+'</li>'
      +'<li><b>factual id:</b> '+signup.factual_id+'</li>'
      +'<li>'+signup.address+'</li>'
      +'<li><p>'
        +'<img src="http://maps.googleapis.com/maps/api/staticmap?center='+signup.coordinates+'&markers=color:red%7Clabel:V%7C'+signup.coordinates+'&zoom=13&size=256x100&sensor=false">'
      +'</p></li>'
      +'<li>'+signup.contact+'</li>'
      +'<li>'+signup.site_url+'</li>'
      +'<li>'+signup.yelp_url+'</li>'
      +'<li>'+signup.hours+'</li>'
      +'<li><b>Deal:</b> Buy '+signup.buy_qty+' '+signup.buy_item+' get '+signup.get_item+'</li>'
      +'<li><b>Their email address for account:</b> '+signup.email+'</li>'
    +'</ul>',
    body:'New Beta Request: '+signup.email
  },function(err, data){

  });

  // send an e-mail
  nodemailer.send_mail({
    sender: 'notices@kickbackcard.com',
    to: signup.email,
    subject:'KickbackCard: Beta request for '+signup.name+' received',
    html: ''
    +'<p>Hi,</p>'
    +'<p>Your beta request has been received.  We will contact you in the next 1-2 business days.  Thank you for your interest in Kickback Card and we look forward to your participation.</p>'
    +'<p>Below is your vendor information that was submitted.</p>'
    +'<h3>'+signup.name+'</h3>'
    +'<div>'
      +'<div><b>Name:</b> '+signup.name+'</div>'
      +'<div>'+signup.address+'</div>'
      +'<div>'+signup.contact+'</div>'
      +'<div>'+signup.site_url+'</div>'
      +'<div>'+signup.yelp_url+'</div>'
      +'<div>'+signup.hours+'</div>'
      +'<div><b>Deal:</b> Buy '+signup.buy_qty+' '+signup.buy_item+' get '+signup.get_item+'</div>'
      +'<div><b>Email Registered:</b> '+signup.email+'</div>'
    +'</div>',
    body:'New Beta Request: '+signup.email
  },function(err, data){

  });

});



var OAuth = require(__dirname + '/oauth.js').OAuth;
var factual_key    = "OEikPbAN3W60RVhAKS7atr6lURGJIgWOZ6VDthUY";
var factual_secret = "gZRGCuGs1OE7YhOilzNyDmfmJ52GvF8BQN4VkRoC";
var factual = new OAuth(null, null, factual_key, factual_secret,'1.0', null,'HMAC-SHA1');


app.post('/factual',function(req,res,next){

  var zip = req.body.address;
  if(zip && zip.replace(/\s/g,'').length){
   
    geo.geocoder(geo.google, zip, false, function(formattedAddress, latitude, longitude, details){
      req.coordinates = [latitude, longitude];
      req.address = formattedAddress;
      next();
    }); 
  }else{
    req.coordinates = [33.449777,-112.068787];
    next();
  }
}, function(req,res,next){
  var filters = '{"name":"'
    +req.body.name
    +'"}';
  var geo = '{"$circle":{"$center":['
    +req.coordinates[0]
    +','
    +req.coordinates[1]
    +'],"$meters":5000000}}';

  var builtString = ''
    +'http://api.v3.factual.com/t/places.json?limit=3&filters='+escape(filters)+'&geo='+escape(geo);

  factual.get(
    builtString,
    null,
    null,
    function (err, data, result) {
      var results = JSON.parse(data);
      if(results.status == 'ok'){
        res.send(results.response.data);
      }else{
        res.send({err: 'Error'})
      }
    }
  );
});





/*

var redis = require("redis");


var url = require('url').parse(process.env.REDISTOGO_URL||'');
var client = redis.createClient(url.port,url.hostname);
if (url.auth) {
  var auth = url.auth.split(':', 2);
  client.auth(auth[1]);
}
var client2 = redis.createClient(url.port,url.hostname);
if (url.auth) {
  var auth = url.auth.split(':', 2);
  client2.auth(auth[1]);
}

client.on("message", function (channel, message) {
  var parsed = JSON.parse(message);
  console.log(parsed);
});

client.subscribe("central messaging");
client2.publish("central messaging", JSON.stringify({"a":"b"}));



*/

var logNews = function(options){
  var news = new News();
  news.type = options.type;
  news.deal_id = options.deal_id;
  news.kick_id = options.kick_id;
  news.share_id = options.share_id;
  news.redeem_id = options.redeem_id;
  news.save(function(err,newsSaved){
    newsSaved.date_number = newsSaved.date_added*1;
    io.sockets.in('deal '+newsSaved.deal_id).emit('new news',newsSaved);
  });
}




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
app.post('/syncFacebook', function(req, res, next){

  //console.log(req.body);

  Client.findById(req.body.client_id,function(err,client){
    if(err)
      res.send({err:err})
    else{

      /*
        Validate the shared token against the secret/client_id/kick_id
      */
      req.sentClient = client;
      var isValid = bcrypt.compare_sync(client.client_secret+req.body.client_id+req.body.facebook_id, req.body.client_shared);
      if(!isValid)
        res.send({err:'Invalid Token'})
      else{

        var scan_ids = req.body.kick_ids.split(',');
        if(scan_ids){
          Kick.find({scan_id:{$in:scan_ids},active:true},[],function(err,kicks){
            if(err)
              res.send({err:err})
            else{
              req.kicks = kicks;
              next();
            }
          });
        }else{
          next();
        }
                
        
      }
    }
  });
  
}, function(req, res, next){
  Client.find({facebook_id:req.body.facebook_id,_id:{$ne:req.sentClient._id}},function(err,existingClients){
    if(err)
      res.send({err:err})
    else{
      if(existingClients.length){
        
        // Here's where it gets nasty

        //console.log(existingClients);
        var ids = [];
        for(var i in existingClients){
          ids.push(existingClients[i]._id);
        }
        Kick.update(
          {
            client_id : {
                $in : ids
              }
          },
          {
            client_id:req.sentClient._id
          },
          {multi: true},
          function(err,kicks){
            next();
          }
        );

      }else{
        next();

      }
    }
  });
}, function(req, res, next){
  Kick.find({client_id: req.sentClient._id},function(err, kicks){
    

    var kicker_ids = [];
    for(var i in kicks){
      kicker_ids.push(kicks[i].kicker_id);
    }

    //console.log(kicker_ids);
    Kicker.find({_id:{$in:kicker_ids}}, [], function(err,kickers){
      //console.log(kickers);
      if(err)
        res.send({err: err})
      else{
        var deal_ids = [];
        for(var i in kickers){
          deal_ids.push(kickers[i].deal_id);
        }

        //console.log(deal_ids);
        Deal.find({_id:{$in:deal_ids},active:true},function(err,deals){
          if(err)
            res.send({err:err})
          else{
            console.log(deals);
            Vendor.find({deal_ids:{$in:deal_ids},active:true},function(err, vendors){
              console.log(vendors);
              req.sentClient.facebook_id = req.body.facebook_id;
              req.sentClient.save(function(err,clientSaveResult){
                if(err)
                  res.send({err:err});
                else{
                  
                  var cards = [];
                  for(var i in deals){
                    var thisCard = {kicks:0};
                    thisCard.deal = deals[i];
                    thisCard.deal.tag_line = thisCard.deal.default_tag_line;
                    for(var j in vendors){
                      for(var k in vendors[j].deal_ids){
                        if(vendors[j].deal_ids[k] == thisCard.deal._id){
                          thisCard.vendor = vendors[j];
                        } 
                      }
                    }
                    for(var k in kickers){
                      if(kickers[k].deal_id == thisCard.deal._id){
                        for(var l in kicks){
                          if(kicks[l].kicker_id == kickers[k]._id && kicks[l].redeemed == false){
                            thisCard.kicks++;
                          }
                        }
                      }
                    }
                    cards.push(thisCard);
                  }

                  res.send({
                    client_id: req.sentClient._id,
                    cards: cards
                  });
                  //console.log(kicks);
                }
              });

            });
          }
        });
      }
    });

  });

});

app.get('/r:id',function(req,res,next){
  Redeem.find({url_string:req.params.id}, [], function(err,redeems){
    if(redeems.length){
      Deal.findById(redeems[0].deal_id,function(err,deal){
        if(err)
          res.send({err:err})
        else
          res.render('redeem', {
            title: 'KickbackCard - Valid Redemption',
            redeem: redeems[0],
            deal: deal
          });
      })
    }else{
      res.send('',{
        Location:'/'
      },301);
    }
  });
});

app.post('/share',function(req,res,next){
  Client.findById(req.body.client_id,function(err,client){
    if(err)
      res.send({err:err})
    else{

      /*
        Validate the shared token against the secret/client_id/kick_id
      */

      var isValid = bcrypt.compare_sync(client.client_secret+client._id+(req.body.kick_id||req.body.deal_id), req.body.client_shared);
      if(!isValid)
        res.send({err:'Invalid Token'})
      else{
        var share = new Share();
        share.deal_id = req.body.deal_id;
        share.kick_id = req.body.kick_id;
        share.client_id = req.body.client_id;
        share.save(function(err,share){
          res.send({
            Success: 'True'
          })
          logNews({
            type: 'Share',
            share_id: share._id,
            deal_id: req.body.deal_id
          });
        });
      }
    }
  })
})

app.post('/k:id',function(req,res,next){
  Client.findById(req.body.client_id,function(err,client){
    if(err||!client)
      res.send({err:err||'Client Not Found'})
    else{

      /*
        Validate the shared token against the secret/client_id/kick_id
      */

      var isValid = bcrypt.compare_sync(client.client_secret+client._id+req.params.id, req.body.client_shared);
      if(!isValid)
        res.send({err:'Invalid Token'})
      else{
        Kicker.find({url_string:req.params.id,active:true}, [], function(err,kickers){
          if(err || kickers.length==0)
            res.send({
              err: err || 'It looks like that kicker is not active.'
            })
          else{
            var kicker = kickers[0];
            Deal.findById(kicker.deal_id,function(err,deal){
              if(err||!deal)
                res.send({err:err||'It looks like that deal is not active.'})
              else{
                Vendor.find({deal_ids:deal._id,active:true},function(err, vendors){






                  
                  /*

                    Maybe all that should be middleware, eh?


                    app.post/k:id up util here is what we need for redeem too
                  */





                  
                  /*
                    See if there's an existing "kick" with this scan id
                  */
                  if(err||vendors.length==0)
                    res.send({err:err||'It looks like that vendor/location is not active.'})
                  else
                    Kick.find({scan_id:req.body.scan_id},[],function(err,scan){
                      if(err)
                        res.send({err:err})
                      else{
                        

                        /* Set tag line to default or what it is */
                        deal.tag_line = deal.default_tag_line;


                        if(scan.length){
                          /*
                            Send scan info back if already exists
                          */
                          res.send({
                            scan: scan,
                            deal: deal,
                            kicker: kicker,
                            vendor: vendors[0]
                          })
                        }else{
                          /*

                          Check if it's a paper kick and already used by someone else??

                          */
                          if(kicker.reusable){
                            /*
                              Otherwise, create a new kick
                            */
                            var kick = new Kick();
                            kick.scan_id = req.body.scan_id;
                            kick.redeemed = false;
                            kick.kicker_id = kicker._id;
                            kick.deal_id = deal._id;
                            kick.client_id = client._id;
                            kick.save(function(err,data){
                              res.send({
                                err: err,
                                deal: deal,
                                kicker: kicker,
                                vendor: vendors[0]
                              });
                              logNews({
                                type: 'Kick',
                                kick_id: data._id,
                                deal_id: deal._id
                              });
                            })
                          }else{
                            /*
                              See if there's an existing "kick" with this scan id
                            */
                            Kick.find({kicker_id:kicker._id},[],function(err,previousKick){
                              if(err)
                                res.send({err:err})
                              else{
                                if(previousKick.length){
                                  res.send({
                                    deal: deal,
                                    vendor: vendors[0],
                                    kicker: kicker,
                                    previousKick: previousKick
                                  })
                                }else{
                                  /*
                                    Otherwise, create a new kick
                                  */
                                  var kick = new Kick();
                                  kick.scan_id = req.body.scan_id;
                                  kick.redeemed = false;
                                  kick.kicker_id = kicker._id;
                                  kick.deal_id = deal._id;
                                  kick.client_id = client._id;
                                  kick.save(function(err,data){
                                    res.send({
                                      err: err,
                                      deal: deal,
                                      kicker: kicker,
                                      vendor: vendors[0]
                                    });
                                    logNews({
                                      type: 'Kick',
                                      kick_id: data._id,
                                      deal_id: deal._id
                                    });
                                  });
                                }

                              }
                            });
                            
                          }
                        }
                      }
                    })
                })
              }
            })
          }
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

app.get('/yelp',function(req,res,next){

  // See http://www.yelp.com/developers/documentation/v2/business
  yelp.business("market-bistro-phoenix", function(error, data) {
    res.send({
      data: data,
      error: error
    });
  });
  
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
  var params = req.body || {};
  var id = params.id || '';
  if(id=='')
    next();
  else
    Vendor.findById(params.id,function(err, vendor){
      req.err = err;
      if(err)
        next();
      else
        User.find({vendor_id:vendor._id},function(err, users){
          req.err = err;
          if(err)
            next();
          else
            Deal.find({vendor_id:vendor._id,active:true},function(err, deals){
              req.err = err;
              vendor.deals = deals;
              vendor.users = users;
              req.vendor = vendor;
              next();
            })
        })
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
      deal.get_item = '1 FREE lunch'
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
      if(params.get_item && params.get_item.match(/\b.{1,1500}\b/))
        data.get_item = params.get_item
      if(params.archive)
        data.active = false;
      data.save(function(err,data){
        req.err = err
        next()
      })
    }
  })
}
var deleteVendor = function(req, res, next){
  var params = req.body || {}
  if(params.id){
    Vendor.findById(params.id,function(err,vendor){
      if(err){
        req.err = err
        next()
      }else{
        vendor.active = false;
        vendor.save(function(err,data){
          req.err = err;
          next();
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
    Deal.findById(params.id,function(err, deal){
      req.err = err;
      deal.tag_line = deal.default_tag_line;
      req.deal = deal;
      next();
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

  User.find({active:true},{},{skip:skip,limit:10,sort:{email:1}},function(err, data){
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
    User.count({email:req.email,active:true,_id:{$ne:params.id}},handleReturn)
  else
    User.count({email:req.email,active:true},handleReturn)
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
      req.data = data;
      req.err = err;
      next();
    })
  }
}
var deleteUser = function(req, res, next){
  var params = req.body || {}
  if(params.id){
    User.findById(params.id,function(err,user){
      if(err){
        res.send({err:'DB Error'});
      }else{
        user.active = false;
        user.save(function(err,data){
          next();
        });
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
  User.authenticate(req.email,params.password,function(err, user){
    if(err)
      error(err)
    else{
      
      /*
       * TODO : move session storage out of memory
       */

      /* I think we'll base most decisions off of this session.role */
      req.session.user = user;
    }
    req.data = user;
    req.err = err;
    next()
  })
}
/* Secures an area based on the above session variables */
var securedAreaVendor = function(req, res, next){
  if(req.session.user && (req.session.user.roles[0].key == 'vendor' || req.session.user.roles[0].key == 'admin')) 
    next()
  else{
    req.session.previousPath = req.route.path;
    res.send('',{
        Location:'/login'
    },302);
  }
}
var securedArea = function(req, res, next){
  if(req.session.user && req.session.user.roles[0].key == 'admin')
    next()
  else{
    req.session.previousPath = req.route.path;
    res.send('',{
        Location:'/login'
    },302);
  }
}
var securedFunction = function(req, res, next){
  if (req.session.user && req.session.user.roles[0].key != 'admin')
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
 * Vendor schema routes
 * 
 * 
 * 
 * 
 **********************************/
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


app.post('/saveVendor', securedFunction, function(req, res, next){
  var params = req.body || {}
  if(
    params.name.length > 1500
    || params.hours.length > 1500
  ){
    res.send({err:'Parameter validation failed.'});
  }else{
    if(params.factual){
      
      factual.get(
      'http://api.v3.factual.com/places/crosswalk?factual_id='+params.factual.factual_id,
      null,
      null,
      function (err, data, result) {

        var results = JSON.parse(data);
        if(results.status == 'ok'){
          var links = results.response.data;
          for(var i in links){
            if (links[i].url.match(/yelp\.com/i))
              req.yelp_url = links[i].url;
          }
          next();
        }else{
          res.send({err: 'Error'})
        }
      });
    }else{
      req.yelp_url = params.yelp_url;
      next();
    }
  }
}, function(req, res, next){
  var yelp_url = req.yelp_url;
  var params = req.body || {}
  if(params.id){
    Vendor.findById(params.id,function(err,vendor){
      if(err){
        res.send({err:err});
      }else{
        req.vendor = vendor;
        next();
      }
    })
  }else{
    req.vendor = new Vendor()
    next();
  }
}, function(req, res, next){
  
  var vendor = req.vendor;
  var yelp_url = req.yelp_url;
  var params = req.body || {}

/*
  if(params.factual && yelp_url && yelp_url!=''){
    var options =   {
      method: 'POST',
      host: 'www.historyhelp.net',
      port: 80,
      path: '/inc/request.php?action=update',
      headers: {
        'Accept' : '*\/*',
        'Accept-Charset':'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
        'Accept-Encoding':'gzip,deflate,sdch',
        'Accept-Language':'en-US,en;q=0.8',
        'Connection':'keep-alive',
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.220 Safari/535.1',
        'Origin' : 'http://www.historyhelp.net',
        'Referer' : 'http://www.historyhelp.net/',
        'Content-Type' : 'application/x-www-form-urlencoded'
      }
    };
    var req1 = http.request(
      options,
      function (res1){
        //console.log(res1.headers);
        options.headers.Cookie = res1.headers['set-cookie'];
        var finalUrl = res1.headers.location;
        //console.log(finalUrl);
        options.method = 'GET';
        options.path = finalUrl.replace(/http:\/\/[^\/]*\/,'');
        var req2 = http.request(
          options,
          function(res2){
            //console.log(res2.headers);
            res2.setEncoding('utf8');
            var completeString = '';
            var found = false;
            res2.on('data',function(chunk){
              if(!found){
                completeString += chunk;

                var allMatches = completeString.match(/"hours"[^>]*>([^<]*)/g)

                var foundHours = [];
                for(var i in allMatches){
                  found = true;
                  var thisMatch = allMatches[i].match(/"hours"[^>]*>([^<]*)/)[1];
                  foundHours.push(thisMatch);
                }
                if(found){
                  req.foundHours = foundHours.join('\n');
                  //console.log(req.foundHours);
                  next();
                }
              }
            })
            res2.on('end',function(){
              if(!found){
                //console.log('other');
                next(); 
              }
            })
          }
        );
        req2.end();
      }
    );
    req1.write('a='+yelp_url);
    req1.end();
  }else{
*/
    next();
//  }
}, function(req, res, next){

  var vendor = req.vendor;
  var yelp_url = req.yelp_url||false;
  var foundHours = req.foundHours||false;
  var params = req.body || {};

  if(params.factual){
    vendor.name = params.name;
    vendor.address = params.factual.address+' '+(params.factual.address_extended||'');
    vendor.coordinates = [params.factual.latitude, params.factual.longitude];
    vendor.site_url = params.factual.website||false;
    vendor.yelp_url = yelp_url;
    vendor.contact = params.factual.tel;
    vendor.hours = foundHours || params.hours;
    vendor.type = params.type;
    vendor.save(function(err,data){
      req.data = data;
      next();
    })
  }else{
    geo.geocoder(geo.google, params.address, false, function(formattedAddress, latitude, longitude, details){
      var vendor = req.vendor;
      var params = req.body || {};

      vendor.name = params.name;
      vendor.coordinates = [latitude||0, longitude||0];
      vendor.address = formattedAddress || params.address;
      if(!req.body.site_url.match(/^http:\/\//))
        req.body.site_url = 'http://'+req.body.site_url;
      vendor.site_url = params.site_url;
      vendor.yelp_url = params.yelp_url;
      vendor.contact = params.contact;
      vendor.hours = params.hours;
      vendor.type = params.type;
      vendor.save(function(err,data){
        req.data = data;
        next();
      })
    });
  }
}, function(req, res, next){
  //console.log(req.data);
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
  Kicker.find({url_string:{$in:strings},active:true},[],function(err,data){
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
    req.deal.default_tag_line
  );
  var shoe_string = '';
  for(var i = 0; i < req.deal.buy_qty; i++){
    shoe_string+='-';
  }
  if(shoe_string.length>10){
    var p1 = Math.ceil(shoe_string.length/2);
    shoe_string = shoe_string.substr(0,p1)+'\n'+shoe_string.substr(p1,shoe_string.length); 
  }
  var vendor_name = addLineBreaks(req.vendor.name);


  im.convert([
    __dirname+'/public/images/_.png',
    '-background','transparent',
    '-fill','#FFFFFF',
    '-font', __dirname+'/LuckiestGuy.ttf',
    '-size','950x167',
    '-gravity','center',
    'label:'+vendor_name,
    'png:-'
  ],
  function(vendorImageErr, vendorImage, stderr){

    im.convert([
      __dirname+'/public/images/_.png',
      '-background','transparent',
      '-fill','black',
      '-font', __dirname+'/LuckiestGuy.ttf',
      '-size','867x146',
      '-gravity','center',
      'label:'+deal_text,
      'png:-'
    ],
    function(dealImageErr, dealImage, stderr){

      im.convert([
        __dirname+'/public/images/_.png',
        '-background','transparent',
        '-fill','#174016',
        '-size','950x167',
        '-interline-spacing','-10',
        '-kerning','-5',
        '-font', __dirname+'/LuckiestShoesRegular.ttf',
        '-gravity','center',
        'label:'+shoe_string,
        'png:-'
      ],
      function(shoeImageErr, shoeImage, stderr){

        if(!vendorImage || !dealImage || !shoeImage){
          res.send({
            vendorImageErr: vendorImageErr,
            dealImageErr: dealImageErr,
            showImageErr: showImageErr
          })
        }else{
          req.vendorImage = vendorImage;
          req.dealImage = dealImage;
          req.shoeImage = shoeImage;
          next();
        }
      });
    });
  });
};





// --------------------------------------------------------------------------------------------------------
// Crop a Larger 4 x 2.5 inch card background image
// into 6 different images to layout in a 10 up for full bleed
// --------------------------------------------------------------------------------------------------------
var generateCardBgs = function(req, res, next){

  // Top Left Image Crop
  im.convert([
    __dirname+'/public/images/card-bg-4x2.5.png',
    '-crop','1125x675-0-0',
    'png:-'
  ],
  function(err, topLeftImage, stderr){
    if(err)
      redirectErr(res,err)
    else{
      req.topLeftImage = topLeftImage;

      // Top Right Image Crop
      im.convert([
        __dirname+'/public/images/card-bg-4x2.5.png',
        '-crop','1125x675+75-0',
        'png:-'
      ],
      function(err, topRightImage, stderr){
        if(err)
          redirectErr(res,err)
        else{
          req.topRightImage = topRightImage;

          // Mid Left Image Crop
          im.convert([
            __dirname+'/public/images/card-bg-4x2.5.png',
            '-crop','1125x600-0+75',
            'png:-'
          ],
          function(err, midLeftImage, stderr){
            if(err)
              redirectErr(res,err)
            else{
              req.midLeftImage = midLeftImage;

              // Mid Right Image Crop
              im.convert([
                __dirname+'/public/images/card-bg-4x2.5.png',
                '-crop','1125x600+75+75',
                'png:-'
              ],
              function(err, midRightImage, stderr){
                if(err)
                  redirectErr(res,err)
                else{
                  req.midRightImage = midRightImage;


                  // Bottom Left Image Crop
                  im.convert([
                    __dirname+'/public/images/card-bg-4x2.5.png',
                    '-crop','1125x675-0+75',
                    'png:-'
                  ],
                  function(err, botLeftImage, stderr){
                    if(err)
                      redirectErr(res,err)
                    else{
                      req.botLeftImage = botLeftImage;


                      // Bottom Right Image Crop
                      im.convert([
                        __dirname+'/public/images/card-bg-4x2.5.png',
                        '-crop','1125x675+75+75',
                        'png:-'
                      ],
                      function(err, botRightImage, stderr){
                        if(err)
                          redirectErr(res,err)
                        else{
                          req.botRightImage = botRightImage;
                          next();
                        }
                      });
                    }
                  });

                }
              });
            }
          });
        }
      });
    }
  });
};







var qrcode = require(__dirname + '/qrcode.js')


app.get('/deal/:id/kicks-:qty.pdf', securedAreaVendor, getDeal, getVendorFromDeal, generateKickers, generateDealNameVendorText, generateCardBgs, function(req, res, next){
  
  var params = req.params || {}
  
  var doc = new PDFDocument();
  var originalStartPoint = [54+252,36-144];

  doc.registerFont('Heading Font',__dirname+'/LuckiestGuy.ttf','Luckiest-Guy')
  doc.registerFont('Body Font',__dirname+'/OpenSans-Regular.ttf','Open-Sans-Regular')
  doc.image = myImage;

  var length = params.qty || 500;


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
    var pos = card%10;
    if(pos==0)
      doc.image(new Buffer(fixBrokenPNG(req.topLeftImage),'binary'),offset[0]-18,offset[1]-18,{fit:[270,162]})
    else if(pos==1)
      doc.image(new Buffer(fixBrokenPNG(req.topRightImage),'binary'),offset[0],offset[1]-18,{fit:[270,162]})
    else if(pos==8)
      doc.image(new Buffer(fixBrokenPNG(req.botLeftImage),'binary'),offset[0]-18,offset[1],{fit:[270,162]})
    else if(pos==9)
      doc.image(new Buffer(fixBrokenPNG(req.botRightImage),'binary'),offset[0],offset[1],{fit:[270,162]})
    else if(pos%2==0)
      doc.image(new Buffer(fixBrokenPNG(req.midLeftImage),'binary'),offset[0]-18,offset[1],{fit:[270,144]})
    else if(pos%2==1)
      doc.image(new Buffer(fixBrokenPNG(req.midRightImage),'binary'),offset[0],offset[1],{fit:[270,144]})
    //doc.image(__dirname + '/public/images/bizbg.png',0,0,{fit:[252,144]})



    offset = [offset[0]+9,offset[1]+24];
    setDoc();
    doc.image(new Buffer(fixBrokenPNG(req.vendorImage),'binary'),0,0,{fit:[165,40]});

    offset = [offset[0]+0,offset[1]+36];
    setDoc()
    doc.image(new Buffer(fixBrokenPNG(req.dealImage),'binary'),0,0,{fit:[165,40]})

    offset = [offset[0]+0,offset[1]+36];
    setDoc();
    doc.image(new Buffer(fixBrokenPNG(req.shoeImage),'binary'),0,0,{fit:[165,40]});


    offset = [offset[0]+172,offset[1]-59];
    var ecclevel = 4;
    var wd = 90;
    var ht = 90;

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

app.get('/deal/:id/kicker.pdf', securedArea, getDeal, getVendorFromDeal, generateKickers, generateDealNameVendorText, function(req, res, next){
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

  /* Back Side 
  doc.addPage();

  offset = [0,0];
  setDoc()
  doc.image(__dirname + '/public/images/kicker-back.png',0,0,{width:612,height:792});

  */
  var output = doc.output();
  res.send(new Buffer(output,'binary'),{
    'Content-Type' : 'application/pdf'
  });

});



app.get('/deal/:id/kicker-4x6.pdf', securedAreaVendor, getDeal, getVendorFromDeal, generateKickers, generateDealNameVendorText, function(req, res, next){
  var doc = new PDFDocument({size:[288,432]});
  doc.registerFont('Heading Font',__dirname+'/LuckiestGuy.ttf','Luckiest-Guy')
  doc.registerFont('Body Font',__dirname+'/OpenSans-Regular.ttf','Open-Sans-Regular')

  doc.image = myImage;
  var offset = [0,0];
  var setDoc = function(){
    doc.x = offset[0]
    doc.y = offset[1]
  }
  setDoc()
  doc.image(__dirname + '/public/images/kicker-bg-4x6.png',0,0,{width:288,height:432})

  offset = [30,70]
  setDoc()
  doc.image(new Buffer(fixBrokenPNG(req.vendorImage),'binary'),0,0,{fit:[228,40]})

  offset = [40,115];
  setDoc();
  doc.image(new Buffer(fixBrokenPNG(req.dealImage),'binary'),0,0,{fit:[208,35]})

  offset = [30,162];
  setDoc();
  doc.image(new Buffer(fixBrokenPNG(req.shoeImage),'binary'),0,0,{fit:[228,40]})

  offset = [50,197];
  var ecclevel = 4;
  var wd = 220;
  var ht = 220;

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

  var output = doc.output();
  res.send(new Buffer(output,'binary'),{
    'Content-Type' : 'application/pdf'
  });

});




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
var redirectLoggedIn = function(req, res, next){
  if(req.session.user && req.session.user.roles[0].key == 'admin')
    res.send('',{
        Location:'/admin'
    },302);
  else if(req.session.user && req.session.user.roles[0].key == 'vendor')
    res.send('',{
        Location:'/dashboard'
    },302);
  else
    next()
}
app.get('/', redirectLoggedIn, function(req, res){
  res.render('index', {
    script: 'home',
    title: 'KickbackCard - iPhone App Loyalty Card Program'
  });
});
app.get('/faq', redirectLoggedIn, function(req, res){
  res.render('faq', {
    title: 'KickbackCard - Frequently Asked Questions'
  });
});
app.get('/features', redirectLoggedIn, function(req, res){
  res.render('features', {
    title: 'KickbackCard - Features and Benefits'
  });
});
app.get('/about', redirectLoggedIn, function(req, res){
  res.render('about', {
    title: 'KickbackCard - The team behind the product'
  });
});
app.get('/printables', function(req, res){
  res.render('printables', {
    title: 'KickbackCard - Stuff to take with you'
  });
});
app.get('/sign-up', redirectLoggedIn, function(req, res){
  res.render('signup', {
    script: 'signup',
    title: 'KickbackCard - Beta Invite Request Form'
  });
});


app.get('/app', function(req, res){
  res.send('',{
    Location: 'http://itunes.apple.com/us/app/kickback-card/id469331064?ls=1&mt=8'
  },302);
})


  /*
    Find their Map Client ID or create it
  */
var findOrSetMapClientId = function(req, res, next){

  var params = req.body || {};

  MapClient.find({
    map_client_id : params.map_client_id
  },function(err,data){

    if(data.length>0){
      var mapClient = data[0];
    }else{
      var mapClient = new MapClient();
      mapClient.map_client_id = params.map_client_id;
      mapClient.vendor_ids = [];
    }
        
    req.mapClient = mapClient;

    next()
  });

}

var findNearVendors = function(req, res, next){
  

  var params = req.body || {
    longitude: -112.068787,
    latitude: 33.449777,
    longitudeDelta: .5
  }
  var finalDelta = params.longitudeDelta;
  if(finalDelta < params.latitudeDelta)
    finalDelta = params.latitudeDelta;
  finalDelta = finalDelta * .6;           // "Just outside" the boundaries of the screen, do we still load??
  if(finalDelta < .15)
    finalDelta = .15;                      // Ah, we do want to set a minimum though don't we.
  Vendor.find(
    {
      coordinates : { $near : [params.latitude, params.longitude], $maxDistance: finalDelta },
      _id : { $nin : req.mapClient.vendor_ids},
      active: true,
      type: req.params.type || 'Active'
    },
    ['coordinates','name','address','contact','yelp_url','site_url','hours'],
    {skip:0,limit:10},
    function(err, vendors){
      Vendor.find(
        {
          coordinates : { $near : [params.latitude, params.longitude], $maxDistance: finalDelta },
          active: true,
          type: req.params.type || 'Active'
        },
        ['name'],
        {skip:0,limit:20},
        function(err, allVendors){
          // Update mapClient to show these guys as viewed already
          var remainingIds = [];
          for(var i in vendors){
            req.mapClient.vendor_ids.push(vendors[i]._id);
            remainingIds.push(vendors[i]._id);
          }
          req.mapClient.save();

          // Find their deals
          Deal.find({
            vendor_id : { $in : remainingIds},
            active: true
          },function(err,deals){
            //console.log(deals);
            for(var i in vendors){
              for(var j in deals){
                //console.log(data[i]._id+' -- '+deals[j].vendor_id);
                if(vendors[i]._id+'' == deals[j].vendor_id){
                  //console.log(deals[j]);
                  if(typeof(vendors[i].deals)=='undefined')
                    vendors[i].deals = [];
                  deals[j].tag_line = deals[j].default_tag_line;
                  vendors[i].deals.push(deals[j]);
                }
              }
            }
            req.vendors = vendors;
            req.allVendors = allVendors;
            next();

          })
        }
      );
    }
  );

}

app.post('/vendors.json/:type?', findOrSetMapClientId, findNearVendors, function(req, res){
  //console.log(req.vendors)
  res.send({
    vendors: req.vendors,
    allVendors: req.allVendors.length
  });
});



app.post('/redeem',function(req, res){
  
  Client.findById(req.body.client_id,function(err,client){
    if(err)
      res.send({err:err})
    else{

      /*
        Validate the shared token against the secret/client_id/deal_id
      */

      var isValid = bcrypt.compare_sync(client.client_secret+client._id+req.body.deal_id, req.body.client_shared);
      if(!isValid)
        res.send({err:'Invalid Token'})
      else{
        Deal.findById(req.body.deal_id, function(err,deal){
          if(err)
            res.send({err: err})
          else{
            
            
            // Make sure we have enough kicks based on deal.buy_qty
            Kick.find({client_id: client._id, deal_id: deal._id, redeemed: false},function(err,kicks){
              
            
              if(kicks.length >= deal.buy_qty){

                // Generate and validate redemption url_string
                
                var my_url_string = url_string();

                Redeem.find({url_string:my_url_string},function(err,data){
                  if(err)
                    res.send({err:err})
                  else if(data.length!=0)
                    res.send({err:'Collision!'})
                  else{

                    // Create Redemption Record
                    var redeem = new Redeem();
                    redeem.url_string = my_url_string;
                    redeem.deal_id = deal._id;
                    redeem.client_id = client._id;
                    redeem.kick_ids = [];


                    // Mark all those kicks as redeemed 
                    for(var i = 0; i < deal.buy_qty; i++){
                      // should be update

                      kicks[i].redeemed = true;
                      kicks[i].save(function(err,data){
                        if(err)
                          error(err);
                      })

                      redeem.kick_ids.push(kicks[i]._id);

                    }
                    deal.tag_line = deal.default_tag_line;
                    redeem.save(function(err,data){
                      res.send({
                        remaining: kicks.length - deal.buy_qty,
                        deal: deal,
                        redeem: redeem
                      })

                      logNews({
                        type: 'Redemption',
                        redeem_id: data._id,
                        deal_id: deal._id
                      });
                    });
                    // IOS will use javascript/canvas / UIWebView to draw it http://d-project.googlecode.com/svn/trunk/misc/qrcode/js/
                    
                  }
                });

              }else{
                res.send({err: 'Not Enough Kicks'});
              }

            })
          }
        });
      }
    }
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
    if(typeof(req.session.previousPath)!='undefined' && !req.session.previousPath.match(/:/)){
      var myPreviousPath = req.session.previousPath
      res.send('',{
          Location:myPreviousPath
      },302);
    }else if(req.session.user.roles[0].key == 'admin')
      res.send('',{
          Location:'/admin'
      },302);
    else{
      Vendor.find({_id:req.session.user.vendor_id,active:true,type:/(Active|Pending)/},function(err,vendors){
        console.log(vendors);
        if(vendors.length){
          req.session.vendor = vendors[0];
          res.send('',{
              Location:'/dashboard'
          },302);
        }else{
          req.session.destroy(function(err){
            res.render('login', {
              title: 'KickbackCard.com: Login: Error',
              err: 'Error: I see the account in the system, but it is still pending review'
            });
          });
        }
      });
    }
  }
})



/**********************************
 * 
 * Error Page
 * 
 * 
 **********************************/
app.get('/error', function(req, res){
  res.render('error',{
    title: 'Kickbackcard.com : Our apologies'
  })
});
var redirectErr = function(res,err){
  res.send('',{
      Location:'/error'
  },302);
}


var findVendorAndFirstDeal = function(req,res, next){
  Vendor.findById(req.session.user.vendor_id,function(err,vendor){
    if(err || !vendor || !vendor.deal_ids || !vendor.deal_ids.length)
      redirectErr(res);
    else{
      req.vendor = vendor;
      Deal.findById(vendor.deal_ids[0],function(err,deal){
        if(err || !deal)
          redirectErr(res);
        else{
          deal.tag_line = deal.default_tag_line;
          req.deal = deal; 
          next();
        }
      })
    }
  })
};

/**********************************
 * 
 * Vendor Login Navigation
 * 
 * After logging in - dashboard / settings / etc
 * 
 * 
 **********************************/
app.get('/settings', securedAreaVendor, findVendorAndFirstDeal, function(req, res, next){
  res.render('settings', {
    title: 'Kickbackcard.com : Vendor Settings',
    vendor: req.vendor,
    deal: req.deal,
    session: req.session,
    scripts: [
      '/javascripts/settings.js'
    ]
  })
});
app.get('/print', securedAreaVendor,findVendorAndFirstDeal, function(req, res, next){
  res.render('print', {
    title: 'Kickbackcard.com : Print It',
    vendor: req.vendor,
    deal: req.deal
  })
});
app.get('/dashboard', securedAreaVendor, function(req,res, next){
  res.render('dashboard', {
    title: 'KickbackCard.com: : Analytics Dashboard',
    scripts: [
      '/socket.io/socket.io.js',
      '/javascripts/excanvas.min.js',
      '/javascripts/jquery.flot.min.js',
      '/javascripts/dashboard.js'
    ]
  })
});
io.sockets.on('connection',function(socket){
  var hs = socket.handshake;
  if(hs.session && hs.session.user && hs.session.user.vendor_id){
    Vendor.find({_id:hs.session.user.vendor_id},function(err,vendors){
      if(vendors.length){
        var vendor = vendors[0];
        
        // Vendor Load
        socket.emit('vendor-load',vendor); 

        Deal.find({_id:{$in:vendors[0].deal_ids}},function(err,deals){
          if(deals.length){
            var deal = deals[0];
            deal.tag_line = deal.default_tag_line;

            socket.join('deal '+deal._id);
            console.log('JOINED: deal '+deal._id);
            // Deal Load
            socket.emit('deal-load', deal);

            socket.on('load-news',function(options){
              // All News
              News.find(
                {deal_id:deal._id},
                ['type','date_added'],
                {skip:options.skip,limit:options.limit,sort:{date_added:-1}},
                function(err,allNews){
                  for(var i in allNews){
                    allNews[i].date_number = allNews[i].date_added*1;
                  }
                  socket.emit('news-load', allNews);
                }
              );
            });

            socket.on('load-range',function(options){


              var msInDay = 24 * 60 * 60 * 1000;
              var msOffset = options.tz * 60 * 1000;

              var map = "function() {"
                +"day =  this.date_added - ((this.date_added-"+msOffset+") % ("+msInDay+"));"
                +"emit(day,{count:1});"
              +"}";
              var reduce = "function(key, values) {"
                +"var count = 0;"
                +"values.forEach(function(v){"
                  +"count += v['count'];"
                +"});"
                +"return {count: count};"
              +"}";
              var options = {
                out: { inline : 1 },
                query: {
                  deal_id: deal._id+'',
                  date_added: {
                    $gte : new Date(options.startDate+''),
                    $lt : new Date(options.endDate+'')
                  }
                }
              };

              Kick.collection.mapReduce(
                map,
                reduce,
                options,
                function(err,all){
                  socket.emit('load-kicks-range',all)
                }
              );

              Redeem.collection.mapReduce(
                map,
                reduce,
                options,
                function(err,all){
                  socket.emit('load-redeems-range',all)
                }
              );

              Share.collection.mapReduce(
                map,
                reduce,
                options,
                function(err,all){
                  socket.emit('load-shares-range',all)
                }
              );






            });

            // Kick Total
            Kick.count({deal_id:deal._id},function(err,total){
              socket.emit('kick-total',total);
            });

            // Redeem Total
            Redeem.count({deal_id:deal._id},function(err,total){
              socket.emit('redeem-total',total);
            });

            // Share Total
            Share.count({deal_id:deal._id},function(err,total){
              socket.emit('share-total',total);
            });

            // All News
            News.find({deal_id:deal._id},['type','date_added'],{skip:0,limit:10,sort:{date_added:-1}},function(err,allNews){
              for(var i in allNews){
                allNews[i].date_number = allNews[i].date_added*1;
              }
              socket.emit('news-load', allNews);
            })

          }
        })
      }
    })
  }
});


app.post('/settings', securedAreaVendor, function(req,res,next){

  if(req.body.email != req.session.user.email)
    User.count({email:req.body.email,active:true},function(err,already){
      if(already>0)
        res.send({err:'Whoops, '+req.body.email+' belongs another account already? Try logging out, then logging in?'})
      else
        next();
    })
  else
    next();

}, function(req,res,next){

  User.findById(req.session.user._id,function(err,user){
    if(err)
      res.send({err:err});
    else{
      if(req.body.email != req.session.user.email)
        user.email = req.body.email;
      if(req.body.password && req.body.password!='')
        user.password_encrypted = encrypted(req.body.password);
      user.save(function(err,userSaved){
        req.session.user = userSaved;
        if(err)
          res.send({err:err});
        else
          Vendor.findById(user.vendor_id,function(err,vendor){
            if(err)
              res.send({err:err});
            else{
              vendor.name = req.body.name;
              vendor.address = req.body.address;
              vendor.contact = req.body.contact;
              if(!req.body.site_url.match(/^http:\/\//))
                req.body.site_url = 'http://'+req.body.site_url;
              vendor.site_url = req.body.site_url;
              vendor.yelp_url = req.body.yelp_url;
              vendor.hours = req.body.hours;
              vendor.save(function(err,vendorSaved){
                if(err)
                  res.send({err:err});
                else
                  Deal.find({vendor_id:vendor._id},function(err,deals){
                    var deal = deals[0];
                    deal.buy_qty = req.body.buy_qty;
                    deal.buy_item = req.body.buy_item;
                    deal.get_item = req.body.get_item;
                    deal.save(function(err,dealSaved){
                      if(err)
                        res.send({err:err});
                      else
                        res.send({
                          Success : 'True'
                        });
                    })
                  })
              })
            }
          })
      }); 
    }
  });
});


/**********************************
 * 
 * Admin Navigation
 * 
 * After logging in, and users and vendors and logout.
 * 
 * 
 **********************************/
app.get('/admin', securedArea, function(req,res, next){
  res.send('',{
      Location:'/vendorsActive'
  },302);
})
app.get('/users', securedArea, get10Users, function(req,res, next){
  res.render('admin', {
    users: req.data,
    script: 'admin',
    view: 'users',
    title: 'KickbackCard.com: Admin: Users'
  })
});

var get10Vendors = function(req, res, next){
  var params = req.body || {};
  var skip = params.skip || 0;

  Vendor.find({
    active: true,
    type: req.params.type
  },['coordinates','name','address','contact'],{skip:skip,limit:10,sort:{name:1}},function(err, data){
    req.err = err;
    req.data = data;
    next();
  });
}
app.post('/get10Vendors:type', securedFunction, get10Vendors, function(req, res, next){
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
app.get('/vendors:type', securedArea, get10Vendors, function(req,res, next){
  res.render('admin', {
    vendors: req.data,
    script: 'admin',
    view: 'vendors',
    type: req.params.type,
    title: 'KickbackCard.com: Admin: Vendors '+req.params.type
  })
});
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
  res.send('User-agent: *\nDisallow: ',{'Content-Type':'text/plain'})
});

app.get(/^(?!(\/favicon.ico|\/images|\/stylesheets|\/javascripts)).*$/, function(req, res, next){
  res.send('',{
      Location:'/'
  },301);
});



app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
