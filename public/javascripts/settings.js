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


  /**********************************
  *
  *  KEY UP EVENTS
  *
  *  Validation for most, and triggering searching for name/zip
  *
  ************************************/
  var original = $('.email').val();
   $('.email')
    .data('timer',0)
    .keyup(function(){
      var $t = $(this);
      clearTimeout($t.data('timer'));
      $t.data('timer',
        setTimeout(function(){
          if($t.val().match(/.{1,}@.{1,}\..{1,}/)){
            $t.removeClass('error').addClass('valid');
            if($t.val()!=original)
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
                  $t.showTooltip({message:'<p>'+data.email+' is already in use. Our apologies.</p>'})
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


   $('.finish-button').click(function(){
      var $t = $(this);
      $t.fadeTo(300,1);
      var err = '';
      if(
        $('.buy_item').val().length < 1
        || $('.get_item').val().length < 1
      )
        err+='<p>Please be sure to enter what customers will buy, and the reward under "Modify Deal".<p><br>'
      if(
        !$('.email').val().match(/.{1,}@.{1,}\..{1,}/)
        || (
          $('.password').val()!='' &&
            (
              $('.password').val().length < 6 
              || $('.repeat-password').val() != $('.password').val()
            )
          )
      )
        err+='<p>Please check the e-mail and password.<p><br>'
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
          url: '/settings',
          data: {
            name: $('.name').val(),
            address: $('.address').val(),
            contact: $('.contact').val(),
            site_url: $('.site_url').val(),
            yelp_url: $('.yelp_url').val(),
            hours: $('.hours').val(),
            buy_qty: $('.buy_qty').val(),
            buy_item: $('.buy_item').val(),
            get_item: $('.get_item').val(),
            email: $('.email').val(),
            password: $('.password').val()
          },
          success: function(response){
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
                content: 'Got it!<br><br>Click ok to return to the dashboard.',
                width: 500,
                Ok: function(err,win2,modal2){
                  document.location.href = '/dashboard'
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
   * Auto Fading Stuff
   *
   *
   *
   ************************************/
   $('.start-faded').fadeTo(0,.4);
   $('.start-faded').each(function(){
     var $t = $(this);
     $t.click(function(){
       $t.fadeTo(300,1);
     });
     $t.find('input,select').focus(function(){
       $(this).closest('.start-faded').click()
     })
   })




})