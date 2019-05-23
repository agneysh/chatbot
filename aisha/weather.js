/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
                            _       ___________  ________  ____________ 
                            | |     / / ____/   |/_  __/ / / / ____/ __ \
                            | | /| / / __/ / /| | / / / /_/ / __/ / /_/ /
                            | |/ |/ / /___/ ___ |/ / / __  / /___/ _, _/ 
                            |__/|__/_____/_/  |_/_/ /_/ /_/_____/_/ |_|  
                                                                        
/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

//Load the libraries needed and the dependencies
let util = require('util');
let LuisActions = require('../core');
let reqpro = require('request-promise');
let emoji = require('node-emoji');

//Get API KEY
let ApixuApiKey = process.env.APIXU_API_Key;

//The Actions
let WeatherOfLocationAction= {
    intentName: 'WeatherOfLocation',
    friendlyName: 'What\'s the weather?',
    schema: {
        Place:{
            type: 'string',
            message: 'Of which city? ' +emoji.get('thinking_face'),
            builtInType: LuisActions.BuiltInTypes.Geography.City
        }
    },
    // Action Fulfillment method, Receives the parameters and calls back to invoke the fulfilled result
    fulfill: function (parameters, callback) {
        reqpro({
            url: util.format('http://api.apixu.com/v1/current.json?key=%s&q=%s', ApixuApiKey, encodeURIComponent(parameters.Place)),
            json: true
        }).then(function(data){
            if(data.error){
                callback(error.message + ': "'+ parameters.Place + '"');
            } else {
                if(data.current.condition.text =='Sunny'){
                    callback(util.format('I love the weather in %s ,%s today.'+ emoji.get('heart_eyes') + ' because it is %s !!! The humidity level is approx %s %%' + emoji.get('thinking_face'),
                     data.location.name, data.location.country, data.current.condition.text, data.current.humidity));                                  
                } else if(data.current.condition.text =='Cloudy' || data.current.condition.text =='Partly cloudy'){
                    callback(util.format('Its %s ,today in %s,%s. Be sure to take an '+ emoji.get('umbrella') + ' as precaution. Humidity level is approx %s %%' + emoji.get('thinking_face'),
                     data.current.condition.text, data.location.name, data.location.country, data.current.humidity));                                  
                } else if(data.current.condition.text =='Rainy'|| data.current.condition.text =='Light rain' || data.current.condition.text =='Heavy rainfall' ||data.current.condition.text =='Torrential rain'){
                    callback(util.format('It says %s,'+ emoji.get('persevere') +'in %s,%s .Personally, ive never liked this weather. Incase your going there, take an umbrella ' + emoji.get('umbrella') +
                    ' The humidity level is approx %s %%'+ emoji.get('thinking-face'), data.current.condition.text, data.location.name, data.location.country, data.current.humidity));
                } else if(data.current.condition.text =='Foggy' ){
                    callback(util.format('%s, in %s,%s. be safe in case your driving '+ emoji.get('see_no_evil') +' Humidity levels approx %s'+ emoji.get('thinking_face'),
                    data.current.condition.text, data.location.name, data.location.country, data.current.humidity));
                } else{
                    callback(util.format('Weather is %s,in %s %s.'+ emoji.get('grinning') +' The humidity level is approx %s %% '+ emoji.get('thinking_face'), data.current.condition.text, data.location.name, data.location.country, data.current.humidity ));                                      
                }
                }
        }).catch(console.error)
    }
};

//Export the actions
module.exports = WeatherOfLocationAction;
