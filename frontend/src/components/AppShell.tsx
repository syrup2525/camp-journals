import { LogIn, LogOut, Plus, TentTree } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import bannerImage from '../assets/camping-banner.png';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#ded6c6] bg-[#fbfaf6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link className="focus-ring inline-flex items-center gap-2 rounded-md text-[#213127]" to="/">
            <span className="flex size-10 items-center justify-center rounded-md bg-[#31533b] text-white">
              <TentTree className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-black">캠핑 일지</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              className={({ isActive }) =>
                `focus-ring hidden rounded-md px-3 py-2 text-sm font-semibold sm:inline-flex ${
                  isActive ? 'bg-[#e4ecdf] text-[#31533b]' : 'text-[#526056] hover:bg-[#f0ede5]'
                }`
              }
              to="/"
            >
              목록
            </NavLink>
            {isAuthenticated ? (
              <>
                <Button icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => navigate('/journals/new')}>
                  새 일지
                </Button>
                <Button
                  aria-label="로그아웃"
                  className="px-3"
                  icon={<LogOut className="size-4" aria-hidden="true" />}
                  onClick={handleLogout}
                  variant="ghost"
                >
                  <span className="hidden sm:inline">{user?.displayName || user?.username}</span>
                </Button>
              </>
            ) : (
              <Button icon={<LogIn className="size-4" aria-hidden="true" />} onClick={() => navigate('/login')} variant="secondary">
                로그인
              </Button>
            )}
          </nav>
        </div>
      </header>

      <section
        className="app-banner min-h-[220px] border-b border-[#ded6c6]"
        style={{ '--banner-image': `url(${bannerImage})` } as React.CSSProperties}
      >
        <div className="mx-auto flex max-w-6xl flex-col justify-end px-4 py-10 text-white sm:min-h-[280px] sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f2c48b]">Camping Journal</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">캠핑 일지</h1>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

