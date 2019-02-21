const functions = require('firebase-functions');
const { WebhookClient, Card } = require('dialogflow-fulfillment');
// const dialogflow = require('dialogflow')
// const uuid = require('uuid')

const findWeaknessDialogFlowFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  let intentMap = new Map();
  intentMap.set('pokemonTypeWeakness', pokemonWeaknessByType);
  intentMap.set('specificPokemonWeakness', pokemonWeaknessesByName);
  intentMap.set('genderedPokemonWeakness', pokemonWeaknessWithGender);
  intentMap.set('alolanPokemonWeakness', pokemonWeaknessWithRegionalVariant);
  intentMap.set('megaPokemonWeakness', pokemonWeaknessWithMegaEvolution);
  intentMap.set('megaPokemonVariantWeakness', pokemonWeaknessWithMegaEvolutionVariant);
  intentMap.set('megaPokemonVariantWeakness - xOrY', pokemonWeaknessWithMegaEvolutionVariant);
  agent.handleRequest(intentMap);
})

// all weakness calls eventually calls this function
const pokemonWeaknessByType = (agent, pokemonObj = {}) => {
  const { pokemonWeaknessTypes, pokemonName } = pokemonObj
  console.log(pokemonName)
  const typeArray = pokemonWeaknessTypes || agent.parameters.Types;
  const { quadDamage, doubleDamage } = calculateWeaknesses(typeArray);
  let formattedPokemonName;
  if (pokemonName) {
    formattedPokemonName = pokemonName.replace(/-/g, ' ');
  }
  if (!quadDamage && !doubleDamage) {
    return agent.add(`Are you sure about those types?`); 
  }
  const introString = pokemonName
    ? `${formattedPokemonName} takes`
    : `${typeArray[0]} ${
        typeArray[1] 
          ? ` and ${typeArray[1]}`
          : ''
      } Pokemons take`;
  const string = `${introString} ${
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
  }.`
  agent.add(string)
  if (pokemonName) {
    agent.add(new Card({
        title: `${formattedPokemonName}`,
        imageUrl: `https://img.pokemondb.net/artwork/large/${pokemonName.toLowerCase()}.jpg`,
        text: string,
        buttonText: 'Bulbapedia Page',
        buttonUrl: `https://bulbapedia.bulbagarden.net/wiki/${
          pokemonName.indexOf('-') > 0 
            ? pokemonName.slice(0, pokemonName.indexOf('-')) 
            : pokemonName
        }_(Pok%C3%A9mon)`,
      })
    );
  }
  return agent;
}

const pokemonWeaknessesByName = ( agent, pokemonObj = {} ) => {
  const pokemonName = pokemonObj.pokemon || agent.parameters.completePokemon;
  const weaknesses = pokemonTypes[pokemonName] // { type1: 'Grass', type2: 'Poison' }
  // Object.values doesn't work with cloud functions
  pokemonWeaknessTypes = []; // ['Grass', 'Poison']
  for (let type in weaknesses) {
    pokemonWeaknessTypes.push(weaknesses[type]);
  }
  pokemonWeaknessByType(agent, {pokemonWeaknessTypes, pokemonName: titleCase(pokemonName)});
}

const pokemonWeaknessWithGender = agent => {
  const {genderedPokemon, genders} = agent.parameters; // Nidoran, -M
  pokemonWeaknessesByName(agent, {pokemon: `${genderedPokemon}${genders}`});
}

const pokemonWeaknessWithRegionalVariant = agent => {
  const {alolanOrNot, alolanPokemon} = agent.parameters; //Raichu, -alolan
  pokemonWeaknessesByName(agent, {pokemon: `${alolanPokemon}${alolanOrNot === 'regular' ? '' : '-alolan'}`});
}

const pokemonWeaknessWithMegaEvolution = agent => {
  const {megaOrNot , megaPokemon} = agent.parameters; //Pinsir, Mega
  pokemonWeaknessesByName(agent, {pokemon: `${megaPokemon}${megaOrNot === 'regular' ? '' : '-Mega'}`});
}

