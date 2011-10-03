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