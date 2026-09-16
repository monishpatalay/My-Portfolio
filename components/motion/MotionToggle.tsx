/**
 * MotionToggle — the P0 Full/Calm control (PRD §14.4, TM05). Always visible
 * beside nav, never behind an overflow menu, per PRD §13.22.
 */

"use client";

import { useMotionMode } from "@/lib/motion/governor";
import styles from "./MotionToggle.module.css";

const TIP_TURN_OFF = "Click to turn off animations";
const TIP_TURN_ON = "Click to turn on animations";

export default function MotionToggle() {
  const { mode, setMode } = useMotionMode();
  const isCalm = mode === "calm";

  return (
    <button
      type="button"
      className={`${styles.toggle} focus-ring`}
      aria-pressed={isCalm}
      aria-label={isCalm ? "Motion is off. Turn motion on." : "Motion is on. Turn motion off."}
      onClick={() => setMode(isCalm ? "full" : "calm")}
    >
      <span className={styles.dot} aria-hidden="true" />
      {isCalm ? "Calm" : "Full"}
      <span className={styles.tip} aria-hidden="true">
        {isCalm ? TIP_TURN_ON : TIP_TURN_OFF}
      </span>
    </button>
  );
}
