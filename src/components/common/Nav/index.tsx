import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './style.css';
import { AuthContext } from '../../../context/AuthContext';

const NavBar: React.FC = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const location = useLocation();

    return (
        <div className="navbar-container">
            <div className="logo">
                <Link to="/">Battleship</Link>
            </div>
            <div className="nav">
                {isAuthenticated ? (
                    <button onClick={logout}>Logout</button>
                ) : (
                    <>
                        {location.pathname !== '/login' && <Link to="/login">Login</Link>}
                        {location.pathname !== '/register' && <Link to="/register">Register</Link>}
                    </>
                )}
            </div>
        </div>
    );
};

export default NavBar;
