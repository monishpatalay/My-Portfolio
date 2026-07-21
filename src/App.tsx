import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const Play = lazy(() => import("./pages/Play"));
import { LoadingProvider } from "./context/LoadingProvider";
import { SiteDataProvider } from "./context/SiteDataProvider";

const AppFallback = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#0b080c",
    }}
  />
);

const App = () => {
  return (
    <BrowserRouter>
      <SiteDataProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <LoadingProvider>
                <Suspense fallback={<AppFallback />}>
                  <MainContainer>
                    <Suspense fallback={null}>
                      <CharacterModel />
                    </Suspense>
                  </MainContainer>
                </Suspense>
              </LoadingProvider>
            </ErrorBoundary>
          }
        />
        <Route
          path="/myworks"
          element={
            <ErrorBoundary>
              <Suspense fallback={<div>Loading...</div>}>
                <MyWorks />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/play"
          element={
            <ErrorBoundary>
              <Suspense fallback={<div>Loading...</div>}>
                <Play />
              </Suspense>
            </ErrorBoundary>
          }
        />
      </Routes>
      </SiteDataProvider>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;
