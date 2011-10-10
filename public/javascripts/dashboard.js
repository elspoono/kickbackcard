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
  socket.on('new news',function(newsItem){
    var item = $(
      '<div class="item">'
        +'<div class="description">'
          +newsItem.type
        +'</div>'
        +'<div class="date">'
          +new Date(newsItem.date_added).format('mmmm d, yyyy - HH:MM:ss')
        +'</div>'
      +'</div>'
    );

    $('.latest').prepend(item);
    item.hide().slideDown(1500,'linear');
    var all = $('.all .'+newsItem.type.toLowerCase()+' .value');
    all.html(all.html()*1+1);
    all.hide().fadeIn(1500,'linear');

  });
  socket.on('news-load',function(allNews){
    for(var i in allNews){
      $('.latest').append(
        '<div class="item">'
          +'<div class="description">'
            +allNews[i].type
          +'</div>'
          +'<div class="date">'
            +new Date(allNews[i].date_added).format('mmmm d, yyyy - HH:MM:ss')
          +'</div>'
        +'</div>'
      );
    }
    if(allNews.length==10){
      $('.latest').append('<p><a href="#" class="load-more">Load More</a></p>');
      $('.load-more').click(function(){
        socket.emit('load-news',{
          skip: $('.latest').children().length,
          limit: 100
        });
        $(this).remove();
        return false;
      });  
    }
  });


    var kicks = {data:[[0, 3], [4, 8], [8, 5], [9, 13]],label:'Kicks'};
    var redeems = {data:[[0, 1], [4, 2], [8, 3], [9, 1]],label:'Redeems'};
    
    $.plot($('.deal-chart').height(300), [ kicks, redeems ], {
      legend: {
        backgroundOpacity: .6
      }
    });

});