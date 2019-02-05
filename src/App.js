import React, { Component } from 'react';
import { Paper } from '@material-ui/core';
import './App.scss';

import IndividualMessage from './components/IndividualMessage/IndividualMessage'
import InputBar from './components/InputBar/InputBar'

const INITIAL_STATE = {
  messages: []
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  };

  componentDidMount () {
    this.setState({ messages: dummyMessages })
  };

  render() {
    return (
      <div className='App'>
        <Paper className='App-Paper' elevation={1}>
          <div className='App-Paper-MessageContainer'>
            {this.state.messages.map(message => <IndividualMessage 
              senderIsHuman={message.senderIsHuman}
              messageText={message.messageText}
              key={message.sentUtcTime}
            />)}
          </div>
          <InputBar />
        </Paper>
      </div>
    );
  }
}

const dummyMessages = [
  {
    senderIsHuman: true,
    messageText: 'Hello!',
    sentUtcTime: 1549399484183
  },
  {
    senderIsHuman: false,
    messageText: 'Greetings!',
    sentUtcTime: 1549399609047
  },
  {
    senderIsHuman: true,
    messageText: 'I just wanted to send a really exorbantly long message so  I can see what it looks like if I were to go past the limits of the horizontal scroll. We are working pretty high resolution monitors these days so this message has to be really long. For gaming purposes though, I suggest the middle ground between a high refresh monitor 144hz monitor and 2k display, unless you have a boat of money to spend on both the rig and the monitors. How is your day going?',
    sentUtcTime: 1549399649775
  },
  {
    senderIsHuman: false,
    messageText: 'Feeling Wonderful!',
    sentUtcTime: 1549399747481
  }
]
export default App;
