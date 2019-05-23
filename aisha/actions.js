/*/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    ___   ____________________  _   _______
                                   /   | / ____/_  __/  _/ __ \/ | / / ___/
                                  / /| |/ /     / /  / // / / /  |/ /\__ \ 
                                 / ___ / /___  / / _/ // /_/ / /|  /___/ / 
                                /_/  |_\____/ /_/ /___/\____/_/ |_//____/  
                                                                                                        
///////////////////////////////////////////////////////////////////////////////////////////////////////////

Export the other in order to use them in aisha.js. In this way it enables to keep the code clean and
maintain the seperation of concerns. Repository Pattern is used.

/////////////////////////////////////////////////////////////////////////////////////////////////////////*/

module.exports = []
.concat(require('./time'))
.concat(require('./hotels'))
.concat(require('./weather'))
.concat(require('./flights'))
.concat(require('./traveladvices'))
.concat(require('./smalltalk'))
.concat(require('./airports'));