# A.I.S.H.A Travel chatbot Dissertation 2017

This is the dissertation project for UTM 2017, created by
Agneysh Mathura. It is a chatbot that will search for hotels, flights, airport codes, the weather in locations and finally the time in the locations. It has been written in NodeJs and uses API's like APIXU and AMADEUS.

### Prerequisites

The minimum prerequisites to run this project are namely:
* Latest Node.js with NPM. Download it from [here](https://nodejs.org/en/download/).
* The Bot Framework Emulator. To install the Bot Framework Emulator, download it from [here](https://emulator.botframework.com/). Please refer to [this documentation article](https://github.com/microsoft/botframework-emulator/wiki/Getting-Started) to know more about the Bot Framework Emulator.
* **[Recommended]** Visual Studio Code for IntelliSense and debugging, download it from [here](https://code.visualstudio.com/) for free.

### LUIS
Luis is the short term for Language Understanding Intelligent System. The homepage is www.luis.ai , and log in. The application already contains a model for the luis and has the required intents needed and the entities that will make it work smoothly.
No changes required. [Training](https://www.microsoft.com/cognitive-services/en-us/LUIS-api/documentation/Train-Test) and [Publishing](https://www.microsoft.com/cognitive-services/en-us/LUIS-api/documentation/PublishApp) needs to be done on a regular basis to enable a better performance from the bot.

If you are planning to change the LUIS model, edit the ./env file and update the `LUIS_MODEL_URL` variable with your's Model URL.

#### Where to find the Model URL

In the LUIS application's dashboard, click the "Publish App" button in the right side bar, select an Endpoint Key and then click the "Publish" button. After a couple of moments, you will see a url that makes your models available as a web service.

### Run The Project
* Open the folder in visual studio code.
* Use the shortcuts CTRL + LSHIFT + ` to open up a terminal
* The address of the folder should already be in the terminal,
if it is not, navigate to the folder aisha
* Do npm install - this will install all the required packages by the project.
* Enter the command : npm - install nodemon
* Enter the command : nodemon aisha.js
* Open bot-framework emulator
* Select the URL to: http://localhost:3978/api/messages
* Leave the Microsoft APP ID and Password Empty and click connect

### BOT Scenarios
The chatbot supports these scenarios.

#### Scenario #1 : Switch from an Action to a new Action
While the user is filling a parameter for the current action, the user can provide an input that will trigger the execution of a different action, which is related to it but the intent would be different.

A simple example would be :
User is changing his mind (context switching)

````
User: Find me a hotel in Vienna

--- The above would trigger the intent FindHotels with Vienna as the location entity

Aisha: On which date do you want to check-In?
User: Today
Aisha: When are you checking out?
User: I changed my mind, Find flights to Bern

--- This would trigger the intent `FindFlight` with Bern
as location entity. The FindHotel progression is discarded

Aisha: What\'s your departure date?
````

#### Scenario #2 : Trigger a Contextual Action within a valid Context

While filling a parameter for the current action, the user can provide an input that will trigger a contextual action that makes sense to execute it in the context of the current action.

A simple example would be:
A user changing the parameters he already answered

````
Bot: What do you want to do?
User: Find me a hotel in Miami                    

 --- This would trigger a new `FindHotel` intent with Miami as Location entity

Bot: When do you want to check-in?
User: Today
Bot: When do you want to check-out?
User: Sorry, change the checkin date to tomorrow    

--- This would trigger a `ChangeHotelCheckin` intent with tomorrow as date (but will execute within the context of `FindHotel` and will update its check-in date previously set)

Bot: Ok, I changed the check-in date to tomorrow
Bot: When do you want to check-out?
````

#### Scenario #3 : Trigger a Contextual Action with no previous Context (ie. from scratch)

The user can provide an input that will trigger a contextual action (with no current context). The bot supports this scenario by providing a way to instantiate the contexts chain for it (ie. the chain of parent actions that provides will provide the whole context), and finally executes the request.

Example shows an user changing a check-in date within its reservation (stored in a booking system) 

````
User: Please change my check-in date to tomorrow
Bot: Ok, I changed the check-in date to tomorrow    

-- This triggered the `ChangeHotelCheckin` intent which should run in the context of the `FindHotel` action (so main action also is instanced)

Bot: I changed you reservation in Madrid from 03/25 to 03/27    

-- The required parameters of the main context are iterated until it can call the action fulfillment
````

### Code Highlights

As said, actions are objects that you define to fulfill a LUIS intent once it has been recognized by LUIS service. Each action would likely be mapped to one intent (although you can map an action to several intents if your domain would required it), and their models contain typed members (properties) that will be used to map entity values recognized within the intent by LUIS service.

As an example, you might have defined a `GetWeatherInPlace` intent within your LUIS app, and that intent would likely have a mandatory entity which is the `Place` you are requiring the weather information for. In order to fulfill that requirement, you would have an action object that will map to that intent, and its model will have a mandatory `string` property for the `Place` entity. The action is responsible for fulfilling the intent by using the appropiate weather service to get the required information.

In addition, you can define contextual actions that ran in the context of a parent action. You can have a `FindHotels` action and an additional contextual action for updating the check-in date. Actions and contextual actions both map to intents within your LUIS service, but the only difference is how you represent them in application and the behavior you want them to achieve. For this, as you will see, the framework has particular interfaces that allows you define actions or contextual actions. 

### More Information

To get more information about  Bot Builder for Node and LUIS please review the following resources:
* [Bot Builder for Node.js Reference](https://docs.microsoft.com/en-us/bot-framework/nodejs/)
* [Understanding Natural Language](https://docs.botframework.com/en-us/node/builder/guides/understanding-natural-language/)
* [LUIS Help Docs](https://www.luis.ai/Help/)
* [Cognitive Services Documentation](https://www.microsoft.com/cognitive-services/en-us/luis-api/documentation/home)
* [IntentDialog](https://docs.botframework.com/en-us/node/builder/chat/IntentDialog/)
* [LuisRecognizer](https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.luisrecognizer.html)
* [EntityRecognizer](https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.entityrecognizer.html)
