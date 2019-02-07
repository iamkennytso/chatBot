import React, { Component } from 'react';
import { TextField, Button } from '@material-ui/core';
import firebase from '../../constants/firebase';
import Logo from './Cedrus.jfif';
import './Login.scss';

const INITIAL_STATE = {
  username: '',
  password: '',
  mess: "Don't be a stranger",
}

class loginDiv extends Component {
  /**
   * Initializers 
   */

  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  };
  /**
   * Handlers 
   */

  /**
  * Sends a request to firebase to attmept to authenticate the user.
  * Will either call props.handleLogin, or this._handleInvalid
  * @param {event} e - synthetic event, need to stop its propagation 
  */
  _handleSubmit = async e => {
    e.preventDefault();
    try {
      const user = await firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password);
      this.props.handleLogin(user);
    } catch(err) {
      if (
        err.code === 'auth/invalid-email' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/too-many-requests'
      ) {
        this._handleInvalid();
      } else {
        console.error(err)
      }
    }
  };

  /**
  * Handles keyboard changes on the text field
  * @param {event} e - synthetic event containing the value of the target
  * @param {string} inputField - string representing the field being editted
  */
  _handleChange = field => event =>
    this.setState({
      [field]: event.target.value,
    });

  /**
  * Handles when a login attempt is invalid
  * Changes the text to NO! if it isn't already NO!, or adds an exclamation point
  */
  _handleInvalid = () => {
    this.setState({
      mess: this.state.mess[0] === 'N'
        ? this.state.mess.concat('!')
        : 'NO'
    });
  };

  /**
   * Renderer
   */
  render() {
    return (
      <div className="Login" >
        <div className='Login-Name'> Demo Chatbox </div>
        <img className='Login-Logo' src={Logo} alt="Cedrus" /> <br />
        <div className='Login-Message'> {this.state.mess} </div>
        <form className='Login-Form' onSubmit={this._handleSubmit}>
          <TextField className='Login-Field' onChange={this._handleChange('username')} fullWidth autoFocus />
          <TextField className='Login-Field' onChange={this._handleChange('password')} fullWidth type="password" />
          <Button className='Login-Button' variant="contained" fullWidth color="primary" type="submit"> Login </Button>
        </form>
      </div>
    );
  }
}

export default loginDiv;