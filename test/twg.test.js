import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cloudIdFrom } from '../src/twg.js';

const id = '4734599a-6b2e-425a-b1fd-ad01843322d6';

test('cloudId from payload, context, or installContext ARI; null otherwise', () => {
  assert.equal(cloudIdFrom({ context: { cloudId: id } }, {}), id);
  assert.equal(cloudIdFrom({}, { cloudId: id }), id);
  assert.equal(cloudIdFrom({}, { installContext: `ari:cloud:jira::site/${id}` }), id);
  assert.equal(cloudIdFrom({}, {}), null);
});
