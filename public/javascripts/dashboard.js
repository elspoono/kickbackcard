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



  var getMonthRange = function(inDate){
    var eval = new Date(inDate);
    var month = eval.getMonth();
    eval.setDate(1);
    eval.setHours(0);
    eval.setMinutes(0);
    eval.setSeconds(0);
    eval.setMilliseconds(0);
    var startDate = new Date(eval);
    eval.setMonth(month+1)
    var endDate = eval;

    return {
      startDate: startDate,
      endDate: endDate
    }
  }

  var now = new Date();
  var socket = io.connect('/');
  var a = getMonthRange(now);

  $('.date-title').html(a.startDate.format('mmmm yyyy'));
  $('.next-date').html(a.endDate.format('mmmm')+' >');
  $('.prev-date').html('< ' + new Date(a.startDate-1).format('mmmm'));

  var loadRange = function(){
    socket.emit('load-range',{
      startDate: a.startDate,
      endDate: a.endDate
    });
  }

  var kicks = {data:[],label:'Kicks'};
  var redeems = {date:[],label:'Redeems'};
  var updateChart = function(){
    $.plot($('.deal-chart').height(300), [ kicks, redeems ], {
      legend: {
        backgroundOpacity: .6
      }
    });
  }
  socket.on('load-kicks-range',function(allKicks){
    console.log(allKicks);
    kicks.data = [[0, 3], [4, 8], [8, 5], [9, 13]];
    redeems.data = [[0, 1], [4, 2], [8, 3], [9, 1]];
    updateChart();
  })

  socket.on('vendor-load',function(vendor){
    $('.vendor-title').html(vendor.name);
    a.vendor = vendor;
  });

  socket.on('deal-load',function(deal){
    $('.deal-title').html(deal.tag_line);
    a.deal = deal;
    loadRange();
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
    var all = $('.all .'+(newsItem.type=='Kick'?'kicks':(newsItem.type=='Share'?'shares':'redeems'))+' .value');
    all.html(all.html()*1+1);
    all.hide().slideDown(1500,'linear');

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



});