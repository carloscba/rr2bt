var request    = require('request');

//BOT
var Botkit    = require('./lib/Botkit.js');
var translate = require('./bot/labels');
var botData   = require('./bot/data');

var access_token = "XXX";
var verify_token = "123456"; 

var controller = Botkit.facebookbot({
    debug: false,
    access_token: access_token,
    verify_token: verify_token
});

var bot = controller.spawn({});

var port = process.env.PORT || process.env.port || 3000;

controller.setupWebserver(port, function(err, webserver) {
    
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('ONLINE!');
    });

    webserver.get('/',function(req,res) {
        console.log('INDEX');
    });

});

//----------------------------------------------------------------------------------------------------------------------------

var result        = [];
var user = {
    data : {},
    option : {
        gender   : 0,
        username : '',
        age      : 0
    }
}  
var templateTypes = {};
var lng           = 'es';
var currentConversation = false;



var getTemplateWelcome = function(text){
    
    var templateWelcome = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": text ,
                "buttons":[{
                    "type":"postback",
                    "title": translate.get('btnEmpezar_1'),
                    "payload":"SEND"
                },
                {
                    "type":"postback",
                    "title": translate.get('btnEmpezar_2'),
                    "payload":"FIND"
                }]
            }
        }
    }

    return templateWelcome;

}

var getTemplateTypes = function(username){

    var templateTypes = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": translate.get('t13',{username : username}),
                "buttons":[{
                    "type":"postback",
                    "title": translate.get('divertido'),
                    "payload":"OPTION_A"
                },
                {
                    "type":"postback",
                    "title": translate.get('amigable'),
                    "payload":"OPTION_B"
                },
                {
                    "type":"postback",
                    "title":translate.get('romantico'),
                    "payload":"OPTION_C"
                }]
            }
        }    
    } 

    return templateTypes;

}

var getTemplateSearch = function(){

    var templateTypes = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": translate.get('t15'),
                "buttons":[{
                    "type":"postback",
                    "title": translate.get('si'),
                    "payload":"SEARCH_YES"
                },
                {
                    "type":"postback",
                    "title": translate.get('no'),
                    "payload":"SEARCH_NO"
                }]
            }
        }    
    } 

    return templateTypes;
}

var getTemplateGreeting = function(){

    var templateTypes = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": translate.get('t20'),
                "buttons":[{
                    "type":"postback",
                    "title": translate.get('si'),
                    "payload":"GREETING_YES"
                },
                {
                    "type":"postback",
                    "title": translate.get('no'),
                    "payload":"GREETING_NO"
                }]
            }
        }    
    } 

    return templateTypes;
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

//A
var welcomeMsg = function(bot, message){
    
    url = "https://graph.facebook.com/v2.8/"+message.user+"?access_token="+access_token;
    
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            
            var userData = JSON.parse(body);

            lng = translate.set(userData.locale);

            user = {
                data : userData,
                option : {
                    gender : 0,
                    username   : '',
                    age    : 0
                }
            }            

            
            bot.reply(message, translate.get('t01', {first_name : user.data.first_name, hour : hourTxt}), function(){
                
                conversation();
                
            })
            

        }
    });    

}

//A1
var conversation = function(bot, message){

    var conversation1 = function(response, convo){
        currentConversation = convo;

        convo.say("Buenas tardes");

        var currentAsk = 0;
        var ask = [translate.get('t06'),translate.get('t07'),translate.get('t08')]

        convo.ask("Es de día o de noche", [{
            pattern: "día",
            callback: function(response,convo) {
                conversation2(response, convo)
                convo.next();
            }
        },{
            pattern: "noche",
            callback: function(response,convo) {
                conversation2(response, convo)
                convo.next();
            }
        },{
            default: true,
            callback: function(response,convo) {
                convo.ask(""); //Repregunta y repito
                convo.repeat();
                convo.next();
            }
        }]);
    }

    var conversation2 = function(response, convo){   

        convo.ask("¿Cual es tu nombre?",[{
            default: true,
            callback: function(response,convo) {
                convo.setVar('name', response.text);
                conversation3();
                convo.next();
            }
        }]); 
    }
    
    var conversation3 = function(response, convo){

        convo.ask("Que edad tienes {{name}}", [{
            default: true,
            callback: function(response,convo) {
                if(Number.isInteger(parseInt(response.text))){
                    convo.setVar('age', response.text);
                    conversationEnd(response, convo)
                }else{
                    convo.next();    
                }
                
            }
        }]);  

    }

    var conversationEnd = function(response, convo){
        
        convo.stop();
        bot.reply(message, translate.get('t12'), function(){
            bot.reply(message, getTemplateTypes(user.option.username));
        })

    }

    bot.startConversation(message, sendConversation1);

}


var optionSelected = function(bot, message, options){
    
    
    bot.reply(message, getImage(options.img_url), function(err,response){
        bot.reply(message, translate.get('t14',{username : user.option.username}), function(err,response){
            bot.reply(message, getTemplateSearch())
        });

    })
    

}

//A4
var findStore = false;

//findConversation-----------------------------------------------------------------------
var found = {};
var findCity = function(bot, message, city){
    
    foundCities = [];

    for(var n in botData.cities){
        var distArray = levenshteinenator(botData.cities[n].toLowerCase(), city.toLowerCase());
        var dist      = distArray[ distArray.length - 1 ][ distArray[ distArray.length - 1 ].length - 1 ];

        if(dist < 4 && foundCities.length < 3){
            foundCities.push(botData.cities[n]);
        }
    }

    if(foundCities.length > 0){
        
        var buttons = [];

        for(var n in foundCities){
            buttons.push({
                "type"    : "postback",
                "title"   : foundCities[n],
                "payload" : "CITY_"+foundCities[n]            
            })
        }
    
        var template = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text": translate.get('t19'),
                    "buttons": buttons 
                }
            }
        }        
          
        
        found = template;
        return true;

    }else{
        
        return false;

    }    
}

 

controller.hears(['hola','hi'], 'message_received', function(bot, message) {
    welcomeMsg(bot, message);
});

controller.on('message_received', function(bot, message) {
    
    if(message.seq){
        bot.reply(message, "Mensaje generico");  
    }
    
});

controller.on('facebook_postback', function(bot, message) {
    
    if(message.payload.search('CITY_') > -1){
        tmp = message.payload.split('_');
        var cityName = tmp[1]
    }

    switch(message.payload){
        case 'INIT':
            if(currentConversation){
                currentConversation.stop();    
            }        
            welcomeMsg(bot, message);
        break;

        case 'LANGUAGE':
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