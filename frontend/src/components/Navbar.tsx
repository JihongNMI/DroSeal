import { NavLink, useNavigate } from "react-router-dom";

export function Navbar(): JSX.Element {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const handleLogout = () => {
    // 로그아웃 시 토큰 제거
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    // 로그아웃 후 로그인 페이지로 리다이렉트
    navigate("/login");
  };
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <span className="text-white text-xl font-bold">DroSeal</span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/encyclopedia"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Encyclopedia
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Inventory
            </NavLink>
            <NavLink
              to="/accounting"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              간편 가계부
            </NavLink>
            {!token && (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  로그인
                </NavLink>
                {/* <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  회원가입
                </NavLink> */}
              </>
            )}
            {token && (
              <>
                <NavLink
                  to="/mypage"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  MyPage
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Navigation - Horizontal Scroll */}
          <div className="md:hidden flex-1 ml-4">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/encyclopedia"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                Encyclopedia
              </NavLink>
              <NavLink
                to="/inventory"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                Inventory
              </NavLink>
              <NavLink
                to="/accounting"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                간편 가계부
              </NavLink>
              <NavLink
                to="/mypage"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                My Page
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
