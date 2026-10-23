import assert from 'node:assert/strict';
import test from 'node:test';
import {harness} from './support/harness.mjs';

const actor = (id, typeId = 'minecraft:player') => ({id, typeId, isValid: true});
function blast(h) {
  h.advance(20);
  const explosions = h.calls.filter(call => call.kind === 'explosion');
  assert.equal(explosions.length, 1, 'one impact still produces exactly one explosion');
  assert.equal(explosions[0].tick, 4, 'attribution preserves the settle delay');
  return explosions[0];
}

for (const kind of ['block', 'entity']) {
  test(`${kind}: resolved shooter is the explosion source after projectile removal`, () => {
    const h = harness(), shooter = actor('shooter'), p = h.projectile();
    h.sources.set(shooter.id, shooter);
    h.hit(kind, p, undefined, shooter);
    const result = blast(h);
    assert.equal(p.isValid, false);
    assert.equal(result.options.source, shooter);
    assert.deepEqual(h.sourceLookups, ['shooter']);
  });
  test(`${kind}: ownerless impact stays ownerless despite nearby players`, () => {
    const h = harness();
    h.sources.set('unrelated-player', actor('unrelated-player'));
    h.hit(kind, h.projectile());
    assert.equal(Object.hasOwn(blast(h).options, 'source'), false);
    assert.deepEqual(h.sourceLookups, []);
  });
}

for (const missing of ['removed', 'invalid', 'lookup-throws', 'validity-throws']) {
  test(`${missing}: shooter becoming unavailable during the delay never cancels detonation`, () => {
    const h = harness(), shooter = actor('shooter');
    h.sources.set(shooter.id, shooter);
    h.hit('block', h.projectile(), undefined, shooter);
    h.advance();
    if (missing === 'removed') h.sources.delete(shooter.id);
    if (missing === 'invalid') shooter.isValid = false;
    if (missing === 'lookup-throws') h.failSourceLookup();
    if (missing === 'validity-throws') Object.defineProperty(shooter, 'isValid', {get() {throw new Error('expired actor');}});
    assert.equal(Object.hasOwn(blast(h).options, 'source'), false);
  });
}

test('resolve the captured identity instead of relying on an old entity wrapper', () => {
  const h = harness(), previous = actor('same-shooter'), current = actor('same-shooter');
  h.sources.set(previous.id, previous);
  h.hit('entity', h.projectile(), undefined, previous);
  previous.isValid = false;
  h.sources.set(current.id, current);
  assert.equal(blast(h).options.source, current);
});

test('first accepted impact owns the blast even if duplicate events offer another source', () => {
  const h = harness(), first = actor('first'), second = actor('second'), p = h.projectile();
  h.sources.set(first.id, first); h.sources.set(second.id, second);
  h.hit('block', p, undefined, first);
  h.advance();
  h.hit('entity', p, {x: 99, y: 99, z: 99}, second);
  const result = blast(h);
  assert.equal(result.options.source, first);
  assert.deepEqual(result.location, {x: 10, y: 64, z: 20});
});

test('simultaneous grenades keep their separate shooters', () => {
  const h = harness(), first = actor('first'), second = actor('second', 'minecraft:zombie');
  h.sources.set(first.id, first); h.sources.set(second.id, second);
  h.hit('block', h.projectile('one'), undefined, first);
  h.hit('entity', h.projectile('two'), undefined, second);
  h.advance(20);
  const explosions = h.calls.filter(call => call.kind === 'explosion');
  assert.equal(explosions.length, 2);
  assert.equal(explosions[0].options.source, first);
  assert.equal(explosions[1].options.source, second);
});

test('valid source is retained after a dimension/mode change without new late-use conditions', () => {
  const h = harness(), shooter = actor('shooter');
  h.sources.set(shooter.id, shooter);
  h.hit('block', h.projectile(), undefined, shooter);
  shooter.dimension = {id: 'minecraft:nether'};
  shooter.mode = 'Creative';
  assert.equal(blast(h).options.source, shooter);
});

test('an unreadable source at impact does not cancel an otherwise valid grenade', () => {
  const h = harness();
  h.hit('block', h.projectile(), undefined, {get id() {throw new Error('source unavailable');}});
  assert.equal(Object.hasOwn(blast(h).options, 'source'), false);
});
