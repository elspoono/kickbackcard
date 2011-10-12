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
  var a = {};

  var setRange = function(newDate){
    var range = getMonthRange(newDate);
    a = {
      startDate : range.startDate,
      endDate : range.endDate,
      dateInterval : 'd'
    }
    $('.date-title').html(a.startDate.format('mmmm yyyy'));
    $('.next-date').html(a.endDate.format('mmmm')+' >');
    $('.prev-date').html('< ' + new Date(a.startDate-1).format('mmmm'));
  }
  setRange(new Date());

  $('.next-date').click(function(){
    setRange(a.endDate);
    loadRange();
    return false;
  })
  $('.prev-date').click(function(){
    setRange(a.startDate-1);
    loadRange();
    return false;
  })

  var loadRange = function(){
    socket.emit('load-range',{
      startDate: a.startDate,
      endDate: a.endDate,
      tz: a.startDate.getTimezoneOffset(),
      dateInterval: a.dateInterval
    });
  }
  var showTooltip = function(x, y, contents) {
    $('<div id="tooltip">' + contents + '</div>').css( {
      position: 'absolute',
      display: 'none',
      top: y + 5,
      left: x + 5,
      border: '1px solid #fdd',
      padding: '2px',
      'background-color': '#fee',
      opacity: 0.80
    }).appendTo("body").fadeIn(200);
  }
  $('.deal-chart').bind("plothover", function (event, pos, item) {
    if(item){
      if(previousPoint != item.dataIndex){
        previousPoint = item.dataIndex;
        $("#tooltip").remove();
        var x = item.datapoint[0].toFixed(2),
            y = item.datapoint[1].toFixed(2);
        showTooltip(item.pageX, item.pageY,
          y*1 + ' ' + item.series.label + ' on ' + a.startDate.format('mmmm') + ' ' + x*1
        );
      }
    }else{
      $("#tooltip").remove();
      previousPoint = null;            
    }
  });
  var processForChart = function(all){
    var startInt = a.startDate.format(a.dateInterval);
    var stopInt = new Date(a.endDate-1).format(a.dateInterval);
    var toReturn = [];
    for(var i = startInt; i<= stopInt; i++){
      var total = 0;
      for(var j in all){
        if(new Date(all[j]._id).format(a.dateInterval) == i){
          total = all[j].value.count;
        }
      }
      toReturn.push(
        [i,total]
      );
    }
    return toReturn;
  }
  var addUp  = function(all){
    var total = 0;
    for(var i in all){
      total+= all[i].value.count;
    }
    return total;
  }

  var kicks = {data:[],label:'Kicks'};
  var redeems = {date:[],label:'Redeems'};
  var shares = {date:[],label:'Shares'};
  var updateChart = function(){
    $.plot($('.deal-chart').height(300), [ kicks, shares, redeems ], {
      legend: {
        backgroundOpacity: .6
      },
      grid : {
        hoverable: true
      }
    });
  }
  socket.on('load-kicks-range',function(all){
    kicks.data = processForChart(all);
    $('.current .kicks .value').html(addUp(all));
    updateChart();
  });
  socket.on('load-redeems-range',function(all){
    redeems.data = processForChart(all);
    $('.current .redeems .value').html(addUp(all));
    updateChart();
  });
  socket.on('load-shares-range',function(all){
    shares.data = processForChart(all);
    $('.current .shares .value').html(addUp(all));
    updateChart();
  });

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
      '<div class="item new">'
        +'<div class="description">'
          +newsItem.type
        +'</div>'
        +'<div class="date">'
          +new Date(newsItem.date_added).format('mmmm d, yyyy - HH:MM:ss')
        +'</div>'
      +'</div>'
    );

    $('.latest').prepend(item);
    item.hide().fadeIn(600).delay(usualDelay).removeClass('new',600);
    var all = $('.all .'+(newsItem.type=='Kick'?'kicks':(newsItem.type=='Share'?'shares':'redeems'))+' .value');
    all.html(all.html()*1+1);
    all.hide().slideDown(1500,'linear');
    var now = new Date();
    if(now>a.startDate && now<a.endDate){
      var updateData = function(dataToUpdate){
        for(var i in dataToUpdate){
          if(now.format(a.dateInterval) == dataToUpdate[i][0])
            dataToUpdate[i][1]++;
        }
      }
      var some;
      if(newsItem.type=='Kick'){
        some = $('.current .kicks .value'); 
        updateData(kicks.data)
      }
      if(newsItem.type=='Share'){
        some = $('.current .shares .value'); 
        updateData(shares.data)
      }
      if(newsItem.type=='Redemption'){
        some = $('.current .redeems .value'); 
        updateData(redeems.data)
      }
      updateChart();
      some.html(some.html()*1+1);
      some.hide().slideDown(1500,'linear');
    }

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