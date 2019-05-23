/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                   __  ______ ______________   _____
                                  / / / / __ /_  __/ ____/ /  / ___/
                                 / /_/ / / / // / / __/ / /   \__ \ 
                                / __  / /_/ // / / /___/ /______/ / 
                               /_/ /_/\____//_/ /_____/_____/____/  
                                                                    
/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

//Load the libraries needed and the dependencies
let util = require('util');
let LuisActions = require('../core');
let dateFormat = require('dateformat');
let emoji = require('node-emoji');
let reqPro = require('request-promise');
let builder = require('botbuilder');

//Get the API KEYS
let TravelInnovationKey = process.env.TRAVEL_INNOVATION_KEY;
let ApixuApiKey = process.env.APIXU_API_KEY;

//THE ACTIONS
let FindHotelsAction = {
    intentName: 'FindHotels',
    friendlyName: 'Find Hotel',
    confirmOnContextSwitch: true,

    schema: {
        Place: {
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.Geography.City,
            message: 'Where do you want me to find a hotel? e.g In Paris, or Vienna '+ emoji.get('thinking_face')
        },
        Checkin: {
            type: 'date',
            builtInType: LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true, 
            message: 'On which date do you want to check-In? (In this format: yyyy mm dd)' +emoji.get('hotel')+emoji.get('nerd_face')
        },
        Checkout: {
            type: 'date',
            builtInType:LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true,
            message: 'When are you checking out? (In this format: yyyy mm dd)' +emoji.get('hotel')+emoji.get('nerd_face')
        }
    },
    fulfill: function(parameters, callback){
        let checkin = parameters.Checkin;
        let checkout = parameters.Checkout;
        reqPro({
            url: util.format('http://api.apixu.com/v1/current.json?key=%s&q=%s', ApixuApiKey, encodeURIComponent(parameters.Place)),
            json: true
        }).then(function(data){
            if(data.error){
                callback('Oh no!'+emoji.get('pensive') +', i didn\'nt find any results. Please try again'+ emoji.get('sweat_smile'));
            } else {
                reqPro({
                    url: util.format('https://api.sandbox.amadeus.com/v1.2/hotels/search-circle?apikey=%s&latitude=%s&longitude=%s&radius=100&check_in=%s&check_out=%s&max_rate=4000&number_of_results=50',
                     TravelInnovationKey, encodeURIComponent(data.location.lat), encodeURIComponent(data.location.lon),encodeURIComponent(dateFormat(checkin, 'yyyy-mm-dd')),
                      encodeURIComponent(dateFormat(checkout, 'yyyy-mm-dd'))),
                    json: true
                }).then(function(data){
                    if(data.error){
                        callback('Oh no!'+emoji.get('pensive') +', i didn\'nt find any results. Please try again'+ emoji.get('sweat_smile'));
                    } else {
                        let cards= [];
                        for(let i=0 ;i<10;i++) {
                            cards.push({
                                hotelName: data.results[i].property_name,
                                description: data.results[i].marketing_text,
                                address: data.results[i].address.line1 + " " +data.results[i].address.city + " " + data.results[i].address.country,
                                price : data.results[i].total_price.amount,
                                currency: data.results[i].total_price.currency,
                                contact: data.results[i].contacts[0].detail ,
                                fax: data.results[i].contacts[1].detail ,
                         //       url: data.results[i].contacts[2].detail,
                                startDate: dateFormat(checkin,'dd/mm/yy'),
                                endDate: dateFormat(checkout,'dd/mm/yy'),
                                bookingCode: data.results[i].rooms[0].booking_code,
                                image: data.results[i].image = 'https://dallasnews.imgix.net/1498437629-hotels.png?w=1200&h=630&format=jpg&crop=faces&fit=crop'
                            })
                            callback(cards.map(hotelsHelper));
                        }
                    }
                 }).catch(console.error)
            }
        }).catch(console.error)
    }
};

