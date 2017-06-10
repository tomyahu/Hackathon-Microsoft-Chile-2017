$(function () {
  var socket = io();

  $('#agregar-producto').click( function(e) {
    var name = $('#name').val();
    var price = $('#price').val();
    if (!(name == "" || price == "")) {
      socket.emit('add-product', {name: name, price: price});
      $('#name').val("");
      $('#price').val("");
    }
  });

});