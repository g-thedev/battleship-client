import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import ConfirmationModal from '../Modal';
import './style.css';

const NavBar: React.FC = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);

    const handleLeaveGame = () => {
        setShowModal(true);
    };

    const handleConfirm = () => {
        navigate('/');
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    return (
        <div className="navbar-container">
            <div className="logo">
                <Link to="/">Battleship</Link>
            </div>
            <div className="nav">
                {isAuthenticated ? (
                    <>
                        {location.pathname !== '/profile' && location.pathname !== '/lobby' && location.pathname !== '/game-setup' && location.pathname !== '/game-room' && <button onClick={() => navigate('/profile')}>Profile</button>}
                        {location.pathname !== '/' && location.pathname !== '/game-setup' && location.pathname !== '/game-room' && <button onClick={() => navigate('/')}>Main Menu</button>}
                        {location.pathname !== '/game-setup' && location.pathname !== '/game-room' && <button onClick={logout}>Logout</button>}
                        {(location.pathname === '/game-setup' || location.pathname === '/game-room') && <button onClick={handleLeaveGame}>Leave Game</button>}
                        <ConfirmationModal 
                            showModal={showModal} 
                            onConfirm={handleConfirm} 
                            onCancel={handleCancel} 
                        />
                    </>
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
