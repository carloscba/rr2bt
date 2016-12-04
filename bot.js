var request    = require("request");

//BOT
var Botkit    = require("./lib/Botkit.js");
var translate = require("./bot/labels");
var botData   = require("./bot/data");

var access_token = "";
var verify_token = "";  

var controller = Botkit.facebookbot({
    debug: false,
    access_token: access_token,
    verify_token: verify_token
});

var bot = controller.spawn({});

var port = process.env.PORT || process.env.port || 3000;

controller.setupWebserver(port, function(err, webserver) {
    
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log("ONLINE!");
    });

    webserver.get("/",function(req,res) {
        console.log("INDEX");
    });

});

var mysql      = require("mysql");
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'agro'
});

connection.connect();

//----------------------------------------------------------------------------------------------------------------------------

var currentConversation = [];

var getTemplateWelcome = function(){
    
    var templateWelcome = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": "¿Qué desea hacer?" ,
                "buttons":[{
                    "type":"postback",
                    "title": "Condiciones Actuales",
                    "payload":"CONDICIONES"
                },
                {
                    "type":"postback",
                    "title": "Pronostico",
                    "payload":"PRONOSTICO"
                },
                {
                    "type":"postback",
                    "title": "Enviar Datos",
                    "payload":"ENVIAR"
                },
                ]
            }
        }
    }

    return templateWelcome;
}

var getTemplateData = function(){
    
    var template = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": "¿Sobre qué quiere reportar?" ,
                "buttons":[{
                    "type":"postback",
                    "title": "Enfermedades",
                    "payload":"ENFERMEDADES"
                },
                {
                    "type":"postback",
                    "title": "Plagas",
                    "payload":"PLAGAS"
                },
                {
                    "type":"postback",
                    "title": "Daño Climatico",
                    "payload":"DANIO"
                },
                ]
            }
        }
    }

    return template;
}

var getTemplateDanio = function(){
    
    var template = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": "¿Daño de que tipo se presenta?" ,
                "buttons":[{
                    "type":"postback",
                    "title": "Granizo",
                    "payload":"GRANIZO"
                },
                {
                    "type":"postback",
                    "title": "Helada",
                    "payload":"HELADA"
                }
                ]
            }
        }
    }

    return template;
}

var getTemplateLocation = function(){
    var template ={ 
            "text":"Por favor indique su posición:",
            "quick_replies":[{
                "content_type":"location"
            }]
    };

    return template;
}


var getImageStart = function(url){
    var template = {
        "attachment":{
            "type":"image",
            "payload":{
                "url":""
            }
        }        
    }
    return template;
}

var getImage = function(url){
    var template = {
        "attachment":{
            "type":"image",
            "payload":{
                "url":url
            }
        }        
    }
    return template;
}

var weather = function(bot, message, coor){

    key     = "75b9a089c02b1908b7a99cd78d35ee01";
    country = "US";

    units   = "metric";

    //ACTUAL
    url = "http://api.openweathermap.org/data/2.5/weather?lat="+coor.lat+"&lon="+coor.lng+"&appid="+key+"&units="+units+"&lang=es";
    console.log(url)
    request(url, function (error, response, body) {
        
        if (!error && response.statusCode == 200) {
            
            var weatherData = JSON.parse(body);
            
            var elements = [];
            var loop = 0;
            
                
            if(elements.length < 10){
                console.log((loop % 8))
                if((loop % 8) == 0){
                    
                    elements.push({
                        "title"     : weatherData.weather[0].description,
                        "subtitle"  : "Temperatura: "+weatherData.main.temp+" - Minima: "+weatherData.main.temp_min+""+" - Maxima: "+weatherData.main.temp_max+"",
                        "image_url" : "http://openweathermap.org/img/w/"+weatherData.weather[0].icon+".png",
                        /*
                        "buttons":[{
                            "type" : "web_url",
                            "url"  : "http://maps.google.com/maps?&z=15&mrt=yp&t=m&q="+botData.stores[n].lat.replace(',','.')+"+"+botData.stores[n].lng.replace(',','.')+"",

                            "title": translate.get(lng["u"+message.user], "ir")
                        }]
                        */
                    });
                    
                }
            }       
                 
            
            
            var template = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "elements":elements
                    }
                }
            }     
            console.log(elements);
            bot.reply(message, template);       
        }
    });   

}

