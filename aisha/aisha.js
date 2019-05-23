// Loading the environment variables from the .env file
require('dotenv-extended').load();

// Loading the dependencies of the project from the package.json file
let builder = require('botbuilder')
let restify = require('restify')
let LuisActions = require('../core');
let LuisModelUrl = process.env.Luis_Model_Url;
let emoji = require('node-emoji');
let actions = require('./actions');

/*/////////////////////////////////////////////////////////////////////////////////////////////////////////                               
                                ____   ____  ______   _____  ______ ______ __  __ ____ 
                              / __ ) / __ \/_  __/  / ___/ / ____//_  __// / / // __ \
                             / __  |/ / / / / /     \__ \ / __/    / /  / / / // /_/ /
                            / /_/ // /_/ / / /     ___/ // /___   / /  / /_/ // ____/ 
                           /_____/ \____/ /_/     /____//_____/  /_/   \____//_/      
                                                           
/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

// Setup Restify Server to listen on port 3978
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Creating the chat bot and listen to messages
let connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                        ___    _________ __  _____ 
                                       /   |  /  _/ ___// / / /   |
                                      / /| |  / / \__ \/ /_/ / /| |
                                     / ___ |_/ / ___/ / __  / ___ |
                                    /_/  |_/___//____/_/ /_/_/  |_|

/////////////////////////////////////////////////////////////////////////////////////////////////////////*/
//Create the bot and intialize the LUIS model for further use in the project.
let bot = new builder.UniversalBot(connector);
let recognizer = new builder.LuisRecognizer(LuisModelUrl);
let intentDialog = bot.dialog('/', new builder.IntentDialog({ recognizers: [recognizer] })
    .onDefault(DefaultReplyHandler));

// This is the default handler it will reply with the message in case anything goes wrong
function DefaultReplyHandler(session){
    session.endDialog(
        'Im so sorry'+ emoji.get('sweat_smile')+'i did not understand what you just said.'
        +' Here are some things you can try to ask me, Travel advices, Search for a hotel in Venice, Search for Flights to Miami,'
        +' or search the airports in Bern'
    )
}

// This is the fulfill Handler, it will do the actions stated when the success scenario has been met
function fulfillReplyHandler(session, actionModel){
    console.log('Action Binding: "'+ actionModel.intentName +'" completed Successfully', actionModel);
    if (actionModel.intentName =='FindFlights' || actionModel.intentName =='FindHotels'
        || actionModel.intentName=='FindHotelNearAirport'|| actionModel.intentName=='TravelAdvices'){
        session.send('Brb this might take a few mins....');
        let msg = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(actionModel.result);
        session.endDialog(msg);
    } else if(actionModel.intentName =='Introduction'||actionModel.intentName =='Help'
    ||actionModel.intentName =='Name'||actionModel.intentName =='Creator') {
        session.endDialog(actionModel.result.toString());
    } else{
        session.send('Brb this might take a few mins....');
        session.endDialog(actionModel.result.toString());
    }
    
}

//Bind the LuisActions to the default handlers created above so as to get a better architecture
LuisActions.bindToBotDialog(bot, intentDialog, LuisModelUrl, actions, {
    defaultReply: DefaultReplyHandler,
    fulfillReply: fulfillReplyHandler,
    onContextCreation: onContextCreationHandler
});

function onContextCreationHandler(action, actionModel, next, session){

    // if there is no date in the Find Hotels or FindFlights it will change it to the current one 
    if (action.intentName ==='FindHotels'){
        if(!actionModel.parameters.Checkin){
            actionModel.parameters.Checkin = new Date();
        }

        if(!actionModel.parameters.Checkout){
            actionModel.parameters.Checkout = new Date();
            actionModel.parameters.Checkout.setDate(actionModel.parameters.Checkout.getDate() + 3 );
        }
    
    next();
    }   

    if (action.intentName ==='FindFlights'){
        if(!actionModel.parameters.Departure){
            actionModel.parameters.Departure = new Date();
        }

        if(!actionModel.parameters.Arrival){
            actionModel.parameters.Arrival = new Date();
            actionModel.parameters.Arrival.setDate(actionModel.parameters.Checkout.getDate() + 1 );
        }
        next();
    }
}