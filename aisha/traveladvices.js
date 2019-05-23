
/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
          ______ ____   ___  _    __ ______ __       ___     ____  _    __ ____ ______ ______ _____
         /_  __// __ \ /   || |  / // ____// /      /   |   / __ \| |  / //  _// ____// ____// ___/
          / /  / /_/ // /| || | / // __/  / /      / /| |  / / / /| | / / / / / /    / __/   \__ \ 
         / /  / _, _// ___ || |/ // /___ / /___   / ___ | / /_/ / | |/ /_/ / / /___ / /___  ___/ / 
        /_/  /_/ |_|/_/  |_||___//_____//_____/  /_/  |_|/_____/  |___//___/ \____//_____/ /____/  
                                                                                                
/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

// load the dependencies of the project from the package.json 
let util = require('util');
let LuisActions = require('../core');
let dateFormat= require('dateformat');
let emoji = require('node-emoji');
let reqPro = require('request-promise');
let builder = require('botbuilder');

//Get API KEY
let TravelInnovationKey = process.env.TRAVEL_INNOVATION_KEY;
let ApixuApiKey = process.env.APIXU_API_KEY;

//The Action
let TravelAdvicesAction = {
    intentName: 'TravelAdvices',
    friendlyName: 'Travel Advices',
    confirmOnContextSwitch: true,

    schema: {
        Place: {
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.Geography.City,
            message: 'Where are you right now? e.g Miami, Venice, Bern' +emoji.get('heart_eyes')
        },
        Duration: {
            type: 'number',
            message: LuisActions.BuiltInTypes.Number,
            message: 'For how many days are you planning to leave? (1 Min - Max 15)' +emoji.get('thinking_face')
        },
        MaxPrice: {
            type: 'number',
            builtInType: LuisActions.BuiltInTypes.Number,
            optional: true
        }
    },
    fulfill: function(parameters, callback){
        let duration = parameters.Duration;
        let maxPrice = parameters.MaxPrice;
        reqPro({
            url: util.format('https://api.sandbox.amadeus.com/v1.2/airports/autocomplete?apikey=%s&term=%s',
            TravelInnovationKey, encodeURIComponent(parameters.Place),
        ),
        json: true,
        }).then(function (data){
            if(data.error){
                callback('Woah.. this gotta be a first. i didn\'t find any results' + emoji.get('sweat_smile'));
            } else {
                reqPro({
                    url: util.format('https://api.sandbox.amadeus.com/v1.2/flights/inspiration-search?apikey=%s&origin=%s&duration=%s&max_price=%s',
                TravelInnovationKey, encodeURIComponent(data[0].value), encodeURIComponent(duration), 
                encodeURIComponent(parameters.MaxPrice) || '4000' ),
                 json: true
                }).then(function(data){
                    if(data.error){
                        callback('Im sorry, i didn\'t find any results for your place' +emoji.get('persevere'));
                    } else {
                        let cards= [];
                        for(let i = 0;i<= 10; i++){
                            cards.push({
                                currency: data.currency,
                                destination: data.results[i].destination,
                                departure: data.results[i].departure_date,
                                arrival: data.results[i].return_date,
                                price: data.results[i].price,
                                airline: data.results[i].airline
                            })
                        callback(cards.map(advicesHelper));
                        }
                    }
                })
                let names =[]; 
                for(let i = 0 ; i<6;i++){
                    names.push({
                        names: data[i].label
                    })
                   callback(util.format(names));
                }
            }
        })
    }
};

//Export the Actions
module.exports= TravelAdvicesAction;

//The Advices helper to send to the aisha.js
function advicesHelper(data){
    new builder.ThumbnailCard(data) 
        .title(data.destination)
        .subtitle(dateFormat(data.departure, 'dd/mm/yy') + " " + dateFormat(data.arrival, 'dd/mm/yy'))
        .text('Airline: ' +data.airline,+" "+ data.currency +": " + data.price )
        .image('https://pbs.twimg.com/media/CUMA57FWcAAnRXz.jpg')
}