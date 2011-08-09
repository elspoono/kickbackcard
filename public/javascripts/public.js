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
    
    var buttons = $('<div class="buttons" />')
    if(settings.Ok){
      var ok = $('<input type="button" value="Ok" class="submit">')
      ok.click(function(){
        settings.Ok(false,win,modal)
      })
      buttons.append(ok)
    }
    if(settings.Cancel){
      var cancel = $('<input type="button" value="Cancel" class="cancel">')
      cancel.click(function(){
        settings.Cancel(false,win,modal)
      })
      buttons.append(cancel)
    }
    if(settings.Confirm){
      var confirm = $('<input type="button" value="Confirm" class="submit">')
      confirm.click(function(){
        settings.Confirm(false,win,modal)
      })
      buttons.append(confirm)
    }
    win.append(buttons)

    $('body').append(modal,win)


    var $body = $('body')
    $body.css({overflow:'hidden','padding-right':scrollbarWidth})
    var resizeEvent = function(){
      var offset = '0px 0px'
      var width = $window.width()-120
      var height = $window.height()-120
      if(width < settings.width)
        win.width(width)
      if(height < win.height())
        win.height(height).css('overflow','auto')
      win.position({of:$window, at:'center center', offset:offset})
      modal.position({of:$window, at:'center center', offset:offset})
    }
    $window.bind('resize',resizeEvent)
    modal.click(function(){
      $window.unbind('resize',resizeEvent)
      $body.css({overflow:'inherit','padding-right':0})
      modal.fadeOut(function(){
        modal.remove()
      })
      win.fadeOut(function(){
        win.remove()
      })
    });
    modal.fadeIn()
    win.fadeIn()
    next(false,win,modal)
    resizeEvent()
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
   * Load Confirm (Subclass of loadmodal)
   * like javascript confirm()
   * 
   **********************************/
  var loadConfirm = function(options, next){
    options = options || {}
    var modifiedOptions = {
      content: 'Confirm',
      height: 80,
      width: 300
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
   * Load Alert (Subclass of loadmodal)
   * like javascript alert()
   * 
   **********************************/
  var loadAlert = function(options, next){
    options = options || {}
    next = next || function(){}
    if(typeof(options)=='string') options = {content:options}
    var modifiedOptions = {
      content: 'Alert',
      Ok: function(err,win,modal){
        modal.click()
      },
      height: 80,
      width: 300
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
   * deal add
   * 
   * 
   **********************************/
  $('.vendor-deal .add').live('click',function(){
    var $row = $('.vendor-deal .assets .row').clone()
    var $t = $(this)
    var $a = $t.closest('.add-row')
    $row.find('.archive').click(function(){
      if(
        $row.find('.buy_qty').val()==''
        && $row.find('.buy_item').val()==''
        && $row.find('.get_item').val()==''
      ){
        $row.remove()
        $window.resize()
      }else{
        loadConfirm({
          content: '<p>Are you sure?</p><p>This cannot be undone.</p>',
          Confirm: function(err,win,modal){
            modal.click()
            $row.remove()
            $window.resize()
          },
          Cancel: function(err,win,modal){
            modal.click()
          }
        },function(){})
      }
    })
    $a.after($row)
    $window.resize()
  });

  /**********************************
   * 
   * Admin Controls
   * 
   * user add, user edit
   * 
   * 
   **********************************/
  $('.user .add,.user .edit,.vendor-user .edit,.vendor-user .add').live('click',function(){

    var $t = $(this)
    var $p = $t.closest('.row')
    var $a = $t.closest('.add-row')
    var $v = $t.closest('.vendor-user')

    /* Prompt for user add form */
    loadLoading({},function(err,win,modal){
      $.ajax({
        url: '/getUser',
        data: {
          id: $p.attr('id'),
          role: $a.attr('role'),
          vendor_id: $v.attr('id')
        },
        success: function(data){
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
            win.find('.email').keyup(function(e){
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
            var clickedWelcome = false
            win.find('.send-welcome-email').click(function(){
              clickedWelcome = true
            })
            win.find('form').submit(function(){
              var sendWelcome = false
              if(clickedWelcome)
                sendWelcome = true
              clickedWelcome = false
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
                  var params = {
                    /* id is null when it's new */
                    id: $p.attr('id'),
                    vendor_id: $v.attr('id'),
                    email: win.find('.email').val(),
                    password: win.find('.password').val(),
                    role: win.find('.role').val()
                  };
                  loadLoading({},function(err,win,modal){
                    $.ajax({
                      url: '/saveUser',
                      data: params,
                      success: function(data,t,xhr){
                        modal.click();
                        if(typeof(data)=='object'&&data.err)
                          loadAlert(data.err)
                        else{
                          var $newRow = $(data)
                          $newRow.hide()
                          /* If it's existing, replace that row */
                          if($p.attr('id'))
                            $p.replaceWith($newRow)
                          /* Otherwise, put it right after the add button they just clicked */
                          else
                            $a.after($newRow)
                          $newRow.addClass('modified').fadeIn(function(){
                            if(sendWelcome){
                              loadLoading({},function(err,win,modal){
                                $.ajax({
                                  url: 'sendWelcomeEmail',
                                  data: {
                                    email: params.email
                                  },
                                  success:function(){
                                    modal.click()
                                    loadAlert('message sent to '+params.email)
                                  },
                                  error:function(){
                                    modal.click()
                                    loadAlert('server error')
                                  }
                                })
                              })
                            }
                          }).delay(usualDelay).queue(function(){
                            $(this).removeClass('modified')
                          })
                        }
                      },
                      error: function(){
                        modal.click();
                        loadAlert('server error')
                      }
                    })
                  })
                  modal.click(); 
                }
              })
              return false;
            })
            if($p.attr('id'))
              win.find('.cancel').click(function(){
                loadConfirm({
                  content: '<p>Are you sure?</p><p>This cannot be undone.</p>',
                  Confirm: function(err,win2,modal2){
                    modal2.click()
                    modal.click()
                    loadLoading({},function(err,win,modal){
                      $.ajax({
                        url: '/deleteUser',
                        data: {
                          id: $p.attr('id')
                        },
                        success: function(data){
                          if(data.err)
                            $p.addClass('modified').delay(usualDelay).removeClass('modified')
                          else
                            $p.addClass('deleted').delay(usualDelay).fadeOut(function(){
                              $p.remove()
                            })
                          modal.click()
                        },
                        error: function(){
                          $p.addClass('modified').delay(usualDelay).removeClass('modified')
                          modal.click()
                        }
                      })
                    })
                  },
                  Cancel: function(err,win2,modal2){
                    modal2.click()
                  }
                },function(){})
              })
            else
              win.find('.cancel').hide()
          })
        },
        error: function(){
          loadAlert('server error')
        }
      })
    })

    return false
  })

  /**********************************
   * 
   * Users List
   * 
   * load 10 more when the scroll hits the bottom
   * 
   * 
   **********************************/
  $('.user').each(function(){
    var userBox = $(this)
    var alreadyFoundVendors = 10
    var currentlyLoadingVendors = false
    /* On window scroll event def */
    var scrollEvent = function(){
      /* If we see the bottom of the user list */
        var userBoxHeight = userBox.height()
        var windowScrollTop = $window.scrollTop()
        var windowHeight = $window.height()
        var userScrollTop = userBox.offset().top
        var bottomOfWindow = windowScrollTop + windowHeight
        var bottomOfVendorBox = userBoxHeight + userScrollTop
        if(bottomOfWindow > bottomOfVendorBox && !currentlyLoadingVendors){
          currentlyLoadingVendors = true
          $.ajax({
            url: '/get10Users',
            data: {
              skip: alreadyFoundVendors
            },
            success: function(data){
              if(typeof(data)=='object'&&data.err){
                
              }else{
                var $newRows = $(data)
                alreadyFoundVendors = alreadyFoundVendors + $newRows.length;
                $newRows.hide()
                userBox.append($newRows)
                $newRows.fadeIn()
              }
              currentlyLoadingVendors = false
            },
            error: function(){
              currentlyLoadingVendors = false
            }
          })
        }
        /* Try to load the 'next 10' users */
    }
    scrollEvent()
    $window.bind('scroll',scrollEvent)
  })



  /**********************************
   * 
   * Admin Controls
   * 
   * vendor add, vendor edit
   * 
   * 
   **********************************/
  $('.vendor .add,.vendor .edit').live('click',function(){

    var $t = $(this)
    var $p = $t.closest('.row')

    /* Prompt for vendor add form */
    loadLoading({},function(err,win,modal){
      $.ajax({
        url:'/getVendor',
        data: {
          id: $p.attr('id')
        },
        success: function(data){
          modal.click();
          loadModal({},function(err,win,modal){
            win.append(data)

            

            /******************
             *
             * Tabify This Shizzit
             *
             ******************/
            var tabs = $('<ul class="tabs" />')
            var allContents = []
            win.find('.tab').each(function(){
              var $t = $(this)
              var h2 = $t.find('h2')
              var text = h2.text()
              var contents = $t
              contents.hide()
              var li = $('<li>')
              li.html(text)
              li.click(function(){
                for(var i in allContents){
                  allContents[i].hide()
                }
                contents.show()
                tabs.find('li').removeClass('active')
                li.addClass('active')
                $window.resize()
              })
              tabs.append(li)
              allContents.push(contents)
            })
            win.prepend(tabs)
            tabs.find('li:first').click()
            if(!$p.attr('id'))
              tabs.hide()

            

            /******************
             *
             * Name Validation auto ajaxyness
             *
             ******************/
            var name = $p.find('.name').text() || ''
            var nameT = 0
            win.find('.name').keyup(function(e){
              var $t = $(this)
              if(name!=this.value){
                clearTimeout(nameT)
                name = this.value
                nameT = setTimeout(function(){
                  $t.trigger('customValidate')
                },500)
              }
            }).bind('customValidate',function(e,next){
              var $t = $(this)
              /* It appears the name has changed, and we think they stopped typing */
              $t.removeClass('loading valid')

              if(name.match(/\b.{1,1500}\b/i)){
                $t.addClass('loading')
                $.ajax({
                  url: '/checkName',
                  data: {
                    name: name,
                    id: $p.attr('id')
                  },
                  success: function(data){
                    $t.removeClass('loading valid error')
                    if(data.err){
                      $t.addClass('error')
                      $t.showTooltip({message:'db error'})
                    }else if(data.data==0){
                      if(name.match(/\b.{1,1500}\b/i)){
                        $t.addClass('valid')
                        $t.showTooltip({message:name+' is good'})
                      }else{
                        $t.addClass('error')
                        $t.showTooltip({message:name+' doesn\'t look like a name'})
                      }
                    }else{
                      $t.addClass('error')
                      $t.showTooltip({message:name+' is taken'})
                    }
                    if(next) next()
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
                $t.showTooltip({message:name+' doesn\'t look like a name'})
                if(next) next()
              }
            })
            /******************
             *
             * Address ajaxyness
             *
             ******************/
            var address = $p.find('.address').text() || ''
            var addressT = 0
            win.find('.address').keyup(function(e){
              var $t = $(this)
              if(address!=this.value){
                clearTimeout(addressT)
                address = this.value
                addressT = setTimeout(function(){
                  $t.trigger('customValidate')
                },500)
              }
            }).bind('customValidate',function(e,next){
              var $t = $(this)
              /* It appears the address has changed, and we think they stopped typing */
              $t.removeClass('valid error')

              if(address.match(/\b.{1,}\s{1,}.{1,}\b/i)){
                $t.addClass('valid')
                $t.showTooltip({message:address+' is good'})
                var $img = $('<img class="google-map" src="//maps.googleapis.com/maps/api/staticmap?center='+address+'&markers=color:red%7Clabel:V%7C'+address+'&zoom=13&size=256x100&sensor=false" />')
                $img.load(function(){
                  $window.resize()
                }).click(function(){
                  window.open('//maps.google.com/?q='+address)
                })
                win.find('.google-map').replaceWith($img)
              }else{
                $t.addClass('error')
                $t.showTooltip({message:address+' doesn\'t look like a address'})
                if(next) next()
              }
            })
            win.find('.google-map').click(function(){
              window.open('//maps.google.com/?q='+win.find('.address').val())
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
              win.find('.address').trigger('customValidate');

              /**************************
               *
               * We rely on the name's customValidate function 
               * to show it's own loading indicators as we wait
               * for it here.
               * 
               **************************/
              win.find('.name').trigger('customValidate',function(){
                if(
                  win.find('.description').val().length > 1500
                  || win.find('.hours').val().length > 1500
                  || win.find('.contact').val().length > 1500
                ){
                  loadAlert('Apologies, that text is too long')
                  return;
                }
                var err = win.find('.error')
                if(err.length){

                }else{
                  var data = {
                    /* id is null when it's new */
                    id: $p.attr('id'),
                    name: win.find('.name').val(),
                    address: win.find('.address').val(),
                    description: win.find('.description').val(),
                    hours: win.find('.hours').val(),
                    contact: win.find('.contact').val()
                  };
                  loadLoading({},function(err,win,modal){
                    $.ajax({
                      url: '/saveVendor',
                      data: data,
                      success: function(data,t,xhr){
                        modal.click();
                        if(typeof(data)=='object'&&data.err)
                          loadAlert(data.err)
                        else{
                          var $newRow = $(data)
                          $newRow.hide()
                          /* If it's existing, replace that row */
                          if($p.attr('id'))
                            $p.replaceWith($newRow)
                          /* Otherwise, put it right after the add button they just clicked */
                          else
                            $('.vendor .add-row').after($newRow)
                          $newRow.addClass('modified').fadeIn().delay(usualDelay).queue(function(){
                            $(this).removeClass('modified')
                          })
                        }
                      },
                      error: function(){
                        modal.click();
                        loadAlert('server error')
                      }
                    })
                  })
                  modal.click(); 
                }
              })
              return false;
            })
            if($p.attr('id'))
              win.find('.cancel').click(function(){
                loadConfirm({
                  content: '<p>Are you sure?</p><p>This cannot be undone.</p>',
                  Confirm: function(err,win2,modal2){
                    modal2.click()
                    modal.click()
                    loadLoading({},function(err,win,modal){
                      $.ajax({
                        url: '/deleteVendor',
                        data: {
                          id: $p.attr('id')
                        },
                        success: function(data){
                          if(data.err)
                            $p.addClass('modified').delay(usualDelay).removeClass('modified')
                          else
                            $p.addClass('deleted').delay(usualDelay).fadeOut(function(){
                              $p.remove()
                            })
                          modal.click()
                        },
                        error: function(){
                          $p.addClass('modified').delay(usualDelay).removeClass('modified')
                          modal.click()
                        }
                      })
                    })
                  },
                  Cancel: function(err,win2,modal2){
                    modal2.click()
                  }
                },function(){})
              })
            else
              win.find('.cancel').hide()
          })
        },
        error: function(){
          loadAlert('server error')
        }
      })
    })

    return false
  })

  /**********************************
   * 
   * Vendor List
   * 
   * load 10 more when the scroll hits the bottom
   * 
   * 
   **********************************/
  $('.vendor').each(function(){
    var vendorBox = $(this)
    var alreadyFoundVendors = 10
    var currentlyLoadingVendors = false
    /* On window scroll event def */
    var scrollEvent = function(){
      /* If we see the bottom of the vendor list */
        var vendorBoxHeight = vendorBox.height()
        var windowScrollTop = $window.scrollTop()
        var windowHeight = $window.height()
        var vendorScrollTop = vendorBox.offset().top
        var bottomOfWindow = windowScrollTop + windowHeight
        var bottomOfVendorBox = vendorBoxHeight + vendorScrollTop
        if(bottomOfWindow > bottomOfVendorBox && !currentlyLoadingVendors){
          currentlyLoadingVendors = true
          $.ajax({
            url: '/get10Vendors',
            data: {
              skip: alreadyFoundVendors
            },
            success: function(data){
              if(typeof(data)=='object'&&data.err){
                
              }else{
                var $newRows = $(data)
                alreadyFoundVendors = alreadyFoundVendors + $newRows.length;
                $newRows.hide()
                vendorBox.append($newRows)
                $newRows.fadeIn()
              }
              currentlyLoadingVendors = false
            },
            error: function(){
              currentlyLoadingVendors = false
            }
          })
        }
        /* Try to load the 'next 10' vendors */
    }
    scrollEvent()
    $window.bind('scroll',scrollEvent)
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