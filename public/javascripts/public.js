$(function(){
  var loadModal = function(options){
    var modal = $('<div class="modal" />')
    var win = $('<div class="window" />')
    $('body').append(modal).append(win)
    win.position({of:window,at:'center center'});
    modal.click(function(){
      modal.remove()
      win.remove()
    })
  }
  $('a').click(function(){
    loadModal({
      content: ''
    })
    return false
  })
})