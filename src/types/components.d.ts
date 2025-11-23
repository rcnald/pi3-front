declare global {
  interface ProtectedRouteProps {
    children: React.ReactNode;
  }

  interface MainLayoutProps {
    children: React.ReactNode;
    activePage: 'goals' | 'progress' | 'settings';
  }

  type PageType = 'signup' | 'login' | 'dashboard' | 'history' | 'settings';
}

export {};
