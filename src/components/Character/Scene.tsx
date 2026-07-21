import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (canvasDiv.current) {
      const rect = canvasDiv.current.getBoundingClientRect();
      const container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: THREE.Mesh | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      const { loadCharacter, getDisposeTimelines } = setCharacter(renderer, scene, camera, setLoading);

      let onResize: (() => void) | undefined;
      let isCancelled = false;
      let introTimeoutId: ReturnType<typeof setTimeout> | undefined;
      // setCharTimeline/setAllTimeline run again on every resize; without
      // tracking (and disposing) the previous run's cleanup here, each
      // resize leaked another interval + GSAP timeline that never stopped.
      let disposeCharTimelines: (() => void) | undefined;

      // The character load has no guaranteed upper bound (GPU shader
      // compilation in particular can occasionally hang on certain
      // driver/GPU combos), and nothing downstream had error handling, so
      // any failure or stall left the loading screen stuck forever with no
      // way out. hasCompletedLoading + the timeout guarantee the loading
      // screen always resolves, whether or not the model itself does.
      let hasCompletedLoading = false;
      const markLoadingComplete = () => {
        if (hasCompletedLoading || isCancelled) return;
        hasCompletedLoading = true;
        setLoading(100);
      };
      const loadTimeoutId = setTimeout(() => {
        console.warn("Character model is taking too long to load; continuing without waiting.");
        markLoadingComplete();
      }, 20000);

      loadCharacter()
        .then((gltf) => {
          if (isCancelled) {
            gltf?.scene.traverse((child) => {
              const mesh = child as THREE.Mesh;
              if (mesh.isMesh) {
                mesh.geometry?.dispose();
                const materials = Array.isArray(mesh.material)
                  ? mesh.material
                  : [mesh.material];
                materials.forEach((mat) => mat?.dispose());
              }
            });
            return;
          }
          if (gltf) {
            const animations = setAnimations(gltf);
            if (hoverDivRef.current) {
              animations.hover(gltf, hoverDivRef.current);
            }
            mixer = animations.mixer;
            const character = gltf.scene;
            scene.add(character);
            headBone = character.getObjectByName("spine006") || null;
            screenLight = (character.getObjectByName("screenlight") as THREE.Mesh) || null;
            introTimeoutId = setTimeout(() => {
              if (isCancelled) return;
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
            disposeCharTimelines = getDisposeTimelines();
            onResize = () => {
              disposeCharTimelines?.();
              disposeCharTimelines = handleResize(renderer, camera, canvasDiv, character);
            };
            window.addEventListener("resize", onResize);
          }
          markLoadingComplete();
        })
        .catch((error) => {
          console.error("Failed to load character model:", error);
          markLoadingComplete();
        })
        .finally(() => {
          clearTimeout(loadTimeoutId);
        });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      let animationFrameId: number;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        isCancelled = true;
        clearTimeout(loadTimeoutId);
        clearTimeout(introTimeoutId);
        disposeCharTimelines?.();
        cancelAnimationFrame(animationFrameId);
        clearTimeout(debounce);
        scene.clear();
        renderer.dispose();
        if (onResize) {
          window.removeEventListener("resize", onResize);
        }
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        document.removeEventListener("mousemove", onMouseMove);
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
