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
  test(`${kind} hit forwards the shooter as explosion source`, () => {
    const h = harness();
    h.hit(kind, h.projectile(), undefined, player);
    assert.equal(blast(h).options.source, player);
  });
}

test('ownerless hit (dispenser) stays ownerless', () => {
  const h = harness();
  h.hit('block', h.projectile());
  assert.equal(Object.hasOwn(blast(h).options, 'source'), false);
});

test('shooter gone during the delay still blasts, ownerless', () => {
  const h = harness(), shooter = {...player};
  h.hit('block', h.projectile(), undefined, shooter);
  h.advance();
  shooter.isValid = false;
  assert.equal(Object.hasOwn(blast(h).options, 'source'), false);
});
