import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOrderRecipients } from '../lib/order-notification-validation';

test('recipient lists accept separators and remove duplicate addresses', () => {
    assert.deepEqual(parseOrderRecipients(' Sales@example.com,ops@example.com;\nsales@example.com '), ['sales@example.com', 'ops@example.com']);
});

test('an empty list disables notifications', () => {
    assert.deepEqual(parseOrderRecipients(' \n,; '), []);
});

test('invalid addresses and email header injection are rejected', () => {
    for (const input of ['not-an-email', 'valid@example.com\nBcc: victim@example.com', 'Person <person@example.com>']) {
        assert.throws(() => parseOrderRecipients(input), /Invalid email/);
    }
});

test('recipient count is limited', () => {
    assert.throws(() => parseOrderRecipients(Array.from({ length: 51 }, (_, i) => `user${i}@example.com`).join(',')), /no more than 50/);
});
