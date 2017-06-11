var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var appId = '6407018727119024';
var appSecret = 'x1ATexGjwQ8qhitG2FSxTARp9f4CXgfk';
var urlbase = 'https://pagameme.cuy.cl/';
var MP = require( 'mercadopago' );
var fs = require('fs');
var http = require('https');
var request = require('request');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get( '/:id?', function(req, res, next) {
	if( req.query.code ) {
		userCode = req.query.code;
		request.post( {
			'headers': { 'accept': 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
			'url': 'https://api.mercadopago.com/oauth/token',
			'form': {
				'client_id': appId,
				'client_secret': appSecret,
				'grant_type': 'authorization_code',
				'code': userCode,
				'redirect_uri': urlbase
			}
		}, function( error, response, body ) {
			if( error || body.error ) {
				console.log( error );
				return;
			}

			var mp = new MP( body.access_token );
			//traer datos desde el socket
			var preference = {
				"items": [ {
					"title": "Boleta Compartida",
					"description": "Description",
					"quantity": 1,
					"unit_price": 50,
					"currency_id": "CLP",
					"picture_url": "https://www.mercadopago.com/org-img/MP3/home/logomp3.gif"
				} ], "marketplace_fee": 0
			};

			mp.createPreference( preference, function (err, data){
				if( err ) {
					console.log(err); //enviar error
					return;
				}

				//enviar boton para que paguen
				for( var i = 0; i < people.length; i++ ) {
					people[i].emit();
				}
			} );

		} );

	}

	res.render('index', { title: 'Pagameme', appId: appId, code: req.query.code });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Memory

var state = {bills: [{name: "Carrete Post Hackathon", status:0}],
		products: [{name: "Comida", price: 1250}],
		people: [{name: "Tomimi", email: "tomyahu@gmail.com"}],
		product_people: [{person_id: 0, product_id: 0}]}


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var server = http.createServer( {
	key: fs.readFileSync( __dirname + '/certs/server.key' ),
  cert: fs.readFileSync( __dirname + '/certs/server.crt' ),
}, app);

var s1 = server.listen( '443' );


var io = require('socket.io')(server);
var people = [];
io.on('connection', function(socket){
  console.log('a user connected');
	people.push( socket );
  socket.on('add-product', function(data) {
		console.log("Recibí algo! " + data.name + ", " + data.price);
    state.products.push(data);
		socket.emit('state', state);
  });
  socket.on('add-person', function(data) {
    state.people.push(data);
		socket.emit('state', state);

  });
  socket.on('remove-me-from-product', function(data) {
    state.products_people = state.products_people.filter(function (data) {
      if (data.person_id == data.id) {
        return false;
      }
      return true;
			socket.emit('state', state);
    });
  });
  socket.on('add-me-to-product', function(data) {
    state.products_people.push(data);
		socket.emit('state', state);
  });
  socket.on('close_bill', function(data) {
     // Close bill and broadcast it
		 socket.emit('state', state);
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
