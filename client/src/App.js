import React, { Component } from 'react';
import { Paper } from '@material-ui/core';
import axios from 'axios';
import './App.scss';

import LoginPage from './components/LoginPage/LoginPage'
import IndividualMessage from './components/IndividualMessage/IndividualMessage'
import InputBar from './components/InputBar/InputBar'

const INITIAL_STATE = {
  user: null,
  messages: [],
  userInputMessage: '',
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  };

  // componentDidMount () {

  // };

  handleUserLogin = user => {
    const sentUtcTime = new Date().getTime();
    const messages = [{
      senderIsHuman: false,
      messageText: `Hello ${user.user.displayName || user.user.email}! How may I be of assistance?`,
      sentUtcTime
    }]
    this.setState({ user, messages })
  }
  handleUserInput = inputField => e => {
    this.setState({ [inputField]: e.target.value })
  }

  handleUserSubmitMessage = e => {
    e.preventDefault();
    if (!this.state.userInputMessage.trim()) {
      return;
    }
    const sentUtcTime = new Date().getTime();
    const newMessage = {
      senderIsHuman: true,
      messageText: this.state.userInputMessage,
      sentUtcTime
    }
    const loadingMessage = {
      senderIsHuman: false,
      messageText: 'Loading...',
      sentUtcTime: sentUtcTime + 1
    }
    const loadingMessageIndex = this.state.messages.length + 1;
    this.setState({ messages: [...this.state.messages, newMessage, loadingMessage], userInputMessage: INITIAL_STATE.userInputMessage }, 
      // function to scroll to bottom of input box
      async () => {
        const { messagesContainer } = this.refs;
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
        // local code start
        const dialogFlowResponse = await axios.post('sendMessage', { newMessage })
        // local code end
        const messages = this.state.messages;
        messages[loadingMessageIndex] = dialogFlowResponse.data
        this.setState({ messages })
      }
    )
  }

  render() {
    const { user } = this.state
    return (
      <div className='App'>
        {!user 
          ? <LoginPage 
            handleLogin={this.handleUserLogin}
          />
          : <Paper className='App-Paper' elevation={1}>
            <div className='App-Paper-MessageContainer' ref='messagesContainer'>
              {this.state.messages.map(message => <IndividualMessage
                senderIsHuman={message.senderIsHuman}
                messageText={message.messageText}
                key={message.sentUtcTime}
              />)}
            </div>
            <InputBar 
              handleUserInput={this.handleUserInput}
              handleUserSubmitMessage={this.handleUserSubmitMessage}
              userInputMessage={this.state.userInputMessage}
            />
          </Paper>
        }
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