const pokemonWeaknessWithMegaEvolutionVariant = agent => {
  const parameters = agent.parameters;
  const context = agent.context.get('megavariant');
  const conParas = context && context.parameters;

  const megaVariantPokemon = parameters.megaVariantPokemon || (conParas && conParas.megaVariantPokemon) || ''; // Mewtwo
  const megaOrNot = parameters.megaOrNot || (conParas && conParas.megaOrNot) || ''; // Mega
  const xOrY = parameters.xOrY || (conParas && conParas.xOrY) || ''; // Y

  const gotPokemon = megaVariantPokemon.length > 0;
  const gotMega = megaOrNot.length > 0;
  const gotXOrY = xOrY.length > 0;

  if( !gotPokemon ) {
    return agent.add(`Which pokemon are you searching for?`);
  } else if (!gotMega) {
    return agent.add(`Is ${megaVariantPokemon} mega evolved?`);
  } else if (gotPokemon && megaOrNot === 'regular') {
    pokemonWeaknessesByName(agent, { pokemon: megaVariantPokemon });
  } else if (gotPokemon && megaOrNot === 'Mega' && !gotXOrY) {
    return agent.add('Is it the X or Y varient?');
  } else if (gotPokemon && megaOrNot === 'Mega' && gotXOrY) {
    pokemonWeaknessesByName(agent, { pokemon: `${megaVariantPokemon}-${megaOrNot}-${xOrY}` });
  }
}

// spread operator doesn't work in cloud functions
const calculateWeaknesses = typeArray => {
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
  return { quadDamage, doubleDamage };
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
};

