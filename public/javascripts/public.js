$(function(){
  var loadModal = function(options, next){
    var modal = $('<div class="modal" />')
    var win = $('<div class="window" />')

    if(options.content)
      win.html(options.content)
    if(options.height)
      win.height(options.height)
    if(options.width)
      win.width(options.width)
    $('body').append(modal,win)
    win.position({of:window,at:'center center'});
    modal.click(function(){
      modal.remove()
      win.remove()
    });
    modal.fadeIn()
    win.fadeIn()
    next(false,win,modal)
  }
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
  $('.navigation .login').click(function(){
    loadModal({},function(err,win,modal){
      $.get('/_login',function(data){
        win.html(data);
        var form = win.find('form')
        var cancel = win.find('.cancel')
        cancel.click(function(){modal.click()})
        form.find('.email').focus()
        form.submit(function(){
          var email = form.find('.email').val();
          var password = form.find('.password').val();
          loadLoading({},function(err,win,loadingModal){
            $.ajax({
              url: '/login',
              type: 'POST',
              data: {
                email: email,
                password: password
              },
              success: function(data){
                loadingModal.click();
                if(data.err)
                  alert(data.err)
                else{
                  loadAdmin()
                  modal.click()
                }
              },
              error: function(jqXHR,textStatus,err){
                console.log(jqXHR,textStatus,err)
              }
            })
          })
          return false;
        })
      })
    })
    return false
  })
  var loadAdmin = function(){
    $.get('/_navigation_admin',function(data){
      $('.navigation').html(data)
    })
    $.get('/_body_admin',function(data){
      $('.body').html(data)
    })
  }
})