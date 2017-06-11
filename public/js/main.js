$(function () {
	
  pedirNombre();
	
  var socket = io();
  $('#agregar-producto').click( function(e) {
    console.log("hola!");
    var name = $('#name').val();
    var price = $('#price').val();
    if (!(name == "" || price == "")) {
      socket.emit('add-product', {name: name, price: price});
      $('#name').val("");
      $('#price').val("");
    }
  });

});


function pedirMail() {
    var txt;
    var mail = prompt("Ingresa tu Mail:", "soylacomadreja@yomail.com");
    if (mail == null || mail == "") {
        txt = "Error: mail inválido";
    } else {
        
    }
}

function pedirNombre() {
    var txt;
    var person = prompt("Ingresa tu nombre:", "Jorge Perez");
    if (person == null || person == "") {
        txt = "Error: nombre inválido";
    } else {
		//cosas de eduardo
		
        pedirMail();
    }
}