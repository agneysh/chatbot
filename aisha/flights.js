/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
                            ________    ____________  _____________
                           / ____/ /   /  _/ ____/ / / /_  __/ ___/
                          / /_  / /    / // / __/ /_/ / / /  \__ \ 
                         / __/ / /____/ // /_/ / __  / / /  ___/ / 
                        /_/   /_____/___/\____/_/ /_/ /_/  /____/  
                                           
/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

//Load the libraries needed and the dependencies
let util= require('util');
let LuisActions = require('../core');
let reqPro = require('request-promise');
let dateFormat = require('dateformat');
let builder = require('botbuilder');
let emoji = require('node-emoji');

//Get the API KEY
let TravelInnovationKey = process.env.TRAVEL_INNOVATION_KEY;

//The Actions
let FindFlightsAction = {
    intentName: 'FindFlights',
    friendlyName: 'Find Flight Details',
    confirmOnContextSwitch: true,

    schema:{
        Place:{
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.Geography.City,
            message: 'Where do you want to go? Please provide the airport code' + emoji.get('sweat_smile') +
            'In case you don\'t know the code, ask for e.g: what\'s the airport code of New York? ' + emoji.get('nerd_face')
        },
        Origin:{
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.Geography.City,
            message: 'Where are you departing from? Please provide the airport code' + emoji.get('nerd_face')

        },
        Departure: {
            type: 'date',
            builtInType: LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true,
            message: 'What\'s your departure date? (In this format: yyyy mm dd)' + emoji.get('thinking_face')
        },
        Arrival: {
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true,
            message: 'When are you coming back? (In this format: yyyy mm dd)' + emoji.get('thinking_face')
        },
        TicketType:{
            type: 'string',
            optional: true
        }
    },
    fulfill: function (parameters, callback){
        reqPro({ 
            url: util.format('https://api.sandbox.amadeus.com/v1.2/flights/extensive-search?origin=%s&destination=%s&departure_date=%s&return_date=%s&number_of_results=5&apikey=%s',
                encodeURIComponent(parameters.Origin), encodeURIComponent(parameters.Place), encodeURIComponent(dateFormat(parameters.Departure, "yyyy-mm-dd")),
                encodeURIComponent(dateFormat(parameters.Arrival, "yyyy-mm-dd")), TravelInnovationKey),
            json: true,
        }).then(function (data){
            if(data.error){
                callback('Woah.. this gotta be a first. i didn\'t find any results concerning ' + parameters.origin + ' to ' + parameters.Place +emoji.get('confused'));
            } else {
                let cards =[];
                for(let i=0;i<5;i++){
                cards.push({
                    origin: data.origin,
                    currency: data.currency,
                    destination: data.results[i].destination,
                    destinationName: findAirportName(origin),
                    originName:findAirportName(origin),
                    price: data.results[i].price,
                    departure: data.results[i].departure_date,
                    arrival: data.results[i].return_date,
                    airline: data.results[i].airline
                })
               callback(cards.map(flightsHelper));
                }
            }
        }).catch(console.error);
    }
};

let FindFlightsAction_ChangeLocation= {
    intentName: 'FindFlights-ChangeLocation',
    friendlyName: 'Change the Flight Destination',
    parentAction: FindFlightsAction,
    canExecuteWithoutContenxt: true,
    schema: {
        Place: {
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.Geography.City,
            message: 'Changing Destination, Please provide a new Destination' +emoji.get('grinning')
        }
    },
    fulfill: function( parameters, callback, parentContextParameters){
        //Assign the new destination provided by the user to the FindFlightsAction
        parentContextParameters.Place= parameters.Place;
        callback('Destination changed successfully to '+ parameters.Place + emoji.get('nerd_face'));
    }
};

let FindFlightsAction_ChangeOrigin= {
    intentName: 'FindFlights-ChangeOrigin',
    friendlyName: 'Change the Flight Origin',
    parentAction: FindFlightsAction,
    canExecuteWithoutContenxt: true,
    schema: {
        Place: {
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.Geography.City,
            message: 'Changing Departure Airport, Where will you be taking the plane?' +emoji.get('thinking_face')
        }
    },
    fulfill: function( parameters, callback, parentContextParameters){
        //Assign the new destination provided by the user to the FindFlightsAction
        parentContextParameters.Place= parameters.Place;
        callback('Destination successfully changed to '+ emoji.get('nerd_face'));
    }
};

let FindFlightsAction_ChangeDeparture = {
    intentName: 'FindFlightsAction-ChangeDeparture',
    friendlyName: 'Change the flight departure',
    parentAction: FindFlightsAction,
    canExecuteWithoutContenxt: false,
    schema: {
        Departure: {
            type: 'date',
            builtInType: LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true,
            message: 'Changing the Departure Date, Please Provide a new Date'+emoji.get('nerd_face')
        }
    },
    fulfill: function( parameters, callback, parentContextParameters){
        parentContextParameters.Departure = parameters.Departure;
        callback('Departure date changed to '+ parameters.Departure);
    }
};

