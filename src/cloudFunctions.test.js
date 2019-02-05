import { getWeaknesses } from '../functions/index'


it('gets weaknesses correctly', () => {
  const fireWeakness = getWeaknesses(['Fire']);
    expect(fireWeakness.doubleDamage.length).toEqual(3);
    expect(fireWeakness.doubleDamage).toContain('Water');
    expect(fireWeakness.doubleDamage).toContain('Ground');
    expect(fireWeakness.doubleDamage).toContain('Rock');
  const fireFlyingWeakness = getWeaknesses(['Fire', 'Flying']);
    expect(fireFlyingWeakness.doubleDamage.length).toEqual(2);
    expect(fireFlyingWeakness.doubleDamage).toContain('Water');
    expect(fireFlyingWeakness.doubleDamage).toContain('Electric');
    expect(fireFlyingWeakness.quadDamage.length).toEqual(1);
    expect(fireFlyingWeakness.quadDamage).toContain('Rock');
  const noTypeWeakness = getWeaknesses([]);
    expect(noTypeWeakness.doubleDamage).toEqual(undefined);
    expect(noTypeWeakness.quadDamage).toEqual(undefined);
  const threeTypeWeakness = getWeaknesses(['Fire', 'Water', 'Flying']);
    expect(threeTypeWeakness.doubleDamage).toEqual(undefined);
    expect(threeTypeWeakness.quadDamage).toEqual(undefined);
})