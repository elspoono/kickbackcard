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
  $.fx.speeds._default = 300

  
  /**********************************
   * 
   * Modal Handling Functions
   * 
   * Basic load
   * 
   * 
   **********************************/
  var loadModal = function(options, next){
    var modal = $('<div class="modal" />')
    var win = $('<div class="window" />')

    var settings = {
      width: 500,
      height: 235
    }
    if(options)
      $.extend(settings, options)

    if(settings.content)
      win.html(settings.content)
    if(settings.height)
      win.css({'min-height':settings.height})
    if(settings.width)
      win.width(settings.width)
    $('body').append(modal,win)


    var $window = $(window)
    var $body = $('body')
    $body.css({overflow:'hidden','padding-right':scrollbarWidth})
    var resizeEvent = function(){
      var offset = '0px '+$window.scrollTop()+'px'
      var width = $window.width()-60
      if(width < settings.width)
        win.width(width)
      win.position({of:$window, at:'center center', offset:offset})
      modal.position({of:$window, at:'center center', offset:offset})
    }
    resizeEvent()
    $window.bind('resize',resizeEvent)
    modal.click(function(){
      $window.unbind('resize',resizeEvent)
      $body.css({overflow:'inherit','padding-right':0})
      modal.remove()
      win.remove()
    });
    modal.fadeIn()
    win.fadeIn()
    next(false,win,modal)
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
   * show tooltip, can be used on any element with jquery
   * 
   * 
   **********************************/
  $.fn.showTooltip = function( options ) {  
    var settings = {}
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
          top: offset.top
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
   * Everypage functions today for Everyday pages tomorrow
   * 
   * like making the logo redirect to home from anywhere
   * 
   * 
   **********************************/
  $('div.logo').click(function(){document.location.href='/'})



  /**********************************
   * 
   * Admin Controls
   * 
   * user add, user edit
   * 
   * 
   **********************************/

  $('.user .add,.user .edit').live('click',function(){

    var $t = $(this)
    var $p = $t.closest('.user-row')

    /* Prompt for user add form */
    loadLoading({},function(err,win,modal){
      $.get('/_form_user',function(data){
        modal.click();
        loadModal({},function(err,win,modal){
          win.append(data)
          /******************
           *
           * Email Validation auto ajaxyness
           *
           ******************/
          var email = $p.find('.email').text() || ''
          var emailT = 0
          win.find('.email').val(email).keyup(function(e){
            var $t = $(this)
            if(email!=this.value){
              clearTimeout(emailT)
              email = this.value
              emailT = setTimeout(function(){
                $t.trigger('customValidate')
              },500)
            }
          }).bind('customValidate',function(e,next){
            var $t = $(this)
            /* It appears the email has changed, and we think they stopped typing */
            $t.removeClass('loading valid')

            if(email.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)){
              $t.addClass('loading')
              $.ajax({
                url: '/checkEmail',
                data: {
                  email: email,
                  id: $p.attr('id')
                },
                success: function(data){
                  /* Make sure they didn't change the email since we last checked */
                  if(email==data.email){
                    $t.removeClass('loading valid error')
                    if(data.err){
                      $t.addClass('error')
                      $t.showTooltip({message:'db error'})
                    }else if(data.data==0){
                      if(email.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)){
                        $t.addClass('valid')
                        $t.showTooltip({message:email+' is good'})
                      }else{
                        $t.addClass('error')
                        $t.showTooltip({message:email+' doesn\'t look like an email'})
                      }
                    }else{
                      $t.addClass('error')
                      $t.showTooltip({message:email+' is taken'})
                    }
                    if(next) next()
                  }
                },
                error: function(){
                  $t.removeClass('loading,valid,error')
                  $t.addClass('error')
                  $t.showTooltip({message:'server error'})
                  if(next) next()
                }
              })
            }else{
              $t.addClass('error')
              $t.showTooltip({message:email+' doesn\'t look like an email'})
              if(next) next()
            }
          })
          /******************
           *
           * Password ajaxyness
           *
           ******************/
          var password = ''
          var passwordT = 0
          win.find('.password').keyup(function(e){
            var $t = $(this)
            if(password!=this.value){
              clearTimeout(passwordT)
              passwordT = setTimeout(function(){
                $t.trigger('customValidate')
              },500)
            }
          }).bind('customValidate',function(){
            var $t = $(this)
            $t.removeClass('valid error')
            password = this.value
            var charactersLeft = 6-password.length;
            if(password==''&&$p.attr('id')){
              $t.addClass('valid')
            }else if(charactersLeft>0){
              $t.addClass('error')
              $t.showTooltip({message:password+' is just '+charactersLeft+' character'+(charactersLeft>1?'s':'')+' too short'})
            }else if(password.match(/\b.{6,1500}\b/i)){
              $t.addClass('valid')
              $t.showTooltip({message:password+' is good'})
            }else{
              $t.addClass('error')
              $t.showTooltip({message:password+' is not quite right'})
            }
          })

          /************************************************************/
          /* Anytime we close the modal, clear out those tooltips too */
          modal.bind('click',function(){
            $('.tooltip').remove()
          })
          /************************************************************/


          /******************
           *
           * The form's actually submitted ??? Oh noes!!
           *
           ******************/
          win.find('form').submit(function(){

            /* Always instantaneous, no next required */
            win.find('.password').trigger('customValidate')

            /**************************
             *
             * We rely on the email's customValidate function 
             * to show it's own loading indicators as we wait
             * for it here.
             * 
             **************************/
            win.find('.email').trigger('customValidate',function(){
              var err = win.find('.error')
              if(err.length){

              }else{
                var data = {
                  /* id is null when it's new */
                  id: $p.attr('id'),
                  email: win.find('.email').val(),
                  password: win.find('.password').val(),
                  role: win.find('.role').val()
                };
                loadLoading({},function(err,win,modal){
                  $.ajax({
                    url: '/saveUser',
                    data: data,
                    success: function(data,t,xhr){
                      modal.click();
                      if(typeof(data)=='object'&&data.err)
                        alert(data.err)
                      else{
                        var $newRow = $(data)
                        $newRow.hide()
                        /* If it's existing, replace that row */
                        if($p.attr('id'))
                          $p.replaceWith($newRow)
                        /* Otherwise, put it right after the add button they just clicked */
                        else
                          $('.user .add-row').after($newRow)
                        $newRow.addClass('modified').fadeIn().delay(usualDelay).removeClass('modified','normal')
                      }
                    },
                    error: function(){
                      modal.click();
                      alert('server error')
                    }
                  })
                })
                modal.click(); 
              }
            })
            return false;
          })
        })
      })
    })

    return false
  })

  var $window = $(window)
  var alreadyFoundUsers = 10
  var currentlyLoadingUsers = false
  /* On window scroll event def */
  var scrollEvent = function(){
    /* If we see the bottom of the user list */
    var userBox = $('.user')
    if(userBox.length){
      var userBoxHeight = userBox.height()
      var windowScrollTop = $window.scrollTop()
      var windowHeight = $window.height()
      var userScrollTop = userBox.offset().top
      var bottomOfWindow = windowScrollTop + windowHeight
      var bottomOfUserBox = userBoxHeight + userScrollTop
      if(bottomOfWindow > bottomOfUserBox && !currentlyLoadingUsers){
        currentlyLoadingUsers = true
        $.ajax({
          url: '/get10Users',
          data: {
            skip: alreadyFoundUsers
          },
          success: function(data){
            if(typeof(data)=='object'&&data.err){
              
            }else{
              var $newRows = $(data)
              alreadyFoundUsers = alreadyFoundUsers + $newRows.length;
              $newRows.hide()
              userBox.append($newRows)
              $newRows.fadeIn()
            }
            currentlyLoadingUsers = false
          },
          error: function(){
            currentlyLoadingUsers = false
          }
        })
      }
      /* Try to load the 'next 10' users */

    }
  }
  scrollEvent()
  $window.bind('scroll',scrollEvent)
  /**********************************
   * 
   * Admin Controls
   * 
   * vendor add, vendor edit
   * 
   * 
   **********************************/

  $('.vendor .add').click(function(){


    /* Prompt for user add form */
  })

  $('.vendor .edit').click(function(){

    var $t = $(this)
    var $p = $t.closest('.vendor-row')

  })





  /**********************************
   * 
   * Admin Controls
   * 
   * deal add, deal edit
   * 
   * 
   **********************************/

  $('.deal .add').click(function(){


    /* Prompt for user add form */


  })

  $('.deal .edit').click(function(){

    var $t = $(this)
    var $p = $t.closest('.deal-row')

  })

})





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