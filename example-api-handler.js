'use strict';

const {APIHandler, APIResponse} = require('gateway-addon');
const manifest = require('./manifest.json');
const application = require('./_app.js');

/**
 * Example API handler.
 */
class ExampleAPIHandler extends APIHandler {
  constructor(addonManager) {
    super(addonManager, manifest.id);
    addonManager.addAPIHandler(this);
  }

  async handleRequest(request) {


    if (request.method == 'POST' && request.path == '/getSensors') {
      let sensors = await application.getSensors();
      console.log(sensors);
      return new APIResponse({
        status: 200,
        contentType: 'application/json',
        content: JSON.stringify(sensors),
      });
    }

    if (request.method == 'POST' && request.path == '/getToken') {
      let token = await application.getToken(request.body.name, request.body.user ,{
        role: 'access_token',
        scope: request.body.scope
      });

      /*
      name
      user
      paylaod : 
            role :
            scope :
      */
      console.log(token);
      return new APIResponse({
        status: 200,
        contentType: 'application/json',
        content: JSON.stringify(token),
      });
    }

    if (request.method == 'POST' && request.path == '/getActiveSensors') {
      let activeSensors = await application.getEnabledApps();
      console.log(activeSensors);
      return new APIResponse({
        status: 200,
        contentType: 'application/json',
        content: JSON.stringify(activeSensors),
      });
    }

    if (request.method == 'POST' && request.path == '/getDesactiveSensors') {
      let disactiveSensors = await application.getDisabledApps();
      console.log(disactiveSensors);
      return new APIResponse({
        status: 200,
        contentType: 'application/json',
        content: JSON.stringify(disactiveSensors),
      });
    }

    if (request.method == 'POST' && request.path == '/activeToDeactive') {
      console.log(request.body.Check1);
      let update = await application.updateEnableToDisable(request.body.Check1);
      return new APIResponse({
        status: 200,
        contentType: 'application/json',
        content: JSON.stringify('OK'),
      });
    }

    if (request.method == 'POST' && request.path == '/deactiveToActive') {
      console.log(request.body.Check2);
      let update = await application.updateDisableToEnable(request.body.Check2);
      return new APIResponse({
        status: 200,
        contentType: 'application/json',
        content: JSON.stringify('OK'),
      });
    }
  
  }
}

module.exports = ExampleAPIHandler;