let FindHotelsNearAirportAction = {
    intentName: 'FindHotelsNearAirport',
    friendlyName: 'Find Hotel near the airport',
    confirmOnContextSwitch: true,

    schema: {
        Place: {
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.Geography.City,
            message: 'Can i have the airport code?' +emoji.get('sweat_smile')
        },
        Checkin: {
            type: 'date',
            builtInType: LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true, 
            message: 'On which date do you want to check-In? (In this format: yyyy mm dd)' +emoji.get('hotel')+emoji.get('nerd_face')
        },
        Checkout: {
            type: 'date',
            builtInType:LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true,
            message: 'When are you checking out? (In this format: yyyy mm dd)' +emoji.get('hotel')+emoji.get('nerd_face')
        }
    },
    fulfill: function(parameters, callback){
       let checkin = dateFormat(parameters.Checkin, 'dd/mm/yy');
       let checkout = dateFormat(parameters.Checkout, 'dd/mm/yy');
        reqPro({
            url: util.format('https://api.sandbox.amadeus.com/v1.2/hotels/search-airport?apikey=%s&location=%s&check_in=%s&check_out=%s&number_of_results=2',
            TravelInnovationKey, encodeURIComponent(parameters.Place), encodeURIComponent(dateFormat(parameters.Checkin,"yyyy-mm-dd")), 
            encodeURIComponent(dateFormat(parameters.Checkout,"yyyy-mm-dd")),
        ),
        json: true,
        }).then(function (data){
            if(data.error){
                callback('Woah.. this gotta be a first. i didn\'t find any results concerning ' + parameters.origin + ' to ' + parameters.Place +emoji.get('confused'));
            } else {
                let url,otherDetails;
                let cards = [];
                for(let i =0;i<5;i++) {
                        cards.push({
                                hotelName: data.results[i].property_name,
                                description: data.results[i].marketing_text,
                                address: data.results[i].address.line1 + " " +data.results[i].address.city + " " + data.results[i].address.country,
                                price : data.results[i].total_price.amount,
                                currency: data.results[i].total_price.currency,
                                contact: data.results[i].contacts[0].detail ,
                                fax: data.results[i].contacts[1].detail ,
                                url: data.results[i].contacts[2].detail,
                                startDate: checkin,
                                endDate: checkout,
                                bookingCode: data.results[i].rooms[0].booking_code,
                                details: data.results[i].rooms[i].descriptions[0]+", "+ data.results[i].rooms[i].descriptions[1],
                                image: data.results[i].image = 'https://dallasnews.imgix.net/1498437629-hotels.png?w=1200&h=630&format=jpg&crop=faces&fit=crop'
                            })
                    callback(cards.map(hotelsHelper));
                }
            }
        })
    }
};

    // Contextual action that changes location for the FindHotelsAction
let FindHotelsAction_ChangeLocation = {
    intentName: 'FindHotels-ChangeLocation',
    friendlyName: 'Change the Hotel Location',
    parentAction: FindHotelsAction, FindHotelsNearAirportAction,
    canExecuteWithoutContext: true,         // true by default
    schema: {
        Place: {
            type: 'string',
            builtInType: LuisActions.BuiltInTypes.Geography.City,
            message: 'Changing your location.'+emoji.get('thinking_face')+' Please provide a new location for your hotel' +emoji.get('nerd_face')
        }
    },
    fulfill: function (parameters, callback, parentContextParameters) {
        // assign new location to FindHotelsAction
        parentContextParameters.Place = parameters.Place;

        callback('Hotel location changed to ' + parameters.Place + emoji.get('grinning'));
    }
};

    // Contextual action that changes Checkin for the FindHotelsAction
