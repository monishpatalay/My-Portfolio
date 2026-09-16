/**
 * Skills — the filterable stack cloud. Clicking a pill drops it out of the
 * cloud under gravity, holds it there for REST_MS, then springs it back into
 * place. The drop is a transform on the inner button so the outer motion.div
 * keeps owning the layout animation when the filter changes; the two never
 * fight over the same element's transform. Calm mode (§14.4) skips it.
 */

'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {AnimatePresence, animate, motion} from 'motion/react';
import {useMotionMode} from '@/lib/motion/governor';
import {dur, ease, spring} from '@/lib/motion/tokens';

const GLYPHS = ['{ }', '⌘', '◇', '⟐'];
// A quick damped wiggle — amplitudes shrink so it settles rather than stopping dead.
const SHAKE_X = [0, -5, 5, -4, 4, -2, 0];
const SHAKE_ROTATE = [0, -2.5, 2.5, -1.8, 1.8, -0.8, 0];
const FALL_PX = 118;
const BOUNCE_PX = 13;
const REST_MS = 4000;
const EASE_FALL: [number, number, number, number] = [...ease.in];

// A stable per-name seed, so a given pill always tumbles the same way.
const seedOf = (name: string) => [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
const tiltFor = (name: string) => (seedOf(name) % 37) - 18;
const driftFor = (name: string) => (seedOf(name) % 23) - 11;

export default function Skills({groups}: {groups: Record<string, string[]>}) {
  const [filter, setFilter] = useState('All');
  const [dropped, setDropped] = useState<string[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const {mode} = useMotionMode();
  // Deduplicated: a tool can sit in a category and in the full tech stack, and
  // repeated names would collide as React keys inside AnimatePresence.
  const visible = [...new Set(filter === 'All' ? Object.values(groups).flat() : groups[filter] ?? [])];

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const drop = (name: string) => {
    if (mode === 'calm') return;
    clearTimeout(timers.current.get(name));
    setDropped(current => (current.includes(name) ? current : [...current, name]));
    timers.current.set(name, setTimeout(() => {
      timers.current.delete(name);
      setDropped(current => current.filter(item => item !== name));
    }, REST_MS));
  };

  const changeFilter = (group: string, chip: HTMLElement) => {
    clearTimers();
    setDropped([]);
    setFilter(group);
    if (mode === 'calm') return;
    // Imperative rather than an `animate` prop: clicking the already-selected
    // chip leaves every declarative value unchanged, so nothing would re-fire.
    animate(chip, {x: SHAKE_X, rotate: SHAKE_ROTATE}, {duration: dur.mid, ease: 'easeOut'});
  };

  return <>
    <div className="skill-filters">
      {['All', ...Object.keys(groups)].map(group =>
        <button type="button" className="chip" aria-pressed={filter === group} onClick={event => changeFilter(group, event.currentTarget)} key={group}>{group}</button>)}
    </div>
    <div className="skill-cloud">
      <AnimatePresence mode="popLayout">
        {visible.map((name, i) => {
          const isDown = dropped.includes(name);
          const tilt = tiltFor(name), drift = driftFor(name);
          return <motion.div layout className="skill-slot" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{...spring.ui, duration: dur.fast}} key={name}>
            <motion.button
              type="button"
              className={`skill-pill${isDown ? ' is-falling' : ''}`}
              onClick={() => drop(name)}
              // Tumble out, hit the floor, bounce once, settle — then spring home.
              animate={isDown
                ? {y: [0, FALL_PX, FALL_PX - BOUNCE_PX, FALL_PX], rotate: [0, tilt * 0.55, tilt, tilt], x: [0, drift * 0.6, drift, drift]}
                : {y: 0, rotate: 0, x: 0}}
              transition={isDown
                ? {duration: dur.reveal, times: [0, 0.58, 0.79, 1], ease: [EASE_FALL, 'easeOut', 'easeIn']}
                : {type: 'spring', ...spring.playful}}
            >
              <span aria-hidden="true">{GLYPHS[i % GLYPHS.length]}</span>{name}
            </motion.button>
          </motion.div>;
        })}
      </AnimatePresence>
    </div>
  </>;
}
