import React, { useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import ConfirmationModal, { ConfirmationModalHandle } from '../Modal';
import { useSocket } from '../../../context/SocketContext';
import './style.css';

const NavBar: React.FC = () => {
    const { socket } = useSocket();
    const { isAuthenticated, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const modalRef = useRef<ConfirmationModalHandle>(null);

    const handleMainMenuClick = () => {
        if (location.pathname === '/lobby') {
            const userId = localStorage.getItem('user_id');
            if (userId && socket) {
                // Emit the leave_pvp_lobby event when leaving the lobby
                socket.emit('leave_pvp_lobby', { userId });
            }
        }
        navigate('/');
    };

    const handleLeaveGame = () => {
        modalRef.current?.show();
    };


    return (
        <div className="navbar-container">
            <div className="logo">
                <Link to="/">Battleship</Link>
            </div>
            <div>
                {location.pathname === '/' && <h1>Main Menu</h1>}
                {location.pathname === '/lobby' && <h1>Lobby</h1>}
                {location.pathname === '/game-setup' && <h1>Place your ships!</h1>}
                {location.pathname === '/game-room' && <h1>Game Room</h1>}
            </div>
            <div className="nav">
                {isAuthenticated ? (
                    <>
                        {location.pathname !== '/profile' && location.pathname !== '/lobby' && location.pathname !== '/game-setup' && location.pathname !== '/game-room' && <button onClick={() => navigate('/profile')}>Profile</button>}
                        {location.pathname !== '/' && location.pathname !== '/game-setup' && location.pathname !== '/game-room' && <button onClick={handleMainMenuClick}>Main Menu</button>}
                        {location.pathname !== '/lobby' && location.pathname !== '/game-setup' && location.pathname !== '/game-room' && <button onClick={logout}>Logout</button>}
                        {(location.pathname === '/game-setup' || location.pathname === '/game-room') && <button onClick={handleLeaveGame}>Leave Game</button>}
                        <ConfirmationModal ref={ modalRef } />
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
