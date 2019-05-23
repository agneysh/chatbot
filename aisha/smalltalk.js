/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
                       _____ __  ______    __    __       _________    __    __ __
                      / ___//  |/  /   |  / /   / /      /_  __/   |  / /   / //_/
                      \__ \/ /|_/ / /| | / /   / /        / / / /| | / /   / ,<   
                     ___/ / /  / / ___ |/ /___/ /___     / / / ___ |/ /___/ /| |  
                    /____/_/  /_/_/  |_/_____/_____/    /_/ /_/  |_/_____/_/ |_|  
                                                                                
/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

let util = require('util');
let emoji = require('node-emoji');

let IntroductionAction = {
    intentName: 'Introduction',
    friendlyName: 'Hello',
    confirmOnContextSwitch: true,
    schema: {
        Text:{
            type: 'string',
            optional: true
        } 
    },
    fulfill: function(parameters, callback){
        callback(util.format('HEY YOU!! I am Aisha. I will try to help you for your travels '+
        'Try asking me: Search Hotels in Prague, Search hotel'+
        ' near CDG, Find Flights to London, or simply Get me out of London - to have travel advices, Whats the time'+
        ' in Paris? or weather in paris?, What are the airports in New york, or give say what is the airport name of'+
        ' MRU and i will give you the name, location of the code' + emoji.get('nerd_face')));
    }
};

let HelpAction= {
    intentName: 'Help',
    friendlyName: 'Help',
    confirmOnContextSwitch: true,
    schema: {
        text:{
            type: 'string',
            message: '',
            optional: true
        } 
    },
    fulfill: function(paramaters, callback){
        callback(util.format('Here are some things your can ask me: Search Hotels in Prague, Search hotel'+
        ' near CDG, Find Flights to London, or simply Get me out of London - to have travel advices, Whats the time'+
        ' in Paris? or whats the weather in paris?, What are the airports in New york, or give say what is the airport name of'+
        ' MRU and i will give you the name, location of the code' +emoji.get('nerd_face')+ 'Hope this Helps'));
    }
};

let NameAction= {
    intentName: 'Name',
    friendlyName: 'Saying the Name to the user',
    confirmOnContextSwitch: true,
    schema: {
        text:{
            type: 'string',
            message: '',
            optional: true
        } 
    },
    fulfill: function(parameters, callback){
        callback(util.format('My Name is A.I.S.H.A, Stands for Another Intelligent System Has Activated. And i\'m not evil..... yet'+emoji.get('smirk')));
    }
};

let CreatorAction= {
    intentName: 'Creator',
    friendlyName: 'Who created you?',
    confirmOnContextSwitch: true,
    schema: {
        text:{
            type: 'string',
            message: '',
            optional: true
        } 
    },
    fulfill: function(parameters, callback){
        callback(util.format('My father is Agneysh Mathura, he is a student of BCNS/15A/FT' +emoji.get('heart_eyes')));
    }
};

module.exports = [
    IntroductionAction,
    HelpAction,
    NameAction,
    CreatorAction
]