let FindHotelsAction_ChangeCheckin = {
    intentName: 'FindHotels-ChangeCheckin',
    friendlyName: 'Change the hotel check-in date',
    parentAction: FindHotelsAction, FindHotelsNearAirportAction,
    canExecuteWithoutContext: false,
    schema: {
        Checkin: {
            type: 'date',
            builtInType: LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true, message: 'Changing the checkin date. Please provide the new check-in date' + emoji.get('nerd_face')
        }
    },
    fulfill: function (parameters, callback, parentContextParameters) {
        parentContextParameters.Checkin = parameters.Checkin;
        callback('Hotel check-in date changed to ' + dateFormat(parameters.Checkin , 'yyyy-mm-dd') + emoji.get('grinning'));
    }
};

    // Contextual action that changes CheckOut for the FindHotelsAction
let FindHotelsAction_ChangeCheckout = {
    intentName: 'FindHotels-ChangeCheckout',
    friendlyName: 'Change the hotel check-out date',
    parentAction: FindHotelsAction, FindHotelsNearAirportAction,
    canExecuteWithoutContext: false,
    schema: {
        Checkout: {
            type: 'date',
            builtInType: LuisActions.BuiltInTypes.DateTime.Date,
            validDate: true, message: 'Changing the checkout date. Please provide the new check-out date' +emoji.get('nerd_face')
        }
    },
    fulfill: function (parameters, callback, parentContextParameters) {
        parentContextParameters.Checkout = parameters.Checkout;
        callback('Hotel check-out date changed to ' + dateFormat(parameters.Checkout, 'yyyy-mm-dd')+ emoji.get('grinning'));
    }
};

//Export the actions
module.exports = [
    FindHotelsAction,
    FindHotelsNearAirportAction,
    FindHotelsAction_ChangeLocation,
    FindHotelsAction_ChangeCheckin,
    FindHotelsAction_ChangeCheckout
];

//The helper that will send the card to aisha.js through the callback
function hotelsHelper(data){
        return {
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "type": "AdaptiveCard",
                "version": "1.0",
                "body": [
                    {
                        "type": "Container",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": data.hotelName,
                                "weight": "bolder",
                                "size": "medium"
                            },
                            {
                                "type": "ColumnSet",
                                "columns": [
                                    {
                                        "type": "Column",
                                        "width": "auto",
                                        "items": [
                                            {
                                                "type": "Image",
                                                "url": data.image,
                                                "size": "small"
                                                
                                            }
                                        ]
                                    },
                                    {
                                        "type": "Column",
                                        "width": "stretch",
                                        "items": [
                                            {
                                                "type": "TextBlock",
                                                "text": "Booking Code",
                                                "weight": "bolder",
                                                "wrap": true
                                            },
                                            {
                                                "type": "TextBlock",
                                                "spacing": "none",
                                                "text": data.bookingCode,
                                                "isSubtle": true,
                                                "wrap": true
                                            },
                                            {
                                                "type": "TextBlock",
                                                "text": "Check-in",
                                                "weight": "bolder",
                                                "wrap": true
                                            },
                                            {
                                                "type": "TextBlock",
                                                "spacing": "none",
                                                "text": data.startDate,
                                                "isSubtle": true,
                                                "wrap": true
                                            },
                                            {
                                                "type": "TextBlock",
                                                "text": "Check-out",
                                                "weight": "bolder",
                                                "wrap": true
                                            },
                                            {
                                                "type": "TextBlock",
                                                "spacing": "none",
                                                "text": data.endDate,
                                                "isSubtle": true,
                                                "wrap": true
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": data.description,
                                "wrap": true
                            },
                            {
                                "type": "FactSet",
                                "facts": [
                                    {
                                        "title": "Address:",
                                        "value": data.address
                                    },
                                    {
                                        "title": "Contact:",
                                        "value": data.contact
                                    },
                                    {
                                        "title": "Fax:",
                                        "value": data.fax
                                    },
                                    {
                                        "title": "Total Price:",
                                        "value": data.currency + " " + data.price
                                    }
                                ]
                            }
                        ]
                    }
                ],
            "actions": [
                {
                "type": "Action.OpenUrl",
                "title": 'View',
                "url": data.url
                }
            ]
        }
    }
}