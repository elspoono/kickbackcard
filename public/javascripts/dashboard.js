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



/*

  var socket = io.connect('/');

*/

  /*
  socket.on('vendor-load',function(vendor){
    $('.vendor-title').html(vendor.name);
  });

  socket.on('deal-load',function(deal){
    $('.deal-title').html(deal.tag_line);
  });

  socket.on('kick-total',function(total){
    $('.all .kicks .value').html(total);
  });
  socket.on('redeem-total',function(total){
    $('.all .redeems .value').html(total);
  });
  socket.on('share-total',function(total){
    $('.all .shares .value').html(total);
  });
*/

    var kicks = {data:[[0, 3], [4, 8], [8, 5], [9, 13]],label:'Kicks'};
    var redeems = {data:[[0, 1], [4, 2], [8, 3], [9, 1]],label:'Redeems'};
    
    $.plot($('.deal-chart').height(300), [ kicks, redeems ], {
      legend: {
        backgroundOpacity: .6
      }
    });

});