var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var appId = '6407018727119024';
var appSecret = 'x1ATexGjwQ8qhitG2FSxTARp9f4CXgfk';
var urlbase = 'https://pagameme.cuy.cl';
var MP = require( 'mercadopago' );

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

app.get('/:id', function(req, res, next) {
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
			if( error ) return;

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
					res.send (err); //enviar error
					return;
				}

				//enviar boton para que paguen
				res.render ("button", {"preference": data});

			} );

		} );
	}

	res.render('index', { title: 'Pagameme', appId: appId });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Memory

var estado = {bills: [{id: 1, name: "Carrete Post Hackathon", status:0}],
		products: [{id: 1, bill: 1, name: "Comida", price: 1250}],
		people: [{id: 1, bill: 1, name: "Tomimi", email: "tomyahu@gmail.com"}],
		product_people: [{person_id: 1, product_id: 1}]}


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
