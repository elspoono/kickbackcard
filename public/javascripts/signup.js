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
  var $newlisting = $('.new-listing');
  
  /***********************************
   *
   *
   * Key up
   *
   *
   *
   ************************************/

   var createNew = function(){
     $('.selected').removeClass('selected');
     $newlisting.addClass('selected').hide().slideDown();
     return false;
   };

   var updateSearch = function(){
    $newlisting.find('.new-name').val($name.val())
    $newlisting.find('.new-address').val($zip.val())
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
            $li.html(
              '<div class="slider"></div>'
              +'<div class="name">'+records[i].name+'</div>'
              +'<div class="address">'+records[i].address+'</div>'
              +'<div class="phone">'+records[i].tel+'</div>'
            );
            $ul.append($li);
          }
          $results.html('')
            .append($ul)
            .append(
              '<p class="bottom">Not found? <a href="#" class="add">Create new listing</a></p>'
            );
          $results.find('.add').click(createNew);
          var $lis = $ul.find('li');
          $lis.click(function(){
            $('.selected').removeClass('selected');
            $(this).addClass('selected')
              .find('.slider').show().animate({left:60},300,'easeInCirc',function(){$(this).hide().css({left:8})});
          });
          $ul.find('li:first').click();
        }else{
          $results.html('<p class="centered">No Results - please enter your information</p>');
          createNew();
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
        $results.html('<p class="centered">Loading ...</p>');
        $newlisting.removeClass('selected').slideUp();
        clearTimeout($t.data('timer'));
        $t.data('timer',
          setTimeout(function(){
            updateSearch();
          },1000)
        );
     });
   });
   $name.focus()
   $('.search').click(function(){
      $name.keyup();
     return false;
   })

  /***********************************
   *
   *
   *
   *
   *
   *
   ************************************/




})