import React, { Component } from 'react';
import { Paper } from '@material-ui/core';
import axios from 'axios';
import './App.scss';

import LoginPage from './components/LoginPage/LoginPage';
import IndividualMessage from './components/IndividualMessage/IndividualMessage';
import InputBar from './components/InputBar/InputBar';

const INITIAL_STATE = {
  user: null,
  messages: [],
  userInputMessage: '',
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  };

  // componentDidMount () {

  // };

  /**
  * Logs the user in.
  * @param {Object} user - firebase object containing user data
  */
  handleUserLogin = user => {
    const sentUtcTime = new Date().getTime();
    const messages = [{
      senderIsHuman: false,
      messageText: `Hello ${user.user.displayName || user.user.email}! How may I be of assistance?`,
      sentUtcTime,
    }];
    this.setState({ user, messages });
  }

  /**
  * Handles keyboard changes on the text field
  * @param {event} e - synthetic event containing the value of the target
  * @param {string} inputField - string representing the field being editted
  */
  handleUserInput = inputField => e => {
    this.setState({ [inputField]: e.target.value });
  }

  /**
  * Submits the text in the text field. 
  * Appends the user message to the message list, and a loading message.
  * Sends the user message to the backend to send off to dialogFlow.
  * Once backend responds, replaces the response with the dialogFlow response.
  * @param {event} e - synthetic event, need to stop its propagation 
  */
  handleUserSubmitMessage = e => {
    e.preventDefault();
    if (!this.state.userInputMessage.trim()) {
      return;
    }
    const sentUtcTime = new Date().getTime();
    const newMessage = {
      senderIsHuman: true,
      messageText: this.state.userInputMessage,
      sentUtcTime,
    };
    const loadingMessage = {
      senderIsHuman: false,
      messageText: 'Loading...',
      sentUtcTime: sentUtcTime + 1,
    };
    const loadingMessageIndex = this.state.messages.length + 1;
    this.setState({ messages: [...this.state.messages, newMessage, loadingMessage], userInputMessage: INITIAL_STATE.userInputMessage },
      async () => {
        // function to scroll to bottom of input box
        const { messagesContainer } = this.refs;
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
        // local development code start
        const dialogFlowResponse = await axios.post('/sendMessage', { newMessage });
        // local development code end
        const messages = this.state.messages;
        messages[loadingMessageIndex] = dialogFlowResponse.data;
        this.setState({ messages });
      }
    )
  }

  render() {
    const { user } = this.state;
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

export default App;
