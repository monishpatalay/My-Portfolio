import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

export default function handleResize(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  canvasDiv: React.RefObject<HTMLDivElement>,
  character: THREE.Object3D
): (() => void) | undefined {
  if (!canvasDiv.current) return undefined;
  const canvas3d = canvasDiv.current.getBoundingClientRect();
  const width = canvas3d.width;
  const height = canvas3d.height;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const workTrigger = ScrollTrigger.getById("work");
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger != workTrigger) {
      trigger.kill();
    }
  });
  // setCharTimeline/setAllTimeline start a fresh interval + GSAP timelines
  // every time they're called; the caller must dispose the ones from the
  // previous call (or the initial load) before/along with these, or every
  // resize leaks another set that never stops running.
  const charCleanup = setCharTimeline(character, camera);
  const allCleanup = setAllTimeline();
  return () => {
    charCleanup();
    allCleanup();
  };
}
