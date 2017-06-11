var state;
var email;
$(function () {

  pedirNombre();

  var socket = io();
  socket.on('state', function(s) {
    console.log("state!");
    var html = "";
    state = s;
    s.products.forEach(function(p,p_id) {
      inproduct = []
      me = false;
      s.products_people.forEach(function(pp) {
        if (pp.product_id == p_id) {
          inproduct.push(s.people[pp.person_id]);
          if (s.people[pp.person_id].email == myemail) {
            me = true;
          }
        }
      });
      html += '<tr>\
                    <td>\
                    <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-table__select mdl-js-ripple-effect--ignore-events is-upgraded" data-upgraded=",MaterialCheckbox,MaterialRipple"><input type="checkbox" value="'+p_id+'" class="checkbox-producto mdl-checkbox__input" '+  (me ? ' checked ' : '') +'><span class="mdl-checkbox__focus-helper"></span><span class="mdl-checkbox__box-outline"><span class="mdl-checkbox__tick-outline"></span></span><span class="mdl-checkbox__ripple-container mdl-js-ripple-effect mdl-ripple--center" data-upgraded=",MaterialRipple"><span class="mdl-ripple"></span></span></label>\
                    </td>\
                    <td class="mdl-data-table__cell--non-numeric big-text">'+p.name+'</td>\
                    <td>'+p.price+'</td>\
                    <td>'+len(inproduct) +'</td>\
                    <td>'+p.price / len(inproduct)+'</td>\
                     <td class="big-text">'+ inproduct.reduce(function(p,v) {
                       return v + ", " + p.name;
                     }) +'</td>\
                  </tr>';
    });
    console.log(html);
    $("#products-table").html(html);

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

    $(".checkbox-producto").click( function(e) {
      p_id = e.target.val();
      if (e.target.is(":checked")) {
        socket.emit("add-me-to-product", {product_id: p_id, person_id: email })
      } else {
        socket.emit("remove-me-to-product", {product_id: p_id, person_id: email })
      }
    });

    $("#yopagare").click( function(e) {
        socket.emit("pagare", {email: email})
    });

    function pedirNombre() {
        var txt;
        name = prompt("Ingresa tu nombre:", "Jorge Perez");
        if (name == null || name == "") {
            txt = "Error: nombre inválido";
        } else {
            pedirMail();
        }
    }

    function pedirMail() {
        var txt;
        email = prompt("Ingresa tu Mail:", "soylacomadreja@yomail.com");
        if (email == null || email == "") {
            txt = "Error: mail inválido";
        } else {
          socket.emit("add-user", {name: name, email: email})
        }
    }
  })

});
