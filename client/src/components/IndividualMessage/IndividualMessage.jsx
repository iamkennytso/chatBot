import React from 'react'
import './IndividualMessage.scss'

const IndividualMessage = ({ messageContent, senderIsHuman }) =>
  <div className={`IndividualMessage isHuman-${senderIsHuman}`}>
    {messageContent}
  </div>

export default IndividualMessage