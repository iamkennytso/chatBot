const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow');
require('dotenv').config();

let app = express();
// app.use(express.static(__dirname + '/../build'))
app.use(bodyParser.json())
const port = 5001;
app.listen(port, ()=> console.log(`(>'.')> listening on ${port}`));

app.post ('/sendMessage', async (request, response) => {

  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath('testdiaflow-cffb8', request.body.sessionId);
  const dialogFlowRequest = {
    session: sessionPath,
    queryInput: {
      text: {
        text: request.body.newMessage.messageContent,
        languageCode: 'en-US',
      }
    }
  };

  try {
    const dialogFlowResponse = await sessionClient.detectIntent(dialogFlowRequest);
    const text = dialogFlowResponse[0].queryResult.fulfillmentMessages.find(message => message.message === 'text').text.text[0];
    const card = dialogFlowResponse[0].queryResult.fulfillmentMessages.find(message => message.message === 'card');
    response.send({
      text: {
        senderIsHuman: false,
        messageContent: text,
        sentUtcTime: new Date().getTime(),
      },
      card: card &&
      {
        senderIsHuman: false,
        messageContent: card.card,
        sentUtcTime: new Date().getTime(),
      },
  });
  } catch (err) {
    console.error(err);
    response.send({
      senderIsHuman: false,
      messageContent: 'An Error occured, please check your connection!',
      sentUtcTime: new Date().getTime(),
    });
  }
})