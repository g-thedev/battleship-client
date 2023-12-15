import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// import './style.css';

const LobbyPage: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate(); 

    return (
        <div>
            <h1>Lobby</h1>

        </div>
    );
};

export default LobbyPage;

