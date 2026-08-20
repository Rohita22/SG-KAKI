import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  capReplyLength,
  extractJson,
  isReplyWithEnding,
  isValidHistory,
  isValidPersonaContext,
  parseSuggestions,
  salvageReply,
} from './aiPractice.js';
import { unwrapHarmonyEnvelope } from '../integrations/groq.js';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

test('short replies pass through untouched', () => {
  const short = 'Aiyo, so packed! Come, chicken rice first.';
  assert.equal(capReplyLength(short), short);
});

test('long replies are cut at a sentence boundary, within the cap', () => {
  const long =
    'Aiyo, this place always so busy at lunch. I got the best chicken rice stall right here. ' +
    'The queue is the longest but it is worth it. Let us hit the stall first and then find a table.';
  const capped = capReplyLength(long);
  assert.ok(words(capped) <= 35, `expected <= 35 words, got ${words(capped)}`);
  assert.ok(long.startsWith(capped), 'kept text should be a prefix of the reply');
  assert.match(capped, /[.!?]$/, 'should end on a whole sentence');
});

test('a single over-long sentence still gets cut', () => {
  const rambling = 'wah ' .repeat(60).trim();
  const capped = capReplyLength(rambling);
  assert.ok(words(capped) <= 36, `expected <= 36 words, got ${words(capped)}`);
});

test('a Harmony tool-call envelope still yields the reply payload', () => {
  const failedGeneration =
    '{"name": "assistant", "arguments": {"reply":"Come, chicken rice first.","endConversation":false}}';
  assert.deepEqual(extractJson(failedGeneration, isReplyWithEnding), {
    reply: 'Come, chicken rice first.',
    endConversation: false,
  });
});

test('a plain JSON reply is unaffected by the envelope fallback', () => {
  assert.deepEqual(
    extractJson('{"reply":"Wah, so packed.","endConversation":true}', isReplyWithEnding),
    { reply: 'Wah, so packed.', endConversation: true },
  );
});

test('a long conversation is still a valid history', () => {
  const history = Array.from({ length: 40 }, (_, i) => ({
    role: i % 2 ? ('user' as const) : ('ai' as const),
    text: 'line ' + i,
  }));
  assert.equal(isValidHistory(history), true);
  assert.equal(isValidHistory([{ role: 'assistant', text: 'hi' }]), false);
});

test('a full scene beat goal fits the context bound', () => {
  // Scene 3's chope beat is ~660 characters; persona descriptions run ~500.
  assert.equal(isValidPersonaContext({ context: 'x'.repeat(1000) }), true);
  assert.equal(isValidPersonaContext({ context: 'x'.repeat(5000) }), false);
});

test('a reply cut off mid-JSON never leaks the envelope into a bubble', () => {
  const truncated = '{"reply": "Confirm shiok one! Come, let\'s go find';
  assert.equal(extractJson(truncated, isReplyWithEnding), undefined);
  assert.equal(salvageReply(truncated), "Confirm shiok one! Come, let's go find");
});

test('a reply with no ending signal still yields its text', () => {
  assert.deepEqual(extractJson('{"reply":"Wah, so packed."}', isReplyWithEnding), {
    reply: 'Wah, so packed.',
  });
});

test('salvageReply leaves a plain reply alone', () => {
  assert.equal(salvageReply('Come, chicken rice first.'), 'Come, chicken rice first.');
});

// The exact envelope that reached a speech bubble as raw JSON: GPT OSS wrapped
// its answer in a Harmony tool call, with all three options on one line.
const HARMONY_LEAK =
  '{"name": "assistant", "arguments": {"role":"assistant","content":"1. Sure, I\'ll chope it for us, no problem. 2. Oh, I\'m not sure how to chope, can you show me? 3. Got it, I\'ll put the packet down right now."}}';

test('a Harmony-wrapped reply is unwrapped to its text', () => {
  const unwrapped = unwrapHarmonyEnvelope('{"name":"assistant","arguments":{"content":"Aiyo, so packed today!"}}');
  assert.equal(unwrapped, 'Aiyo, so packed today!');
});

test('a plain reply and a real ending-signal JSON pass through untouched', () => {
  assert.equal(unwrapHarmonyEnvelope('Come, we go queue.'), 'Come, we go queue.');
  const endingSignal = '{"reply":"Come, we go queue.","endConversation":true}';
  assert.equal(unwrapHarmonyEnvelope(endingSignal), endingSignal);
});

test('the leaked envelope parses into three separate suggestions', () => {
  const suggestions = parseSuggestions(unwrapHarmonyEnvelope(HARMONY_LEAK));
  assert.equal(suggestions.length, 3);
  assert.equal(suggestions[0], "Sure, I'll chope it for us, no problem.");
  assert.equal(suggestions[2], "Got it, I'll put the packet down right now.");
  for (const s of suggestions) assert.ok(!s.includes('{'), `still JSON: ${s}`);
});

test('normal newline-separated options still parse', () => {
  const suggestions = parseSuggestions('1. Roasted please.\n2. What is nicer ah?\n3. Steamed for me.');
  assert.deepEqual(suggestions, ['Roasted please.', 'What is nicer ah?', 'Steamed for me.']);
});