var forecast = function(bot, message, coor){

    key     = "75b9a089c02b1908b7a99cd78d35ee01";
    country = "US";
    units   = "metric";
   
    url = "http://api.openweathermap.org/data/2.5/forecast?lat="+coor.lat+"&lon="+coor.lng+"&appid="+key+"&units="+units+"&lang=es";
    console.log(url)
    request(url, function (error, response, body) {
        
        if (!error && response.statusCode == 200) {
            
            var weatherData = JSON.parse(body);
            
            var elements = [];
            var loop = 0;
            for(n in weatherData.list){
                
                if(elements.length < 10){
                    console.log((loop % 8))
                    if((loop % 8) == 0){
                        
                        elements.push({
                            "title"     : weatherData.list[n].weather[0].description,
                            "subtitle"  : "Temperatura: "+weatherData.list[n].main.temp+" - Minima: "+weatherData.list[n].main.temp_min+""+" - Maxima: "+weatherData.list[n].main.temp_max+"",
                            "image_url" : "http://openweathermap.org/img/w/"+weatherData.list[n].weather[0].icon+".png",
                            /*
                            "buttons":[{
                                "type" : "web_url",
                                "url"  : "http://maps.google.com/maps?&z=15&mrt=yp&t=m&q="+botData.stores[n].lat.replace(',','.')+"+"+botData.stores[n].lng.replace(',','.')+"",

                                "title": translate.get(lng["u"+message.user], "ir")
                            }]
                            */
                        });
                        
                    }
                }       
                loop++;         
            }
            
            var template = {
                "attachment":{
                    "type":"template",
                    "payload":{
                        "template_type":"generic",
                        "elements":elements
                    }
                }
            }     
            console.log(elements);
            bot.reply(message, template);       
        }
    });  

}

enfermedadesData = [{
        "nombre" : "Septoriosis", 
        "tratamiento" : "Se recomienda aplicar formulación cuyo principio activo contenga Azoxistrobina"
    },
    {
        "nombre" : "Mancha Amarilla", 
        "tratamiento" : "Se recomienda aplicar formulación cuyo principio activo contenga Metconazole o Difenoconazole"
    },
    {
        "nombre" : "Bacteriosis", 
        "tratamiento" : "Se recomienda evitar ingresar con la maquinaría al lote mientras el cultivo está mojado. Planificar rotación de cultivos en ese lote."
    },
    {
        "nombre" : "Oidio", 
        "tratamiento" : "Se recomienda aplicar formulación cuyo principio activo contenga Metconazole"
    },
    {
        "nombre" : "Roya Amarilla", 
        "tratamiento" : "Se recomienda aplicar formulación cuyo principio activo contenga Azoxistrobina "
    },
    {
        "nombre" : "Roya Anaranjada", 
        "tratamiento" : "Se recomienda aplicar formulación cuyo principio activo contenga Azoxistrobina "
    },
    {
        "nombre" : "Carbon Volador", 
        "tratamiento" : "Se recomienda aplicar formulación cuyo principio activo contenga Difenoconazole"
    }                    
    ];

var enfermedadTratamiento = function(bot, message, enfermedad){

    for(n in enfermedadesData){
        console.log(enfermedadesData[n].nombre +"=="+ enfermedad)
        if(enfermedadesData[n].nombre == enfermedad){
            bot.reply(message, enfermedadesData[n].tratamiento);
            break;
        }
    }

}

var findEnfermedad = function(enfermedad){

    
    //enfermedadesData = ["Septoriosis","Mancha Amarilla","Bacteriosis","Oidio","Roya Amarilla","Roya Anaranjada","Carbon Volador"];
    found = [];

    for(var n in enfermedadesData){
        console.log(enfermedadesData[n].nombre.toLowerCase().replace(" ", "")+','+ enfermedad.toLowerCase().replace(" ", ""))
        var distArray = levenshteinenator(enfermedadesData[n].nombre.toLowerCase().replace(" ", ""), enfermedad.toLowerCase().replace(" ", ""));
        var dist      = distArray[ distArray.length - 1 ][ distArray[ distArray.length - 1 ].length - 1 ];

        console.log("dist: " + dist);
        if(dist < 10 && found.length < 3){
            found.push(enfermedadesData[n].nombre);
        }
    }    

    if(found.length > 0){

        var buttons = [];

        for(var n in found){
            buttons.push({
                "type"    : "postback",
                "title"   : found[n],
                "payload" : "ENFERMEDAD_"+found[n]
            })
        }

        var template = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text": "Confirme de que enfermedad se trata",
                    "buttons": buttons
                }
            }
        }

        return template;

    }else{

        return false;

    }    

}

