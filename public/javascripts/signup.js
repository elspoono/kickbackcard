$(function(){

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


  var $name = $('.name');
  var $zip = $('.zip');
  var $results = $('.results');
  
  /***********************************
   *
   *
   * Key up
   *
   *
   *
   ************************************/

   var updateSearch = function(){
    $.ajax({
      url: '/factual',
      data: {
        name: $name.val(),
        address: $zip.val()
      },
      success: function(records){
        if(records && records.length > 0 ){
          var $ul = $('<ul>');
          for(var i in records){
            var $li = $('<li>');
            $li.html('<div class="name">'+records[i].name+'</div><div class="address">'+records[i].address+'</div><div class="phone">'+records[i].tel+'</div>');
            $ul.append($li);
          }
          $results.html('')
            .append($ul);
          var $lis = $ul.find('li');
          $ul.find('li:first').addClass('selected');
          $lis.click(function(){
            $lis.removeClass('selected');
            $(this).addClass('selected');
          });
        }else{
          $results.html('No Results');
        }
      },
      error: function(){
        
      }
    })
      
   };
   $('.name,.zip').each(function(){
     var $t = $(this);
     $t.data('timer',0);
     $t.keyup(function(){
        $results.html('Loading ...');
        clearTimeout($t.data('timer'));
        $t.data('timer',
          setTimeout(function(){
            updateSearch();
          },1000)
        );
     });
   });

  /***********************************
   *
   *
   *
   *
   *
   *
   ************************************/




})