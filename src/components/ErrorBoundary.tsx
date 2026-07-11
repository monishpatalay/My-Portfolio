import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";

interface Props extends PropsWithChildren {
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error in component tree:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              color: "#fff",
              background: "#0b080c",
              textAlign: "center",
              padding: "24px",
            }}
          >
            <div>
              <p>Something went wrong loading this page.</p>
              <a href="/" style={{ color: "#c2a4ff" }}>
                Reload
              </a>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
