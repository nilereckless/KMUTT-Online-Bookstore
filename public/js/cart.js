$( document ).ready(function() {
    $(".addCart").on("click", function(e){
       e.preventDefault() ;
       var bookID = $(this).attr("data-id") ;
       var url = "/cart/add/" + bookID ;
       var request = $.get(url) ;
        request.done(function(e) {
          if(e === "Unauthorized"){
            $('#loginmodal').modal('toggle')
          //  window.location.href = '/login?next=cart' ; //หน้าLogin แล้วเสร็จปุ๊บค่อยไปหน้าCart
          } else {
          if($("#cartCount").attr("data-count") > 0){
            $("#cartCount").attr("data-count", parseInt($("#cartCount").attr("data-count"))+parseInt(1)) ;
          } else {
            $("#cartCount").attr("data-count", 1) ;
          }
            Swal.fire(
              'Added to cart',
              '',
              'success'
            )
          }
        })
        request.fail(function() {
          alert( "error" );
        })
    })

});