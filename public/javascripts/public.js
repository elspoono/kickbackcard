$(function(){


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
    var resizeEvent = function(){
      var width = $window.width()-60
      if(width < settings.width)
        win.width(width)
      win.position({of:$window, at:'center center'})
    }
    resizeEvent()
    $window.bind('resize',resizeEvent)
    modal.click(function(){
      $window.unbind('resize',resizeEvent)
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
      tooltip.stop(true,true).fadeIn().delay(2000).fadeOut()

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

  $('.user .add').click(function(){


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
          var email = ''
          var emailT = 0
          win.find('.email').focus().keyup(function(e){
            var $t = $(this)
            if(email!=this.value){
              clearTimeout(emailT)
              email = this.value
              emailT = setTimeout(function(){
                $t.trigger('customValidate')
              },500)
            }
          }).bind('customValidate',function(){
            var $t = $(this)
            /* It appears the email has changed, and we think they stopped typing */
            $t.removeClass('loading valid error')

            if(email.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)){
              $t.addClass('loading')
              $.ajax({
                url: '/checkEmail',
                type: 'POST',
                data: {
                  email: email
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
                  }
                },
                error: function(){
                  $t.removeClass('loading,valid,error')
                  $t.addClass('error')
                  $t.showTooltip({message:'server error'})
                }
              })
            }else{
              $t.addClass('error')
              $t.showTooltip({message:email+' doesn\'t look like an email'})
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
            if(charactersLeft>0){
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
            win.find('.email,.password').trigger('customValidate')
            var err = win.find('.error')
            if(err.length){

            }else{
              var data = {
                email: win.find('.email').val(),
                password: win.find('.password').val(),
                role: win.find('.role').val()
              };
              loadLoading({},function(err,win,modal){
                $.ajax({
                  url: '/saveUser',
                  type: 'POST',
                  data: data,
                  success: function(data,t,xhr){
                    modal.click();
                    if(typeof(data)=='object'&&data.err)
                      alert(data.err)
                    else{
                      var $newRow = $(data)
                      $newRow.hide()
                      $('.user .add-row').after($newRow)
                      $newRow.fadeIn()
                    }
                  },
                  error: function(){
                    modal.click();
                    console.log('error')
                  }
                })
              })
              modal.click(); 
            }
            return false;
          })
        })
      })
    })

    return false
  })

  $('.user .edit').click(function(){

    var $t = $(this)
    var $p = $t.closest('.user-row')

  })


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