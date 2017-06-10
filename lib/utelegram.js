var utelegram = {
  HOST: "https://api.telegram.org",
  request: require( 'request' ),
  fs: require( 'fs' ),
  commands: {},
  token: null,
  connection: null,
  offset:0,
  timeout: 30000,
  setToken: function( token ) {
    utelegram.token = token;
  },
  getToken: function( ) {
    return "bot"+utelegram.token;
  },
  setOffset: function( offset ) {
    utelegram.offset = Math.max(utelegram.getOffset(), offset);
  },
  getOffset: function( ) {
    return utelegram.offset;
  },
  setTimeout: function( ) {
    utelegram.timeout = timeout;
  },
  getTimeout: function( ) {
    return utelegram.timeout;
  },
  addCommand: function( cmd, callback ) {
    utelegram.commands[cmd] = callback;
  },
  sendText: function( text, chatId ) {
    if( chatId.constructor === Array ) {
      chatId.forEach( function( id ) {
        utelegram.sendText( text, id );
      } );
			return;
    }

		var path = "/" + utelegram.getToken() + "/sendMessage";
		utelegram.request.post( utelegram.HOST + path,
			 { json: { text: text,
								 chat_id: chatId } },
			 function( error, response, body ) {
				if ( !error ){
					console.log( JSON.stringify(response.statusCode) + ": " + JSON.stringify(body) );
				} else {
					throw error;
				}
		});
  },
  sendAction: function(action,chatId) {
    if (chatId.constructor === Array) {
      chatId.forEach(function(id) {
        utelegram.sendText(text,id);
      });
    } else {
      var path = "/" + utelegram.getToken() + "/sendChatAction";
      utelegram.request.post(utelegram.HOST + path,
         { json: { action: action,
                   chat_id: chatId } },
         function( error, response, body ) {
          if ( !error ){
            console.log( JSON.stringify(response.statusCode) + ": " + JSON.stringify(body) );
          } else {
            throw error;
          }
      });
    }
  },
  sendPhoto: function( photoPath, caption, chatId ) {
    if (chatId.constructor === Array) {
      chatId.forEach(function(id) {
        utelegram.sendPhoto(text,id);
      });
    } else {
      var path = "/" + utelegram.getToken() + "/sendPhoto";
      console.log(utelegram.HOST + path);
      utelegram.request.post(utelegram.HOST + path,
         { formData: { photo: utelegram.fs.createReadStream(photoPath),
                   caption: caption,
                   chat_id: chatId },
           },
         function( error, response, body ) {
          if ( !error ){
            console.log( JSON.stringify(response.statusCode) + ": " + JSON.stringify(body) );
          } else {
            throw error;
          }
      });
    }
  },
  connect: function(token) {
    console.log("Iniciando conexión con getUpdates");
    utelegram.setToken( token );
    utelegram.connection = function() {
      console.log( "Haciendo polling");
      path = "/" + utelegram.getToken() + "/getUpdates";
      utelegram.request.post( utelegram.HOST + path,
        {
					json: {
						offset: utelegram.getOffset(),
						timeout: utelegram.getTimeout()
					}
				},
        function( error, response, body ) {
          if ( !error ){
             console.log( JSON.stringify(response.statusCode) + ": " + JSON.stringify(body) );
             var updates = body.result;
             updates.forEach(function(update) {
                utelegram.setOffset(update.update_id+1);
                var message = Object.assign( {}, update.message, update.edited_message );
								if( message == undefined ) return;
                var regex = /\/([a-z0-9])+/ig
                var cmd = message.text && message.text.match(regex);
                if (cmd != null && cmd!=undefined) {
                  if (cmd in utelegram.commands) {
                    utelegram.commands[cmd](message);
                  } else {
                    console.log("Comando no encontrado!");
                  }
                }
             });
          } else {
           throw error;
          }
          utelegram.connection();
        } );
    };
    utelegram.connection();
  },
  onError: function( error, chatId ) {
    utelegram.sendText( "Error: " + error, chatId );
  }
};

module.exports = utelegram;
