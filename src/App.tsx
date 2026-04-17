import { Routes, Route } from "react-router-dom";
import { Component, type ReactNode } from "react";
import Home from "./pages/Home";
import Share from "./pages/Share";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("React error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-primary text-lg mb-4">오류가 발생했습니다.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-2 rounded-xl bg-primary text-white"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/share" element={<Share />} />
      </Routes>
    </ErrorBoundary>
  );
}
