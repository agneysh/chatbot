/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
                            ___    ________  ____  ____  ____ ___________
                           /   |  /  _/ __ \/ __ \/ __ \/ __ /_  __/ ___/
                          / /| |  / // /_/ / /_/ / / / / /_/ // /  \__ \ 
                         / ___ |_/ // _, _/ ____/ /_/ / _, _// /  ___/ / 
                        /_/  |_/___/_/ |_/_/    \____/_/ |_|/_/  /____/  
                                                 
/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

//Load the libraries needed and the dependencies
let _ = require('lodash');
let fs = require('fs');
let util = require('util');
let JsonPath = require('jsonpath');
let emoji = require('node-emoji');
let reqPro = require('request-promise');
let Airports = require('./airports.json');

//Get the API key from the .env file
let TravelInnovationKey = process.env.TRAVEL_INNOVATION_KEY;

//Declare the Actions
let FindAirportCodeAction = {
    intentName: 'FindAirportByCode',
    friendlyName: 'Find Airport by Code',
    confirmOnContextSwitch: 'false',
    schema: {
        Code: { type: 'string', message: 'Searching for the Airport location. Can i have the Airport code please? ' +emoji.get('sweat_smile')}
    },
    fulfill: function (parameters, callback){
        let airportCode= parameters.Code.toUpperCase();
        let airport =_.first(JsonPath.query(Airports, '$.Continents[*].Countries[*].Cities[*].Airports[?(@.Id === "' + airportCode + '")]'));
        if(airport){
            let countryId = airport.CountryId;
            let cityId = airport.CityId;
            let country = _.first(JsonPath.query(Airports, '$.Continents[*].Countries[?(@.Id === "' + countryId + '")]'));
            let city = _.first(JsonPath.query(Airports, '$.Continents[*].Countries[*].Cities[?(@.Id === "' + cityId + '")]'));
            callback(util.format('%s corresponds to "%s" which is located in %s, %s [%s]',
                parameters.Code.toUpperCase(), airport.Name, city.Name, country.Name, airport.Location));
        } else {
            callback('Airport CODE not found, please verify the code and try again!'+emoji.get('confused'));
        }
    }
};

let FindAirportInLocationAction = {
    intentName: 'FindAirportByLocation',
    friendlyName: 'Find Airport by Location',
    confirmOnContextSwitch: 'false',
    schema: {
        Place: { type: 'string', message: 'Searching for Airport. In Which location?' +emoji.get('thinking_face')}
    },
    fulfill: function(parameters, callback){
         reqPro({
             url: util.format('https://api.sandbox.amadeus.com/v1.2/airports/autocomplete?apikey=%s&term=%s',
             TravelInnovationKey, encodeURIComponent(parameters.Place)),
         json: true,
         }).then(function (data){
             if(data.error){
                 callback('Woah.. this gotta be a first. i didn\'t find any results'+emoji.get('sweat_smile'));
             } else {
                 let names =[]; 
                 for(let i =1;i<6;i++){
                     names.push({
                         names: data[i].label
                     })
                    callback(util.format(names));
                 }
             }
         })
     }
 };
 
//Export the modules
module.exports = [
    FindAirportCodeAction,
    FindAirportInLocationAction
];