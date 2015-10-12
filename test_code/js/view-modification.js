$(document).ready(function () {
  $(".dropdown-menu li a").click(function(){
    var btn = $(this).parent().parent().prev();
    console.log(btn[0]);
    var idOfBtn = $(btn).attr('id');
    console.log(idOfBtn);
    $('#'+ idOfBtn).html($(this).text()+' <span class="caret"></span>');
  });


  $(function() {
    $( ".datepicker" ).datepicker({
      dateFormat: 'yy.M. d.'
    });
  });
});
