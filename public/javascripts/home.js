$(function(){

  /***********************************
   *
   * Home Page Controls
   *
   * Starting with the sliding of the phone screens
   *
   *
   ************************************/
  var current = 0;
  var oneUnit = 252;
  var slideUl = $('.screenshot .screens ul');
  var total = slideUl.find('li').length-1;
  var mousePos = [0,0];
  var startPos = [0,0];
  var slideMoving = false;
  var slideLeft = function(){
    current = current - oneUnit;
    doSlide();
  }
  var doSlide = function(){
    slideUl.stop(true,false);
    if(current < -oneUnit*total){
      current =  -oneUnit*total;
      slideUl.animate({marginLeft:current},500); 
    }else if(current > 0){
      current = 0;
      slideUl.animate({marginLeft:current},500); 
    }else{
      slideUl.animate({marginLeft:current},500); 
    }
  }
  var doSlideFast = function(){
    slideUl.css({marginLeft:current});
  }
  var slideInterval = setInterval(function(){slideLeft();},3000);
  slideUl.bind('mousedown touchstart',function(e){
    if(e.originalEvent.touches && e.originalEvent.touches.length) {
        e = e.originalEvent.touches[0];
    } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
        e = e.originalEvent.changedTouches[0];
    }
    slideMoving = true;
    mousePos = [e.clientX,e.clientY];
    startPos = mousePos;

    slideUl.stop(true,false);
    clearTimeout(slideInterval);

    return false;

  })
  $(window).bind('mousemove touchmove',function(e){
    if(slideMoving){
      
      if(e.originalEvent.touches && e.originalEvent.touches.length) {
          e = e.originalEvent.touches[0];
      } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
          e = e.originalEvent.changedTouches[0];
      }
      var newMousePos = [e.clientX,e.clientY];

      current = current - (mousePos[0]-newMousePos[0]);
      doSlideFast();

      mousePos = newMousePos;

      return false;

    }
  }).bind('mouseup touchend',function(e){
    if(slideMoving){
      if(e.originalEvent.touches && e.originalEvent.touches.length) {
          e = e.originalEvent.touches[0];
      } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
          e = e.originalEvent.changedTouches[0];
      }
      slideMoving = false;
      var newMousePos = [e.clientX,e.clientY];
      mousePos = newMousePos;

      var offSet = current%oneUnit;
      current = current - offSet;

      if(offSet < -oneUnit/2)
        current = current - oneUnit;

      if(startPos[0]-mousePos[0] > 0)
        current = current - oneUnit;
      else if(startPos[0]-mousePos[0] < 0)
        current = current + oneUnit;
      else{
        current = current - oneUnit;
        if(current < -oneUnit*total)
          current = 0;
      }


      doSlide();
      
      return false;
    }
  });

})