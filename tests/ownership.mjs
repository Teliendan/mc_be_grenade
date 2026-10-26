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

test('missing grenade still explodes with the available shooter attribution', () => {
  const h = harness({mode: 'grenade'}), projectile = h.projectile();
  h.hit('block', projectile, undefined, player);
  projectile.isValid = false;
  assert.equal(blast(h).options.source, player);
});

test('missing grenade and shooter still produce an ownerless explosion', () => {
  const h = harness({mode: 'grenade'}), projectile = h.projectile();
  h.hit('block', projectile);
  projectile.isValid = false;
  assert.equal(Object.hasOwn(blast(h).options, 'source'), false);
});

test('native method: the live grenade explodes itself, no script blast', () => {
  const h = harness();
  const projectile = h.projectile();
  h.hit('block', projectile, undefined, player);
  h.advance(20);
  assert.deepEqual(h.calls.filter(call => call.kind === 'detonate').map(call => call.event), ['gm:detonate']);
  assert.equal(h.calls.some(call => call.kind === 'explosion' || call.kind === 'remove'), false);
});

test('native method: a grenade gone before detonation still blasts by script', () => {
  const h = harness(), projectile = h.projectile();
  h.hit('block', projectile, undefined, player);
  projectile.isValid = false;
  assert.equal(blast(h).options.source, player);
});

test('player method names the thrower; a dispenser grenade falls back to itself', () => {
  for (const shooter of [player, undefined]) {
    const h = harness({mode: 'player'}), projectile = h.projectile();
    h.hit('block', projectile, undefined, shooter);
    assert.equal(blast(h).options.source, shooter ?? projectile);
  }
});