var enfermedadesConversation = function(bot, message){
    
    var enfermedadesConversation1 = function(response, convo){
        
        currentConversation["u"+message.user] = convo;
        
        convo.ask("Indique el nombre de la enfermedad",[{
            default: true,
            callback: function(response,convo) {
                
                enfermedadResponse = findEnfermedad(response.text); 
                if(enfermedadResponse){
                    bot.reply(message, enfermedadResponse)
                }else{
                    convo.repeat();
                    convo.next();    
                }
            }
        }]); 

    }

    bot.startConversation(message, enfermedadesConversation1);
}



var welcomeMsg = function(bot, message){
    
    url = "https://graph.facebook.com/v2.8/"+message.user+"?access_token="+access_token;
    
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            
            var userData = JSON.parse(body);

            connection.query("SELECT * FROM users WHERE fbId = '"+message.user+"'", function(err, rows, fields) {
              if(!err){
                console.log("Rows.length:", rows.length);
                if(rows.length == 0){

                    var post  = {first_name: userData.first_name, fbId: message.user};
                    
                    var query = connection.query('INSERT INTO users SET ?', post, function(err, result) {


                        bot.reply(message, "Bienvenido "+userData.first_name+". Para comenzar necesitamos conocer tu ubicación", function(){
                            bot.reply(message, getTemplateLocation());
                        })

                    });
 
                }else{
                    
                    bot.reply(message, "Hola "+userData.first_name, function(){

                        //Opciones para iniciar
                        bot.reply(message, getTemplateWelcome());
                        
                    })

                }
              }
            });            

        }
    });    

}


//A4
var findStore = false;

controller.hears(["hola","hi"], "message_received", function(bot, message) {
    welcomeMsg(bot, message);
});

controller.on("message_received", function(bot, message) {
    
    if(message.attachments){
        if(message.attachments[0].type == "location"){

            coordinates = message.attachments[0].payload.coordinates

            connection.query("UPDATE users SET lat = '"+coordinates.lat+"', lng = '"+coordinates.long+"'", function (err, result) {
                if (!err){
                    bot.reply(message, getTemplateWelcome());
                }else{
                    bot.reply(message, "No se pudo guardar la ubicación");
                }
                
            })

        }
    }
    
});

controller.on("facebook_postback", function(bot, message) {
    
    console.log("message.payload: " + message.payload);

    if(message.payload.search("ENFERMEDAD_") > -1){
        tmp = message.payload.split("_");
        var enfermedadName = tmp[1];

        enfermedadTratamiento(bot, message, enfermedadName);
    }

    if(currentConversation["u"+message.user]){
        currentConversation["u"+message.user].stop();    
    } 

    switch(message.payload){
        case "COMENZAR":
            welcomeMsg(bot, message);
        break;
        case "CONDICIONES":
            weather(bot, message, {"lat" : "-37.322827", "lng" : "-59.079722"})
            //bot.reply(message, getTemplateData());
        break;
        case "PRONOSTICO":
            forecast(bot, message, {"lat" : "-37.322827", "lng" : "-59.079722"})
            //bot.reply(message, getTemplateData());
        break;
        case "ENVIAR":
      
            bot.reply(message, getTemplateData());
        break;

        case "ENFERMEDADES":

            enfermedadesConversation(bot, message)
        
        break;

        case "DANIO":
        
            bot.reply(message, getTemplateDanio());
        break;
            case "GRANIZO":
        
                bot.reply(message, "GRANIZO");
            break;       
            case "HELADA":
        
                bot.reply(message, "HELADA");
            break;                            

        case "LANGUAGE":
            translate.change();
        break;

    }
    

});

var levenshteinenator = (function () {

    /**
     * @param String a
     * @param String b
     * @return Array
     */
    function levenshteinenator(a, b) {
        var cost;
        var m = a.length;
        var n = b.length;

        // make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
        if (m < n) {
            var c = a; a = b; b = c;
            var o = m; m = n; n = o;
        }

        var r = []; r[0] = [];
        for (var c = 0; c < n + 1; ++c) {
            r[0][c] = c;
        }

        for (var i = 1; i < m + 1; ++i) {
            r[i] = []; r[i][0] = i;
            for ( var j = 1; j < n + 1; ++j ) {
                cost = a.charAt( i - 1 ) === b.charAt( j - 1 ) ? 0 : 1;
                r[i][j] = minimator( r[i-1][j] + 1, r[i][j-1] + 1, r[i-1][j-1] + cost );
            }
        }

        return r;
    }

    /**
     * Return the smallest of the three numbers passed in
     * @param Number x
     * @param Number y
     * @param Number z
     * @return Number
     */
    function minimator(x, y, z) {
        if (x <= y && x <= z) return x;
        if (y <= x && y <= z) return y;
        return z;
    }

    return levenshteinenator;

}());