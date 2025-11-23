import { useState } from 'react';

const AUTH_KEY = 'habitus_user_logged';
const USER_KEY = 'habitus_user_data';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const login = (user: User) => {
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    setIsAuthenticated(false);
  };

  const getUser = (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    const currentUser = getUser();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updatedData };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  return { isAuthenticated, login, logout, getUser, updateUser };
}
