/*
 Google Analytics
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25705975-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


/*
Woopra Analytics
*/
function woopraReady(tracker) {
    tracker.setDomain('kickbackcard.com');
    tracker.setIdleTimeout(300000);
    tracker.track();
    return false;
}
(function() {
    var wsc = document.createElement('script');
    wsc.src = document.location.protocol+'//static.woopra.com/js/woopra.js';
    wsc.type = 'text/javascript';
    wsc.async = true;
    var ssc = document.getElementsByTagName('script')[0];
    ssc.parentNode.insertBefore(wsc, ssc);
})();

$(function(){


  var scrollbarWidth = $.scrollbarWidth();
  /**********************************
   * 
   * Set settings / defaults
   * 
   * AJAX defaults
   * some constants
   * 
   **********************************/
  $.ajaxSetup({
    type: 'POST'
  })
  var usualDelay = 4000
  var $window = $(window)
  $.fx.speeds._default = 300

  

  /**********************************
   * 
   * Everypage functions today for Everyday pages tomorrow
   * 
   * like making the logo redirect to home from anywhere
   * 
   * 
   **********************************/
  $('div.logo').click(function(){document.location.href='/'})

  $('.convert-date').each(function(){
    var $t = $(this);
    var d = new Date($t.html());
    $t.html((d+'').replace(/GMT-[^ ]*/,''));
  })

  
  /***********************************
   *
   *
   *
   *
   *
   *
   ************************************/

  /***********************************
   *
   *
   *
   *
   *
   *
   ************************************/




})

/**********************************
 * 
 * Set settings / defaults
 * 
 * AJAX defaults
 * some constants
 * 
 **********************************/
$.ajaxSetup({
  type: 'POST'
})
var usualDelay = 4000
var $window = $(window)
$.fx.speeds._default = 300

/**********************************
 * 
 * Modal Handling Functions
 * 
 * show tooltip, can be used on any element with jquery
 * 
 * 
 **********************************/
$.fn.showTooltip = function( options ) {  
  var settings = {
    position: 'below' /* Can also be below */
  }
  return this.each(function() {
    if(options)
      $.extend( settings, options )

    var $t = $(this);
    var offset = $t.offset()
    var data = $t.data('tooltips')
    if(!data)
      data = [];
    if(settings.message){
      var tooltip = $('<div class="tooltip" />')
      tooltip.html(settings.message)
      tooltip.css({
        left: offset.left,
        top: offset.top + (settings.position=='below'?($t.height()+40):0)
      })
      $('body').append(tooltip)
      for(var i in data){
        data[i].stop(true,true).fadeOut()
      }
      data.push(tooltip)
      if(data.length>5){
        var toRemove = data.shift()
        toRemove.remove()
      }
      $t.data('tooltips',data)
    }else{
      var tooltip = data[data.length-1]
    }


    /*

    TODO : Make the animation in a custom slide up / slide down thing with $.animate

    */
    tooltip.stop(true,true).fadeIn().delay(usualDelay).fadeOut()

  })
}
  
  /**********************************
   * 
   * Modal Handling Functions
   * 
   * Basic load
   * 
   * 
   **********************************/
  var loadModal = function(options, next){

    var scrollbarWidth = $.scrollbarWidth();
    var modal = $('<div class="modal" />')
    var win = $('<div class="window" />')
    var close = $('<div class="close" />')

    var settings = {
      width: 500,
      height: 235,
      closeText: 'close'
    }
    if(options)
      $.extend(settings, options)

    if(settings.closeText)
      close.html(settings.closeText)
    if(settings.content)
      win.html(settings.content)
    if(settings.height)
      win.css({'min-height':settings.height})
    if(settings.width)
      win.width(settings.width)

    var buttons = $('<div class="buttons" />')
    if(settings.Ok){
      var ok = $('<input type="button" value="Ok" class="submit">')
      ok.click(function(){
        settings.Ok(false,win,modal)
      })
      buttons.append(ok)
    }
    if(settings.Cancel){
      var cancel = $('<input type="button" value="Cancel" class="cancel">')
      cancel.click(function(){
        settings.Cancel(false,win,modal)
      })
      buttons.append(cancel)
    }
    if(settings.Confirm){
      var confirm = $('<input type="button" value="Confirm" class="submit">')
      confirm.click(function(){
        settings.Confirm(false,win,modal)
      })
      buttons.append(confirm)
    }
    win.append(buttons)

    $('body').append(modal,close,win)


    var $body = $('body')
    var resizeEvent = function(){
      var width = $window.width()
      var height = $window.height()
      if(width < settings.width || height < win.height()){
        close.css({position:'relative'})
        win.width(width-60).css({position:'relative'})
        $('.body,.footer,.header').hide()
        var top = close.offset().top
        modal.css({top:0,left:0,width:width,height:top})
        window.scroll(0,top)
      }else{
        $body.css({overflow:'hidden','padding-right':scrollbarWidth})
        win.position({of:$window, at:'center top', my:'center top', offset:'0 40px'})
        modal.position({of:$window, at:'center center'})
        close.position({of:win, at:'right top', my:'right bottom', offset:'0 0'})
      }
    }
    $window.bind('resize',resizeEvent)
    var myNext = function(){
      $window.unbind('resize',resizeEvent)
      $body.css({overflow:'inherit','padding-right':0})
      modal.fadeOut(function(){
        modal.remove()
      })
      close.fadeOut(function(){
        close.remove()
      })
      win.fadeOut(function(){
        win.remove()
        if($('.window').length==0)
          $('.body,.footer,.header').show()
      })
    }
    modal.click(myNext)
    close.click(myNext)
    var width = $window.width()
    var height = $window.height()
    if(width < settings.width || height < win.height()){
      modal.show()
      win.show()
      close.show()
    }else{
      modal.fadeIn()
      win.fadeIn()
      close.fadeIn()
    }
    if(next)
      next(false,win,modal)
    resizeEvent()
  }
  /**********************************
   * 
   * Modal Handling Functions
   * 
   * Load Loading (Subclass of loadmodal)
   * 
   * 
   **********************************/
  var loadLoading = function(options, next){
    options = options || {}
    var modifiedOptions = {
      content: 'Loading ... ',
      height: 100,
      width: 200
    }
    for (var k in options){
      modifiedOptions[k] = options[k];
    }
    loadModal(modifiedOptions, next);
  }
  /**********************************
   * 
   * Modal Handling Functions
   * 
   * Load Confirm (Subclass of loadmodal)
   * like javascript confirm()
   * 
   **********************************/
  var loadConfirm = function(options, next){
    options = options || {}
    var modifiedOptions = {
      content: 'Confirm',
      height: 80,
      width: 300
    }
    for (var k in options){
      modifiedOptions[k] = options[k];
    }
    loadModal(modifiedOptions, next);
  }
  /**********************************
   * 
   * Modal Handling Functions
   * 
   * Load Alert (Subclass of loadmodal)
   * like javascript alert()
   * 
   **********************************/
  var loadAlert = function(options, next){
    options = options || {}
    next = next || function(){}
    if(typeof(options)=='string') options = {content:options}
    var modifiedOptions = {
      content: 'Alert',
      Ok: function(err,win,modal){
        modal.click()
      },
      height: 80,
      width: 300
    }
    for (var k in options){
      modifiedOptions[k] = options[k];
    }
    loadModal(modifiedOptions, next);
  }




