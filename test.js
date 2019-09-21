const hue = require('./hue');

//console.log(hue().oauth2.getOauthLink('NVzkeUdh9NXCq9c45j3VPJRsO2CeAinT'));
 
hue().oauth2.getToken('NVzkeUdh9NXCq9c45j3VPJRsO2CeAinT', 'acbx0OjLY6fOOy7U', 'Xsm8rJGG')
.then(token => console.log(token));