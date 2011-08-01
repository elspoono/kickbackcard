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
  $('a').click(function(){
    loadModal({},function(err,win,modal){
      $.get('/login',function(data){
        win.html(data);
        var form = win.find('form')
        form.submit(function(){
          var email = form.find('.email').val();
          var password = form.find('.password').val();
          loadLoading({},function(err,win,modal){
            setTimeout(function(){
              modal.click();
            },3000)
          })
          return false;
        })
      })
    })
    return false
  })
})