/*!
 * jQuery Scrollbar Width v1.0
 * 
 * Copyright 2011, Rasmus Schultz
 * Licensed under LGPL v3.0
 * http://www.gnu.org/licenses/lgpl-3.0.txt
 */
$.scrollbarWidth = function() {
  if (!$._scrollbarWidth) {
     var $body = $('body');
    var w = $body.css('overflow', 'hidden').width();
    $body.css('overflow','scroll');
    w -= $body.width();
    if (!w) w=$body.width()-$body[0].clientWidth; // IE in standards mode
    $body.css('overflow','');
    $._scrollbarWidth = w;
  }
  return $._scrollbarWidth;
};



//http://stevenlevithan.com/assets/misc/date.format.js
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
  var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) val = "0" + val;
      return val;
    };

  // Regexes and supporting functions are cached through closure
  return function (date, mask, utc) {
    var dF = dateFormat;

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
      mask = date;
      date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) throw SyntaxError("invalid date");

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true;
    }

    var _ = utc ? "getUTC" : "get",
      d = date[_ + "Date"](),
      D = date[_ + "Day"](),
      m = date[_ + "Month"](),
      y = date[_ + "FullYear"](),
      H = date[_ + "Hours"](),
      M = date[_ + "Minutes"](),
      s = date[_ + "Seconds"](),
      L = date[_ + "Milliseconds"](),
      o = utc ? 0 : date.getTimezoneOffset(),
      flags = {
        d:    d,
        dd:   pad(d),
        ddd:  dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m:    m + 1,
        mm:   pad(m + 1),
        mmm:  dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy:   String(y).slice(2),
        yyyy: y,
        h:    H % 12 || 12,
        hh:   pad(H % 12 || 12),
        H:    H,
        HH:   pad(H),
        M:    M,
        MM:   pad(M),
        s:    s,
        ss:   pad(s),
        l:    pad(L, 3),
        L:    pad(L > 99 ? Math.round(L / 10) : L),
        t:    H < 12 ? "a"  : "p",
        tt:   H < 12 ? "am" : "pm",
        T:    H < 12 ? "A"  : "P",
        TT:   H < 12 ? "AM" : "PM",
        Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
      };

    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}();

// Some common format strings
dateFormat.masks = {
  "default":      "ddd mmm dd yyyy HH:MM:ss",
  shortDate:      "m/d/yy",
  mediumDate:     "mmm d, yyyy",
  longDate:       "mmmm d, yyyy",
  fullDate:       "dddd, mmmm d, yyyy",
  shortTime:      "h:MM TT",
  mediumTime:     "h:MM:ss TT",
  longTime:       "h:MM:ss TT Z",
  isoDate:        "yyyy-mm-dd",
  isoTime:        "HH:MM:ss",
  isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
  dayNames: [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ],
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
  return dateFormat(this, mask, utc);
};
