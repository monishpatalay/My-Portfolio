import {describe,expect,it} from 'vitest';
import {horizontalDelta,nearestStop,railStops} from '../lib/motion/rail-math';

describe('project rail math', () => {
  it('converts horizontal input only while armed and clamps boundaries', () => {
    expect(horizontalDelta(80, 10, 1000, 1000, 2000, 800)).toBe(80);
    expect(horizontalDelta(80, 10, 2000, 1000, 2000, 800)).toBe(0);
    expect(horizontalDelta(10, 80, 1000, 1000, 2000, 800)).toBeNull();
    expect(horizontalDelta(-50, 1, 900, 1000, 2000, 800)).toBe(0);
  });

  it('deduplicates trailing stops and finds the closest card', () => {
    const stops = railStops([48, 448, 848, 1248], 48, 800);
    expect(stops).toEqual([0, 400, 800]);
    expect(nearestStop(stops, 460)).toBe(1);
  });
});
