const express = require('express')
const bodyParser = require('body-parser')
const dialogflow = require('dialogflow')
const uuid = require('uuid')
require('dotenv').config()

let app = express();
app.use(express.static(__dirname + '/../build'))
app.use(bodyParser.json())
const port = 1337;
app.listen(port, ()=> console.log(`(>'.')> listening on ${port}`))

app.post ('/sendMessage', async (request, response) => {
  console.log('hit')
  const sessionId = uuid.v4()
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath('testdiaflow-cffb8', sessionId)
  const dialogFlowRequest = {
    session: sessionPath,
    queryInput: {
      text: {
        text: request.body.newMessage.messageText,
        languageCode: 'en-US',
      }
    }
  };

  try {
    const dialogFlowResponse = await sessionClient.detectIntent(dialogFlowRequest)
    console.log(dialogFlowResponse)
    response.send({
      senderIsHuman: false,
      messageText: dialogFlowResponse[0].queryResult.fulfillmentText,
      sentUtcTime: new Date().getTime(),
    })
  } catch (err) {
    console.error(err)
    response.send({
      senderIsHuman: false,
      messageText: 'An Error occured, please check your connection!',
      sentUtcTime: new Date().getTime(),
    })
  }
})