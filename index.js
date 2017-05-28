'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;

exports.yourAction = (request, response) => {
    const app = new App({request, response});
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    // Fulfill action business logic
    function responseHandler (app) {
        // Complete your fulfillment logic and send a response
        app.ask('Hello, World!');
    }

    const actionMap = new Map();
    actionMap.set('<API.AI_action_name>', responseHandler);

    app.handleRequest(actionMap);
};