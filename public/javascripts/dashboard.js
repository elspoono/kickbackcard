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
   * Dashboard
   * 
   * 
   ***********************************/





  var socket = io.connect('/');
  var vendor = false;
  socket.on('vendor-load',function(vendor){
    console.log(vendor);
    $('.vendor-title').html(vendor.name);
  })

  socket.on('deal-load',function(deal){
    console.log(deal);
    $('.deal-title').html(deal.tag_line);
  })




});