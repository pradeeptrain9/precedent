import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findPrecedents, report } from '../src/engine.js';

const decisions = [
  { source: 'confluence', title: 'ADR-12: Use PostgreSQL, MongoDB rejected', excerpt: 'We rejected MongoDB for the orders service because of transactions.', url: '/adr-12' },
  { source: 'confluence', title: 'ADR-7: Adopt GraphQL gateway', excerpt: 'Gateway in front of services.', url: '/adr-7' },
  { source: 'confluence', title: 'Holiday rota 2026', excerpt: 'Who is on call in December.', url: '/rota' },
];

test('flags conflict first, keeps related, drops unrelated', () => {
  const work = { summary: 'Migrate orders service to MongoDB', description: 'Need flexible schema for orders' };
  const r = findPrecedents(work, decisions);
  assert.equal(r[0].url, '/adr-12');
  assert.equal(r[0].verdict, 'CONFLICT');
  assert.ok(r[0].matched.includes('mongodb'));
  assert.ok(!r.some((d) => d.url === '/rota'));
});

test('positive decision is RELATED, not CONFLICT', () => {
  const r = findPrecedents({ summary: 'Add GraphQL gateway auth' }, decisions);
  assert.equal(r[0].url, '/adr-7');
  assert.equal(r[0].verdict, 'RELATED');
});

test('fails closed: empty work or no match says none found', () => {
  assert.deepEqual(findPrecedents({ summary: '' }, decisions), []);
  assert.match(report('X-1', [], ['Note: partial']), /^No prior decisions found for X-1\.\nNote: partial$/);
});