// naming conventions of pokemon are used to help link picture
const pokemonTypes = {
  Bulbasaur: { type1: 'Grass', type2: 'Poison' },
  Ivysaur: { type1: 'Grass', type2: 'Poison' },
  Venusaur: { type1: 'Grass', type2: 'Poison' },
  'Venusaur-Mega': { type1: 'Grass', type2: 'Poison' },
  Charmander: { type1: 'Fire' },
  Charmeleon: { type1: 'Fire' },
  Charizard: { type1: 'Fire', type2: 'Flying' },
  'Charizard-Mega-X': { type1: 'Fire', type2: 'Dragon' },
  'Charizard-Mega-Y': { type1: 'Fire', type2: 'Flying' },
  Squirtle: { type1: 'Water' },
  Wartortle: { type1: 'Water' },
  Blastoise: { type1: 'Water' },
  'Blastoise-Mega': { type1: 'Water' },
  Caterpie: { type1: 'Bug' },
  Metapod: { type1: 'Bug' },
  Butterfree: { type1: 'Bug', type2: 'Flying' },
  Weedle: { type1: 'Bug', type2: 'Poison' },
  Kakuna: { type1: 'Bug', type2: 'Poison' },
  Beedrill: { type1: 'Bug', type2: 'Poison' },
  'Beedrill-Mega': { type1: 'Bug', type2: 'Poison' },
  Pidgey: { type1: 'Normal', type2: 'Flying' },
  Pidgeotto: { type1: 'Normal', type2: 'Flying' },
  Pidgeot: { type1: 'Normal', type2: 'Flying' },
  'Pidgeot-Mega': { type1: 'Normal', type2: 'Flying' },
  Rattata: { type1: 'Normal' },
  'Rattata-alolan': { type1: 'Dark', type2: 'Normal' },
  Raticate: { type1: 'Normal' },
  'Raticate-alolan': { type1: 'Dark', type2: 'Normal' },
  Spearow: { type1: 'Normal', type2: 'Flying' },
  Fearow: { type1: 'Normal', type2: 'Flying' },
  Ekans: { type1: 'Poison' },
  Arbok: { type1: 'Poison' },
  Pikachu: { type1: 'Electric' },
  Raichu: { type1: 'Electric' },
  'Raichu-alolan': { type1: 'Electric', type2: 'Psychic' },
  Sandshrew: { type1: 'Ground' },
  'Sandshrew-alolan': { type1: 'Ice', type2: 'Steel' },
  Sandslash: { type1: 'Ground' },
  'Sandslash-alolan': { type1: 'Ice', type2: 'Steel' },
  'Nidoran-F': { type1: 'Poison' },
  Nidorina: { type1: 'Poison' },
  Nidoqueen: { type1: 'Poison', type2: 'Ground' },
  'Nidoran-M': { type1: 'Poison' },
  Nidorino: { type1: 'Poison' },
  Nidoking: { type1: 'Poison', type2: 'Ground' },
  Clefairy: { type1: 'Fairy' },
  Clefable: { type1: 'Fairy' },
  Vulpix: { type1: 'Fire' },
  'Vulpix-alolan': { type1: 'Ice' },
  Ninetales: { type1: 'Fire' },
  'Ninetales-alolan': { type1: 'Ice', type2: 'Fairy' },
  Jigglypuff: { type1: 'Normal', type2: 'Fairy' },
  Wigglytuff: { type1: 'Normal', type2: 'Fairy' },
  Zubat: { type1: 'Poison', type2: 'Flying' },
  Golbat: { type1: 'Poison', type2: 'Flying' },
  Oddish: { type1: 'Grass', type2: 'Poison' },
  Gloom: { type1: 'Grass', type2: 'Poison' },
  Vileplume: { type1: 'Grass', type2: 'Poison' },
  Paras: { type1: 'Bug', type2: 'Grass' },
  Parasect: { type1: 'Bug', type2: 'Grass' },
  Venonat: { type1: 'Bug', type2: 'Poison' },
  Venomoth: { type1: 'Bug', type2: 'Poison' },
  Diglett: { type1: 'Ground' },
  'Diglett-alolan': { type1: 'Ground', type2: 'Steel' },
  Dugtrio: { type1: 'Ground' },
  'Dugtrio-alolan': { type1: 'Ground', type2: 'Steel' },
  Meowth: { type1: 'Normal' },
  'Meowth-alolan': { type1: 'Dark' },
  Persian: { type1: 'Normal' },
  'Persian-alolan': { type1: 'Dark' },
  Psyduck: { type1: 'Water' },
  Golduck: { type1: 'Water' },
  Mankey: { type1: 'Fighting' },
  Primeape: { type1: 'Fighting' },
  Growlithe: { type1: 'Fire' },
  Arcanine: { type1: 'Fire' },
  Poliwag: { type1: 'Water' },
  Poliwhirl: { type1: 'Water' },
  Poliwrath: { type1: 'Water', type2: 'Fighting' },
  Abra: { type1: 'Psychic' },
  Kadabra: { type1: 'Psychic' },
  Alakazam: { type1: 'Psychic' },
  'Alakazam-Mega': { type1: 'Psychic' },
  Machop: { type1: 'Fighting' },
  Machoke: { type1: 'Fighting' },
  Machamp: { type1: 'Fighting' },
  Bellsprout: { type1: 'Grass', type2: 'Poison' },
  Weepinbell: { type1: 'Grass', type2: 'Poison' },
  Victreebel: { type1: 'Grass', type2: 'Poison' },
  Tentacool: { type1: 'Water', type2: 'Poison' },
  Tentacruel: { type1: 'Water', type2: 'Poison' },
  Geodude: { type1: 'Rock', type2: 'Ground' },
  'Geodude-alolan': { type1: 'Rock', type2: 'Electric' },
  Graveler: { type1: 'Rock', type2: 'Ground' },
  'Graveler-alolan': { type1: 'Rock', type2: 'Electric' },
  Golem: { type1: 'Rock', type2: 'Ground' },
  'Golem-alolan': { type1: 'Rock', type2: 'Electric' },
  Ponyta: { type1: 'Fire' },
  Rapidash: { type1: 'Fire' },
  Slowpoke: { type1: 'Water', type2: 'Psychic' },
  Slowbro: { type1: 'Water', type2: 'Psychic' },
  'Slowbro-Mega': { type1: 'Water', type2: 'Psychic' },
  Magnemite: { type1: 'Electric', type2: 'Steel' },
  Magneton: { type1: 'Electric', type2: 'Steel' },
  "Farfetch'd": { type1: 'Normal', type2: 'Flying' },
  Doduo: { type1: 'Normal', type2: 'Flying' },
  Dodrio: { type1: 'Normal', type2: 'Flying' },
  Seel: { type1: 'Water' },
  Dewgong: { type1: 'Water', type2: 'Ice' },
  Grimer: { type1: 'Poison' },
  'Grimer-alolan': { type1: 'Poison', type2: 'Dark' },
  Muk: { type1: 'Poison' },
  'Muk-alolan': { type1: 'Poison', type2: 'Dark' },
  Shellder: { type1: 'Water' },
  Cloyster: { type1: 'Water', type2: 'Ice' },
  Gastly: { type1: 'Ghost', type2: 'Poison' },
  Haunter: { type1: 'Ghost', type2: 'Poison' },
  Gengar: { type1: 'Ghost', type2: 'Poison' },
  'Gengar-Mega': { type1: 'Ghost', type2: 'Poison' },
  Onix: { type1: 'Rock', type2: 'Ground' },
  Drowzee: { type1: 'Psychic' },
  Hypno: { type1: 'Psychic' },
  Krabby: { type1: 'Water' },
  Kingler: { type1: 'Water' },
  Voltorb: { type1: 'Electric' },
  Electrode: { type1: 'Electric' },
  Exeggcute: { type1: 'Grass', type2: 'Psychic' },
  Exeggutor: { type1: 'Grass', type2: 'Psychic' },
  'Exeggutor-alolan': { type1: 'Grass', type2: 'Dragon' },
  Cubone: { type1: 'Ground' },
  Marowak: { type1: 'Ground' },
  'Marowak-alolan': { type1: 'Fire', type2: 'Ghost' },
  Hitmonlee: { type1: 'Fighting' },
  Hitmonchan: { type1: 'Fighting' },
  Lickitung: { type1: 'Normal' },
  Koffing: { type1: 'Poison' },
  Weezing: { type1: 'Poison' },
  Rhyhorn: { type1: 'Ground', type2: 'Rock' },
  Rhydon: { type1: 'Ground', type2: 'Rock' },
  Chansey: { type1: 'Normal' },
  Tangela: { type1: 'Grass' },
  Kangaskhan: { type1: 'Normal' },
  'Kangaskhan-Mega': { type1: 'Normal' },
  Horsea: { type1: 'Water' },
  Seadra: { type1: 'Water' },
  Goldeen: { type1: 'Water' },
  Seaking: { type1: 'Water' },
  Staryu: { type1: 'Water' },
  Starmie: { type1: 'Water', type2: 'Psychic' },
  'Mr. Mime': { type1: 'Psychic', type2: 'Fairy' },
  Scyther: { type1: 'Bug', type2: 'Flying' },
  Jynx: { type1: 'Ice', type2: 'Psychic' },
  Electabuzz: { type1: 'Electric' },
  Magmar: { type1: 'Fire' },
  Pinsir: { type1: 'Bug' },
  "Pinsir-Mega": { type1: 'Bug', type2: 'Flying'},
  Tauros: { type1: 'Normal' },
  Magikarp: { type1: 'Water' },
  Gyarados: { type1: 'Water', type2: 'Flying' },
  "Gyarados-Mega": { type1: 'Water', type2: 'Dark' },
  Lapras: { type1: 'Water', type2: 'Ice' },
  Ditto: { type1: 'Normal' },
  Eevee: { type1: 'Normal' },
  Vaporeon: { type1: 'Water' },
  Jolteon: { type1: 'Electric' },
  Flareon: { type1: 'Fire' },
  Porygon: { type1: 'Normal' },
  Omanyte: { type1: 'Rock', type2: 'Water' },
  Omastar: { type1: 'Rock', type2: 'Water' },
  Kabuto: { type1: 'Rock', type2: 'Water' },
  Kabutops: { type1: 'Rock', type2: 'Water' },
  Aerodactyl: { type1: 'Rock', type2: 'Flying' },
  'Aerodactyl-Mega': { type1: 'Rock', type2: 'Flying' },
  Snorlax: { type1: 'Normal' },
  Articuno: { type1: 'Ice', type2: 'Flying' },
  Zapdos: { type1: 'Electric', type2: 'Flying' },
  Moltres: { type1: 'Fire', type2: 'Flying' },
  Dratini: { type1: 'Dragon' },
  Dragonair: { type1: 'Dragon' },
  Dragonite: { type1: 'Dragon', type2: 'Flying' },
  Mewtwo: { type1: 'Psychic' },
  "Mewtwo-Mega-X": { type1: 'Psychic', type2: 'Fighting' },
  "Mewtwo-Mega-Y": { type1: 'Psychic' },
  Mew: { type1: 'Psychic' } ,
};

const titleCase = str => {
  return str
  .toLowerCase()
  .split(' ').map((word) => word
    .replace(word[0], word[0].toUpperCase()))
  .join(' ')
  .split('-').map((word) => word
    .replace(word[0], word[0].toUpperCase()))
  .join('-');
}

module.exports = { 
  pokemonWeaknessesByName,
  calculateWeaknesses, 
  findWeaknessDialogFlowFulfillment, 
  titleCase
  // receiveMessage
};