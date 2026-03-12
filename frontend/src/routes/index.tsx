import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Eager loading for critical routes
import Home from "../pages/Home";
import SignUp from "../pages/SignUp";
import Login from "../pages/Login";

// Lazy loading for MVP routes
const Encyclopedia = lazy(() => import("../pages/Encyclopedia"));
const Inventory = lazy(() => import("../pages/Inventory"));
const Accounting = lazy(() => import("../pages/Accounting"));
const MyPage = lazy(() => import("../pages/MyPage"));

// Lazy loading for other routes
const NotFound = lazy(() => import("../pages/NotFound"));

export function AppRoutes(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-gray-600">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/encyclopedia" element={<Encyclopedia />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
