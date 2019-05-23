/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                      ______ ____ __  ___ ______
                                     /_  __//  _//  |/  // ____/
                                      / /   / / / /|_/ // __/   
                                     / /  _/ / / /  / // /___   
                                    /_/  /___//_/  /_//_____/   
                                                                    
/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

// load the dependencies of the project from the package.json 
let util = require('util');
let LuisActions = require('../core');
let reqPro = require('request-promise');
let dateFormat = require('dateformat');
let emoji = require('node-emoji');

//Get the API KEY
let ApixuApiKey = process.env.APIXU_API_Key;

//Create the action and parse the values into LUIS
let TimeOfLocationAction= {
    intentName: 'TimeOfLocation',
    friendlyName: 'Find out the time for a city',
    schema: {
        Place:{
            type: 'string',
            message: 'Of which city do you want me to find the time?'+ emoji.get('thinking_face'),
            builtInType: LuisActions.BuiltInTypes.Geography.City
        } 
    },
    fulfill: function (parameters, callback) {
        reqPro({
            url: util.format('http://api.apixu.com/v1/current.json?key=%s&q=%s', ApixuApiKey, encodeURIComponent(parameters.Place)),
            json: true
        }).then(function(data){
            if(data.error){
                callback(error.message + ': "'+ parameters.Place + '"');
            } else {
        callback(util.format('Its %s in %s'+emoji.get('grinning'),dateFormat(data.location.localtime, "h:MM" ), parameters.Place));
                }
        }).catch(console.error)
    }
};
//export the actions
module.exports = TimeOfLocationAction;