
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NavBar from './components/common/Nav';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import Homepage from './pages/Homepage';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const auth = useAuth();
  return auth.isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
      <AuthProvider>
          <Router>
              <NavBar />
              <Routes>
                  <Route path="/" element={<PrivateRoute element={<Homepage />} />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  {/* Add other routes here */}
              </Routes>
          </Router>
      </AuthProvider>
  );
};

export default App;