let FindFlightsAction_ChangeArrival = {
    intentName: 'FindFlightsAction-ChangeArrival',
    friendlyName: 'Change the flight arrival',
    parentAction: FindFlightsAction,
    canExecuteWithoutContenxt: false,
    schema: {
        Arrival: {
            type: 'date',
            builtInType: LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true,
            message: 'Changing the Arrival Date, Please Provide a new Date'+emoji.get('nerd_face')
        }
    },
    fulfill: function( parameters, callback, parentContextParameters){
        parentContextParameters.Arrival = parameters.Arrival;
        callback('Arrival date changed to '+ parameters.Arrival);
    }
};

//Export the different actions
module.exports= [
    FindFlightsAction,
    FindFlightsAction_ChangeLocation,
    FindFlightsAction_ChangeOrigin,
    FindFlightsAction_ChangeDeparture,
    FindFlightsAction_ChangeArrival
];

function findAirportName(code, callback){
    let airportCode= code;
    let airport =_.first(JsonPath.query(Airports, '$.Continents[*].Countries[*].Cities[*].Airports[?(@.Id === "' + airportCode + '")]'));
    if(airport){
        let countryId = airport.CountryId;
        let cityId = airport.CityId;
        let country = _.first(JsonPath.query(Airports, '$.Continents[*].Countries[?(@.Id === "' + countryId + '")]'));
        let city = _.first(JsonPath.query(Airports, '$.Continents[*].Countries[*].Cities[?(@.Id === "' + cityId + '")]'));
        
        return (airport.Name);
    }  
  }

// The helper to send the card to the Aisha.js from the callback method.
function flightsHelper(data){
  return {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'version':'1.0',
            'type': 'AdaptiveCard',
            'body': [
                {
                    "type": "TextBlock",
                    "text": dateFormat(data.departure , "dddd, mmmm dS, yyyy"),
                    "weight": "bolder",
                    "spacing": "none"
                },
                {
                    "type": "ColumnSet",
                    "separator": true,
                    "columns": [
                        {
                            "type": "Column",
                            "width": 1,
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "text": data.originName,
                                    "isSubtle": true
                                },
                                {
                                    "type": "TextBlock",
                                    "size": "extraLarge",
                                    "color": "accent",
                                    "text": data.origin,
                                    "spacing": "none"
                                }
                            ]
                        },
                        {
                            "type": "Column",
                            "width": "auto",
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "text": "&nbsp;"
                                },
                                {
                                    "type": "Image",
                                    "url": "http://messagecardplayground.azurewebsites.net/assets/airplane.png",
                                    "size": "small",
                                    "spacing": "none"
                                }
                            ]
                        },
                        {
                            "type": "Column",
                            "width": 1,
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "horizontalAlignment": "right",
                                    "text": data.destinationName,
                                    "isSubtle": true
                                },
                                {
                                    "type": "TextBlock",
                                    "horizontalAlignment": "right",
                                    "size": "extraLarge",
                                    "color": "accent",
                                    "text": data.destination,
                                    "spacing": "none"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "TextBlock",
                    "text": "Non-Stop   Airline: " + data.airline,
                    "weight": "bolder",
                    "spacing": "medium"
                },
                {
                    "type": "TextBlock",
                    "text": dateFormat(data.arrival , "dddd, mmmm dS, yyyy"),
                    "weight": "bolder",
                    "spacing": "none"
                },
                {
                    "type": "ColumnSet",
                    "separator": true,
                    "columns": [
                        {
                            "type": "Column",
                            "width": 1,
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "text": data.destinationName,
                                    "isSubtle": true
                                },
                                {
                                    "type": "TextBlock",
                                    "size": "extraLarge",
                                    "color": "accent",
                                    "text": data.destination,
                                    "spacing": "none"
                                }
                            ]
                        },
                        {
                            "type": "Column",
                            "width": "auto",
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "text": "&nbsp;"
                                },
                                {
                                    "type": "Image",
                                    "url": "http://messagecardplayground.azurewebsites.net/assets/airplane.png",
                                    "size": "small",
                                    "spacing": "none"
                                }
                            ]
                        },
                        {
                            "type": "Column",
                            "width": 1,
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "horizontalAlignment": "right",
                                    "text": data.originName,
                                    "isSubtle": true
                                },
                                {
                                    "type": "TextBlock",
                                    "topSpacing": "none",
                                    "horizontalAlignment": "right",
                                    "size": "extraLarge",
                                    "color": "accent",
                                    "text": data.origin,
                                    "spacing": "none"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "ColumnSet",
                    "spacing": "medium",
                    "columns": [
                        {
                            "type": "Column",
                            "width": "1",
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "text": "Total",
                                    "size": "medium",
                                    "isSubtle": true
                                }
                            ]
                        },
                        {
                            "type": "Column",
                            "width": 1,
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "horizontalAlignment": "right",
                                    "text": data.currency+ ' ' + data.price,
                                    "size": "medium",
                                    "weight": "bolder"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
} 