import React from 'react'
import { TextField, Button } from '@material-ui/core'
import { Send } from '@material-ui/icons'
import './InputBar.scss'

const InputBar = ({ handleUserInput, handleUserSubmitMessage, userInputMessage }) => 
  <form className='InputBar' onSubmit={handleUserSubmitMessage}>
    <TextField
      className='InputBar-Input'
      fullWidth
      onChange={handleUserInput('userInputMessage')}
      value={userInputMessage}
    />
    <Button variant="contained" color="default" type="submit">
      Send
      <Send />
    </Button>
  </form>

export default InputBar