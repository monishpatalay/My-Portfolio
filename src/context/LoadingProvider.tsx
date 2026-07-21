import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

const LoadingContext = createContext<LoadingType | null>(null);

// Module-scoped: survives SPA navigation (route unmount/remount) but resets
// on a real page reload, so the intro loader only plays on first open.
let hasCompletedIntro = false;

export function markIntroComplete() {
  hasCompletedIntro = true;
}

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(() => {
    // Skip loading on mobile, or if the intro already played this session
    if (hasCompletedIntro) return false;
    if (window.innerWidth <= 768) return false;
    return true;
  });
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };
  useEffect(() => {
    // isLoading is read from its initial value here (mount-only effect):
    // covers mobile (no 3D model) and returning to "/" after the intro
    // already completed once. The full desktop intro path calls
    // initialFX/markIntroComplete itself from Loading.tsx instead.
    if (isLoading) return;
    markIntroComplete();
    import("../components/utils/initialFX").then((module) => {
      if (module.initialFX) {
        setTimeout(() => {
          module.initialFX();
        }, 100);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
