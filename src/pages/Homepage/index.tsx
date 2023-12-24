import React from 'react';
import Button from '../../components/button';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import './style.css';

const Homepage: React.FC = () => {
    const currentUserId = localStorage.getItem('user_id');

    const { socket } = useSocket();
    const navigate = useNavigate(); 

    const handleJoinPvP = () => {
        socket?.emit('join_pvp_lobby', { userId: currentUserId });
        navigate('/lobby');
    }

    return (
        <div className='main-menu-container'>
            <div className='menu-nav'>
                <Button text="P v P" onClick={handleJoinPvP} />
                <div className='pvai-container'>
                    <Button className='player-vs-ai' text="P v AI" onClick={() => {navigate('/')}} disabled={true}/>
                    <p>Coming Soon!</p>
                </div>
            </div>
        </div>
    );
}

export default Homepage;