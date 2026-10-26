import assert from 'node:assert/strict';
import test from 'node:test';
import {harness} from './support/harness.mjs';

const player = {id: 'player', typeId: 'minecraft:player', isValid: true};
function blast(h) {
  h.advance(20);
  const explosions = h.calls.filter(call => call.kind === 'explosion');
  assert.equal(explosions.length, 1);
  return explosions[0];
}

for (const kind of ['block', 'entity']) {
  test(`${kind} hit uses the live grenade as the direct explosion source`, () => {
    const h = harness({mode: 'grenade'});
    const projectile = h.projectile();
    h.hit(kind, projectile, undefined, player);
    const result = blast(h);
    assert.equal(result.options.source, projectile);
    assert.equal(result.sourceWasValid, true);
    assert.equal(projectile.isValid, false, 'remove after the explosion');
  });
}

test('dispenser grenade is the source without assigning a player', () => {
  const h = harness({mode: 'grenade'});
  const projectile = h.projectile();
  h.hit('block', projectile);
  assert.equal(blast(h).options.source, projectile);
});

test('shooter gone during the delay still blasts from the grenade', () => {
  const h = harness({mode: 'grenade'}), shooter = {...player};
  const projectile = h.projectile();
  h.hit('block', projectile, undefined, shooter);
  h.advance();
  shooter.isValid = false;
  assert.equal(blast(h).options.source, projectile);
});

test('missing grenade still explodes, ownerless (a player source would damage nothing)', () => {
  const h = harness({mode: 'grenade'}), projectile = h.projectile();
  h.hit('block', projectile, undefined, player);
  projectile.isValid = false;
  assert.equal(Object.hasOwn(blast(h).options, 'source'), false);
});

test('native method: the live grenade explodes itself, no script blast', () => {
  const h = harness({mode: 'native'});
  const projectile = h.projectile();
  h.hit('block', projectile, undefined, player);
  h.advance(20);
  assert.deepEqual(h.calls.filter(call => call.kind === 'detonate').map(call => call.event), ['gm:detonate']);
  assert.equal(h.calls.some(call => ['explosion', 'remove', 'damage'].includes(call.kind)), false);
});
