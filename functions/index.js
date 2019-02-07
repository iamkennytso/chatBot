const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
// const dialogflow = require('dialogflow')
// const uuid = require('uuid')

const findWeaknessDialogFlowFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  const pokemonWeaknesses = ()  => {
    const typeArray = request.body.queryResult.parameters.Types;
    const { quadDamage, doubleDamage } = getWeaknesses(typeArray);
    if (!quadDamage && !doubleDamage) {
      return agent.add(`Are you sure about those types?`); 
    }

    agent.add(`${typeArray[0]} ${
      typeArray[1] 
        ? ` and ${typeArray[1]}`
        : ''
    } Pokemons take ${
      quadDamage.length 
        ? `quadtruple damage from ${quadDamage.join(', ')}${
            doubleDamage.length ? ' and ' : ''
          }`
        : ''
      }${
      doubleDamage.length 
        ? `double damage from ${doubleDamage.join(', ')}`
        : '' 
      }${
        !quadDamage.length && !doubleDamage.length
          ? `no reduced damage`
          : ''
    }.`);;
  }

  let intentMap = new Map();
  intentMap.set('pokemon.weaknesses', pokemonWeaknesses);
  agent.handleRequest(intentMap);
})

// TODO: to get this function in the cloud, figure out how to authenticate live
// const receiveMessage = functions.https.onRequest((request, response) => {
//   const sessionId = uuid.v4()
//   const sessionClient = new dialogflow.SessionsClient();
//   const sessionPath = sessionClient.sessionPath('testdiaflow-cffb8', sessionId)
//   const dialogFlowRequest = {
//     session: sessionPath,
//     queryInput: {
//       text: {
//         text: request.body.newMessage,
//         languageCode: 'en-US',
//       }
//     }
//   };

//   try {
//     const dialogFlowResponse = await sessionClient.detectIntent(dialogFlowRequest)
//     response.send({
//       senderIsHuman: false,
//       messageText: dialogFlowResponse[0].queryResult.fulfillmentText,
//       sentUtcTime: new Date().getTime(),
//     })
//   } catch (err) {
//     console.error(err)
//     response.send({
//       senderIsHuman: false,
//       messageText: 'An Error occured, please check your connection!',
//       sentUtcTime: new Date().getTime(),
//     })
//   }
// })

// spread operator doesn't work in cloud functions
const getWeaknesses = typeArray => {
  if (typeArray.length !== 1 && typeArray.length !== 2) {
    return {};
  }
  let weaknessesObj = {};
  if (typeArray.length === 1) {
    weaknessesObj =  Object.assign({}, weaknesses[typeArray[0]]);
  } else if ( typeArray.length === 2 ) {
    const hybrid = Object.assign({}, weaknesses[typeArray[0]]);
    const secondTypeWeaknesses = weaknesses[typeArray[1]];
    for (let weakType in secondTypeWeaknesses) {
      if (hybrid[weakType]) {
        hybrid[weakType] = hybrid[weakType] * secondTypeWeaknesses[weakType];
      } else {
        hybrid[weakType] = secondTypeWeaknesses[weakType];
      }
    }
    weaknessesObj = hybrid;
  }
  const quadDamage = [], doubleDamage = [];
  for (let weakness in weaknessesObj) {
    if (weaknessesObj[weakness] === 4) {
      quadDamage.push(weakness);
    }
    if (weaknessesObj[weakness] === 2) {
      doubleDamage.push(weakness);
    }
  }
  return {quadDamage, doubleDamage};
}

const weaknesses = {
  Normal: {
    Fighting: 2,
    Ghost: 0,
  },
  Fighting: {
    Flying: 2,
    Rock: .5,
    Bug: .5,
    Psychic: 2,
    Dark: .5,
    Fairy: 2,
  },
  Flying: {
    Fighting: .5,
    Ground: 0,
    Rock: 2,
    Bug: .5,
    Grass: .5,
    Electric: 2,
    Ice: 2,
  },
  Poison: {
    Fighting: .5,
    Poison: .5,
    Ground: 2,
    Bug: .5,
    Grass: .5,
    Psychic: 2,
    Fairy: .5,
  },
  Ground: {
    Poison: .5,
    Rock: .5,
    Water: 2,
    Grass: 2,
    Electric: 0,
    Ice: 2,
  },
  Rock: {
    Normal: .5,
    Fighting: 2,
    Flying: .5,
    Poison: .5,
    Ground: 2,
    Steel: 2,
    Fire: .5,
    Water: 2,
    Grass: 2,
  },
  Bug: {
    Fighting: .5,
    Flying: 2,
    Ground: .5,
    Rock: 2,
    Fire: 2,
    Grass: .5,
  },
  Ghost: {
    Normal: 0,
    Fighting: 0,
    Poison: .5,
    Bug: .5,
    Ghost: 2,
    Dark: 2,
  },
  Steel: {
    Normal: .5,
    Fighting: 2,
    Flying: .5,
    Poison: 0,
    Ground: 2,
    Rock: .5,
    Bug: .5,
    Steel: .5,
    Fire: 2,
    Grass: .5,
    Psychic: .5,
    Ice: .5,
    Dragon: .5,
    Fairy: .5,
  },
  Fire: {
    Ground: 2,
    Rock: 2,
    Bug: .5,
    Steel: .5,
    Fire: .5,
    Water: 2,
    Grass: .5,
    Ice: .5,
    Fairy: .5,
  },
  Water: {
    Steel: .5,
    Fire: .5,
    Water: .5,
    Grass: 2,
    Electric: 2,
    Ice: .5,
  },
  Grass: {
    Flying: 2,
    Poison: 2,
    Ground: .5,
    Bug: 2,
    Fire: 2,
    Water: .5,
    Grass: .5,
    Electric: .5,
    Ice: 2,
  },
  Electric: {
    Flying: .5,
    Ground: 2,
    Steel: .5,
    Electric: .5,
  },
  Psychic: {
    Fighting: .5,
    Bug: 2,
    Ghost: 2,
    Psychic: .5,
    Dark: 2,
  },
  Ice: {
    Fighting: 2,
    Rock: 2,
    Steel: 2,
    Fire: 2,
    Ice: .5,
  },
  Dragon: {
    Fire: .5,
    Water: .5,
    Grass: .5,
    Electric: .5,
    Ice: 2,
    Dragon: 2,
    Fairy: 2,
  },
  Dark: {
    Fighting: 2,
    Bug: 2,
    Ghost: .5,
    Psychic: 0,
    Dark: .5,
    Fairy: 2,
  },
  Fairy: {
    Fighting: .5,
    Poison: 2,
    Bug: .5,
    Steel: 2,
    Dragon: 0,
    Dark: .5,
  },
}

module.exports = { 
  getWeaknesses, 
  findWeaknessDialogFlowFulfillment, 
  // receiveMessage
};