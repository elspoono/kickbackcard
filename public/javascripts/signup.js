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
  var factuals = {};
  
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
     $('.new-address').focus();
      $('.step-2').click();
     return false;
   };

   var updateSearch = function(){
    $newlisting.find('.new-name').val($name.val())
    // Maybe not update address ..
    //$newlisting.find('.new-address').val($zip.val())
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
            var $li = $('<li factual_id="'+records[i].factual_id+'">');
            factuals[records[i].factual_id] = records[i];
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
          var $lis = $ul.find('li');
          $lis.click(function(){
            $('.selected').removeClass('selected');
            $newlisting.slideUp();
            $(this).addClass('selected')
              .find('.slider').show().animate({left:60},300,'easeInCirc',function(){$(this).hide().css({left:8})});
          });
          $ul.find('li:first').click();
          $('.step-2').click();
        }else{
          $results.html('<p class="centered">No Results -  <a href="#" class="add">Create new listing</a></p>');
        }
        $results.find('.add').click(createNew);
      },
      error: function(){
        $results.html('<p class="centered">Our apologies, an error occured please <a href="#" class="add">Create new listing</a></p>');
        $results.find('.add').click(createNew);
      }
    })
      
   };



  /**********************************
  *
  *  KEY UP EVENTS
  *
  *  Validation for most, and triggering searching for name/zip
  *
  ************************************/

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
   $('.email')
    .data('timer',0)
    .keyup(function(){
      var $t = $(this);
      clearTimeout($t.data('timer'));
      $t.data('timer',
        setTimeout(function(){
          if($t.val().match(/.{1,}@.{1,}\..{1,}/)){
            $t.removeClass('error').addClass('valid');
            $.ajax({
              url: '/checkEmail',
              data: {
                email: $t.val()
              },
              success: function(data){
                if(data.err){
                }else if(data.data==0){
                  $t.removeClass('error').addClass('valid')
                  $t.showTooltip({message:data.email+' is good'})
                }else{
                  $t.removeClass('valid').addClass('error')
                  $t.showTooltip({message:'<p>We have recieved the beta request for '+data.email+' already. '+data.email+' is good to go.</p>'})
                }
              },
              error: function(){
              }
            })

          }else
            $t.removeClass('valid').addClass('error').showTooltip({message:'Is that an email?'});
        },1000)
      );
    });
   $('.password')
    .data('timer',0)
    .keyup(function(){
      var $t = $(this);
      clearTimeout($t.data('timer'));
      $t.data('timer',
        setTimeout(function(){
          if($t.val().length>=6)
            $t.removeClass('error').addClass('valid');
          else
            $t.removeClass('valid').addClass('error').showTooltip({message:'Just '+(6-$t.val().length)+' more characters please.'});
        },1000)
      );
    });
   $('.repeat-password')
    .data('timer',0)
    .keyup(function(){
      var $t = $(this);
      clearTimeout($t.data('timer'));
      $t.data('timer',
        setTimeout(function(){
          if($t.val()==$('.password').val()){
            $t.removeClass('error').addClass('valid');
            $('.step-4').fadeTo(300,1);
          }else
            $t.removeClass('valid').addClass('error').showTooltip({message:'Passwords should match please.'});
        },1000)
      );
    });
   $('.buy_item')
    .data('timer',0)
    .keyup(function(){
      var $t = $(this);
      clearTimeout($t.data('timer'));
      $t.data('timer',
        setTimeout(function(){
          if($t.val().length>0){
            $t.removeClass('error').addClass('valid');
            $('.step-3').fadeTo(300,1);
          }else
            $t.removeClass('valid').addClass('error').showTooltip({message:'Please type what they need to buy.'});
        },1000)
      );
    });
   $('.get_item')
    .data('timer',0)
    .keyup(function(){
      var $t = $(this);
      clearTimeout($t.data('timer'));
      $t.data('timer',
        setTimeout(function(){
          if($t.val().length>0){
            $t.removeClass('error').addClass('valid');
            $('.step-3').fadeTo(300,1);
          }else
            $t.removeClass('valid').addClass('error').showTooltip({message:'Please type what they will get as a reward.'});
        },1000)
      );
    });

   $name.focus()
   $('.search').click(function(){
      $name.keyup();
     return false;
   });
   $('.step-2,.step-3,.step-4').fadeTo(0,.4);
   $('.step-1,.step-2,.step-3').each(function(){
     var $t = $(this);
     $t.click(function(){
       $t.fadeTo(300,1);
     });
     $t.find('input,select').focus(function(){
       $(this).closest('.window').click()
     })
   })
   $('.step-4').click(function(){
      var $t = $(this);
      $t.fadeTo(300,1);
      var err = '';
      if($('.selected').length==0)
        err+='<p>Please enter your business listing information by either searching or creating a new listing under "Find Your Business"</p><br>'
      if(
        $('.buy_item').val().length < 1
        || $('.get_item').val().length < 1
      )
        err+='<p>Please be sure to enter what customers will buy, and the reward under "Modify Deal".<p><br>'
      if(
        !$('.email').val().match(/.{1,}@.{1,}\..{1,}/)
        || $('.password').val().length < 6 
        || $('.repeat-password').val() != $('.password').val()
      )
        err+='<p>Please enter an email address and password so we can give you access to analytics under "Get Access".<p><br>'
      if(err!='')
          loadConfirm({
            content: err,
            width: 500,
            Ok: function(err,win2,modal2){
              modal2.click()
            }
          },function(){})
      else
            
        $.ajax({
          url: '/sign-up',
          data: {
            name: $name.val(),
            zip: $zip.val(),
            factual: factuals[$('.selected').attr('factual_id')],
            address: $('.new-address').val(),
            contact: $('.new-contact').val(),
            site_url: $('.new-site_url').val(),
            yelp_url: $('.new-yelp_url').val(),
            hours: $('.new-hours').val(),
            buy_qty: $('.buy_qty').val(),
            buy_item: $('.buy_item').val(),
            get_item: $('.get_item').val(),
            email: $('.email').val(),
            password: $('.password').val()
          },
          success: function(response){
            console.log(response)
            if(response && response.err)
              loadConfirm({
                content: '<p>'+response.err+'</p>',
                width: 500,
                Ok: function(err,win2,modal2){
                  modal2.click()
                }
              },function(){})
            else
              loadConfirm({
                content: 'Looks Good!<br><Br>We received your request. We\'ll contact you in 1-2 business days.<br><br>Click ok to return to the home page.',
                width: 500,
                Ok: function(err,win2,modal2){
                  document.location.href = '/'
                }
              },function(){})
          },
          error: function(){
            loadConfirm({
              content: 'Our apologies, an error has occurred.',
              width: 500,
              Ok: function(err,win2,modal2){
                modal2.click()
              }
            },function(){})
          }
        })
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