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
    var close = $('<div class="close" />')

    var settings = {
      width: 500,
      height: 235,
      closeText: 'close'
    }
    if(options)
      $.extend(settings, options)

    if(settings.closeText)
      close.html(settings.closeText)
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

    $('body').append(modal,close,win)


    var $body = $('body')
    var resizeEvent = function(){
      var width = $window.width()
      var height = $window.height()
      if(width < settings.width || height < win.height()){
        close.css({position:'relative'})
        win.width(width-60).css({position:'relative'})
        $('.body,.footer,.header').hide()
        var top = close.offset().top
        modal.css({top:0,left:0,width:width,height:top})
        window.scroll(0,top)
      }else{
        $body.css({overflow:'hidden','padding-right':scrollbarWidth})
        win.position({of:$window, at:'center top', my:'center top', offset:'0 40px'})
        modal.position({of:$window, at:'center center'})
        close.position({of:win, at:'right top', my:'right bottom', offset:'0 0'})
      }
    }
    $window.bind('resize',resizeEvent)
    var myNext = function(){
      $window.unbind('resize',resizeEvent)
      $body.css({overflow:'inherit','padding-right':0})
      modal.fadeOut(function(){
        modal.remove()
      })
      close.fadeOut(function(){
        close.remove()
      })
      win.fadeOut(function(){
        win.remove()
        if($('.window').length==0)
          $('.body,.footer,.header').show()
      })
    }
    modal.click(myNext)
    close.click(myNext)
    var width = $window.width()
    var height = $window.height()
    if(width < settings.width || height < win.height()){
      modal.show()
      win.show()
      close.show()
    }else{
      modal.fadeIn()
      win.fadeIn()
      close.fadeIn()
    }
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
    var settings = {
      position: 'above' /* Can also be below */
    }
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
          top: offset.top + (settings.position=='below'?($t.height()+40):0)
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
   * Admin Controls
   * 
   * deal add
   * 
   * 
   **********************************/
  var attachDealEvents = function($row){
    $row.find('.archive').click(function(){
      loadConfirm({
        content: '<p>Are you sure?</p><p>This cannot be undone.</p>',
        Confirm: function(err,win,modal){
          modal.click()
          $row.remove()
          $window.resize()
          _gaq.push(['_trackPageview','/admin/deal/archive']);
          $.ajax({
            url: 'saveDeal',
            data: {
              id: $row.attr('id'),
              archive: true
            },
            success: function(data){
              if(data.err)
                loadAlert(data.err)
            },
            error: function(){
              loadAlert('server error')
            }
          })
        },
        Cancel: function(err,win,modal){
          modal.click()
        }
      },function(){})
    })

    /***********************************
     *
     * ReUsable ValidateAndSave that ties 
     * a simple validation and autosaver 
     * to an input.
     *
     ***********************************/
    var validateAndSave = function(field,expression,e){
      var eventType = e || 'keyup'
      var val = 0
      var valT = 0
      $row.find('.'+field).bind(eventType,function(e){
        var $t = $(this)
        if(val!==this.value){
          clearTimeout(valT)
          valT = setTimeout(function(){
            $t.trigger('customValidate')
            },500)
        }
      }).bind('customValidate',function(){
        var $t = $(this)
        $t.removeClass('valid error')
        val = this.value
        if(val==''){
          $t.addClass('error')
          $t.showTooltip({message:'please fill in'})
        }else if(val.match(expression)){
          $t.addClass('valid')
          $t.showTooltip({message:val+' is good'})
          var data = {
            id: $row.attr('id')
          }
          data[field] = $t.val()
          $.ajax({
            url: 'saveDeal',
            data: data,
            success: function(data){
              if(data.err)
                $t.showTooltip({message:data.err})
              else{
                $t.showTooltip({message:val+' saved'})
              }
            },
            error: function(){
              $t.showTooltip({message:'server error'})
            }
          })
        }else{
          $t.addClass('error')
          $t.showTooltip({message:val+' is not quite right'})
        }
      })
    }
    validateAndSave('buy_qty',new RegExp(/\b\d{1,1500}\b/i))
    validateAndSave('buy_item',new RegExp(/\b.{1,1500}\b/i))
    validateAndSave('get_item',new RegExp(/\b.{1,1500}\b/i))


    $row.find('.print').click(function(){
      loadLoading({},function(err,win,modal){
        _gaq.push(['_trackPageview','/admin/deal/print']);
        $.ajax({
          url: '/printDeal',
          data: {
            id: $row.attr('id')
          },
          success: function(data){
            modal.click()
            if(typeof(data)=='object' && data.err)
              loadAlert(data.err)
            else{
              loadModal({
                content: data
              },function(err,win,modal){
                
                /* Well, might as well leave the code around for a bit

                win.find('.kicker').change(function(){
                  var $t = $(this)
                  if ($t.is(':checked'))
                    win.find('.warning').show()
                  else
                    win.find('.warning').hide()
                })
                */

                win.find('.print-form').submit(function(){
                  var kicker = win.find('.kicker').is(':checked');
                  var kicks = win.find('.kicks').val()*1;
                  if(kicker || kicks){
                    
                    var previews = $('<div class="previews" />')

                    if(kicks){
                      var url = '/deal/'+$row.attr('id')+'/kicks-'+kicks+'.pdf';
                      previews.append('<a href="'+url+'" target="_blank">Download</a><iframe src="'+url+'" />');
                    }
                    if(kicker){
                      var url = '/deal/'+$row.attr('id')+'/kicker.pdf';
                      previews.append('<a href="'+url+'" target="_blank">Download</a><iframe src="'+url+'" />');
                    }

                    var content = $('<div class="content" />');
                    content.append(previews);
                    
                    content.find('iframe').each(function(){
                      var $l = $('<p>loading preview...</p>');
                      $(this).before($l).load(function(){
                        $l.remove();
                        $window.resize();
                      });
                    });

                    modal.click();
                    loadModal({
                      content: content
                    },function(win,modal){
                      
                    })


                  }else{
                    loadAlert('Please select either a kicker or some kicks.')
                  }
                  return false;
                })
              })
            }
          },
          error: function(){
            modal.click()
            loadAlert('server error')
          }
        })
      })
      return false;
    })
  }
  $('.vendor-deal .add').live('click',function(){
    var $t = $(this)
    var $a = $t.closest('.add-row')
    var $v = $t.closest('.vendor-deal')

    _gaq.push(['_trackPageview','/admin/deal/add']);
    $.ajax({
      url: '/addDeal',
      data: {
        vendor_id: $v.attr('id')
      },
      success: function(data){
        var $row = $(data)
        attachDealEvents($row)
        $a.after($row)
        $window.resize()
      },
      error: function(){
        loadAlert('server error')
      }
    })
    return false;
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
      if($p.attr('id'))
        _gaq.push(['_trackPageview','/admin/user/edit']);
      else
        _gaq.push(['_trackPageview','/admin/user/new']);
        
      $.ajax({
        url: '/getUser',
        data: {
          id: $p.attr('id'),
          role: $a.attr('role'),
          vendor_id: $v.attr('id')
        },
        success: function(data){
          modal.click();
          loadModal({content:data},function(err,win,modal){
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
                    if(email.toLowerCase()==data.email){
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
                    _gaq.push(['_trackPageview','/admin/user/save']);
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
                                _gaq.push(['_trackPageview','/admin/user/sendemail']);
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
              win.find('.delete').click(function(){
                loadConfirm({
                  content: '<p>Are you sure?</p><p>This cannot be undone.</p>',
                  Confirm: function(err,win2,modal2){
                    modal2.click()
                    modal.click()
                    loadLoading({},function(err,win,modal){
                      _gaq.push(['_trackPageview','/admin/user/delete']);
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
              win.find('.delete').hide()
          })
        },
        error: function(){
          loadAlert('server error')
        }
      })
    })

    return false;
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
      if($p.attr('id'))
        _gaq.push(['_trackPageview','/admin/vendor/edit']);
      else
        _gaq.push(['_trackPageview','/admin/vendor/new']);
              
      $.ajax({
        url:'/getVendor',
        data: {
          id: $p.attr('id')
        },
        success: function(data){
          modal.click();
          loadModal({},function(err,win,modal){
            win.append(data)

            

            $('.vendor-deal .row').each(function(){
              attachDealEvents($(this))
            })



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
              h2.hide()
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

            var currentFactual = {};
            var updateFactualAndMap = function(){
              $.ajax({
                url: '/factual',
                data: {
                  name: win.find('.name').val(),
                  address: win.find('.address').val()
                },
                success: function(records){
                  if(records && records.length > 0 ){
                    currentFactual = records[0];
                    $('.real-address').html(records[0].name+'<br>'+records[0].address+'<br>'+(records[0].address_extended||''));
                    var address = records[0].latitude+','+records[0].longitude;
                    var $img = $('<img class="google-map" src="//maps.googleapis.com/maps/api/staticmap?center='+address+'&markers=color:red%7Clabel:V%7C'+address+'&zoom=13&size=256x100&sensor=false" />')
                    $img.load(function(){
                      $window.resize()
                    }).click(function(){
                      window.open('//maps.google.com/?q='+address)
                    })
                    win.find('.google-map').replaceWith($img)
                    $('.factual-details').html(
                      '<ul>'
                        +'<li>'+currentFactual.tel+'</li>'
                        +'<li>'+currentFactual.website+'</li>'
                      +'</ul>'
                    )
                  }else{
                    $('.real-address').html('');
                    $('.google-map').attr('src','');
                    $('.factual-details').html('');
                  }
                },
                error: function(){
                  
                }
              })
            }
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
                $t.addClass('valid')
                $t.showTooltip({message:name+' is good'})
                updateFactualAndMap();
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
              address = this.value;
              /* It appears the address has changed, and we think they stopped typing */
              $t.removeClass('valid error')

              if(address.match(/\b.{1,1500}\b/i)){
                $t.addClass('valid')
                $t.showTooltip({message:address+' is good'})
                updateFactualAndMap();
              }else{
                $t.addClass('error')
                $t.showTooltip({message:address+' doesn\'t look like a address'})
                if(next) next()
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

              if(
                win.find('.hours').val().length > 1500
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
                  factual: currentFactual,
                  hours: win.find('.hours').val()
                };
                loadLoading({},function(err,win,modal){
                  _gaq.push(['_trackPageview','/admin/vendor/save']);
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
                        $newRow.find('.edit').click();
                      }
                    },
                    error: function(){
                      modal.click();
                      loadAlert('server error')
                    }
                  });
                });
                modal.click(); 
              }
              return false;
            })
            if($p.attr('id'))
              win.find('.delete').click(function(){
                loadConfirm({
                  content: '<p>Are you sure?</p><p>This cannot be undone.</p>',
                  Confirm: function(err,win2,modal2){
                    modal2.click()
                    modal.click()
                    loadLoading({},function(err,win,modal){
                      _gaq.push(['_trackPageview','/admin/vendor/delete']);
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
              win.find('.delete').hide()
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














});