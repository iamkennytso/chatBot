const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('dialogflow');
require('dotenv').config();

const app = express();
app.use(bodyParser.json())
const port: number = 5001;
app.listen(port, ()=> console.log(`(>'.')> listening on ${port}`));

interface SendMessageRequest {
  body: {
    newMessage: {
      senderIsHuman: boolean,
      messageContent: string,
      sentUtcTime: number,
    },
  sessionId: string,
  }
}

interface sendMessageDialogFlowResponse {
  responseId: string,
  queryResult: {
    queryText: string,
    parameters: { },
    fulfillmentText: string,
    fulfillmentMessages: [{ }],
    outputContexts?: [{  }],
    intent: {
      name: string,
      displayName: string,
    },
    intentDetectionConfidence: number,
    diagnosticInfo: {
      webhook_latency_ms: number,
    },
    languageCode: string,
  },
  webhookStatus: {
    message: string,
  }
}

interface DialogFlowRequest {
  session: string,
  queryInput: {
    text: {
      text: string,
      languageCode: string,
    }
  }
}

interface Message {
  message: string,
  platform: string,
  card?: Card,
}

interface Card {
  title: string,
  subtitle: string,
  imageUri: string, 
  buttons: [{
    text: string,
    postback: string,
  }]
}

app.post ('/sendMessage', async (request: SendMessageRequest, response) => {
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath: string = sessionClient.sessionPath('testdiaflow-cffb8', request.body.sessionId);
  const dialogFlowRequest: DialogFlowRequest = {
    session: sessionPath,
    queryInput: {
      text: {
        text: request.body.newMessage.messageContent,
        languageCode: 'en-US',
      },
    },
  };

  try {
    const dialogFlowResponse: sendMessageDialogFlowResponse = await sessionClient.detectIntent(dialogFlowRequest);
    const text: Message = dialogFlowResponse[0].queryResult.fulfillmentMessages.find(( message: Message ) => message.message === 'text').text.text[0];
    const card: Message = dialogFlowResponse[0].queryResult.fulfillmentMessages.find(( message: Message ) => message.message === 'card');
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

