import { useState } from 'react';
import { Dashboard, SignUp, Login, History, Settings } from './pages';
import { Routes, Route } from "react-router-dom";


type PageType = 'signup' | 'login' | 'dashboard' | 'history' | 'settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/history" element={<History />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
