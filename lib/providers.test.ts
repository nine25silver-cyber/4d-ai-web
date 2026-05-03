import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFixedSlotCells } from './providers';

test('buildFixedSlotCells keeps fixed slots and masks extracted slots', () => {
  const slotLabels = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];
  const valuesBySlot = {
    A: '7490', B: '1109', C: '8547', D: '5645', E: '3856', F: '3806', G: '4592',
    H: '3002', I: '8051', J: '2848', K: '0175', L: '3876', M: '5343',
  };
  const extractedSlots = ['B', 'E', 'K'];

  const cells = buildFixedSlotCells(slotLabels, valuesBySlot, extractedSlots);
  assert.deepEqual(
    cells.map((c) => `${c.slotLabel} ${c.number}`),
    [
      'A 7490', 'B ----', 'C 8547', 'D 5645', 'E ----', 'F 3806', 'G 4592',
      'H 3002', 'I 8051', 'J 2848', 'K ----', 'L 3876', 'M 5343',
    ],
  );
});
