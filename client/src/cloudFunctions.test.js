const { pokemonWeaknessesByName, calculateWeaknesses, titleCase } = require('../functions/index')

describe('calculates weaknesses correctly by type', () => {
  it('gets fire type weaknesses correctly', () => {
    const fireWeakness = calculateWeaknesses(['Fire']);
      expect(fireWeakness.doubleDamage.length).toEqual(3);
      expect(fireWeakness.doubleDamage).toContain('Water');
      expect(fireWeakness.doubleDamage).toContain('Ground');
      expect(fireWeakness.doubleDamage).toContain('Rock');
  })
  it('gets fire and flying type weaknesses corretly', () => {
    const fireFlyingWeakness = calculateWeaknesses(['Fire', 'Flying']);
      expect(fireFlyingWeakness.doubleDamage.length).toEqual(2);
      expect(fireFlyingWeakness.doubleDamage).toContain('Water');
      expect(fireFlyingWeakness.doubleDamage).toContain('Electric');
      expect(fireFlyingWeakness.quadDamage.length).toEqual(1);
      expect(fireFlyingWeakness.quadDamage).toContain('Rock');
  })
  it('handles no weaknessess error correctly', () => {
    const noTypeWeakness = calculateWeaknesses([]);
      expect(noTypeWeakness.doubleDamage).toEqual(undefined);
      expect(noTypeWeakness.quadDamage).toEqual(undefined);
  })
  it('handles 3 weaknesses error correctly', () => {
    const threeTypeWeakness = calculateWeaknesses(['Fire', 'Water', 'Flying']);
      expect(threeTypeWeakness.doubleDamage).toEqual(undefined);
      expect(threeTypeWeakness.quadDamage).toEqual(undefined);
  })
})

it('title cases strings properly', () => {
  expect(titleCase('pikachu')).toEqual('Pikachu');
  expect(titleCase('mewtwo-mega-x')).toEqual('Mewtwo-Mega-X');
  expect(titleCase('DRAGONITE')).toEqual('Dragonite');
})

// describe('gets pokemon weaknesses by name', () => {
//   let agent
//   beforeEach(() => {
//     agent = {
//       parameters: {},
//     }
//   })
//   it('can get Pikachu weakness', async () => {
//     agent.parameters.complete = '2'
//     await pokemonWeaknessesByName(agent)
//     expect().toEqual()
//   })

// })