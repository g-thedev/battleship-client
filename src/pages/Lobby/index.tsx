import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import './style.css';

const Lobby = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    
    const [lobbyUsers, setLobbyUsers] = useState<Record<string, any>>({});

    const currentUserId = localStorage.getItem('user_id');

    const [opponentId, setOpponentId] = useState<string>('');
    const [challenger, setChallenger] = useState<{ challengerUserId: string, challengerUsername: string }>({ challengerUserId: '', challengerUsername: '' });
    
    const [showDisconnectedMessage, setShowDisconnectedMessage] = useState<boolean>(false);
    const [userReturned, setUserReturned] = useState<boolean>(false);
    

    useEffect(() => {
        if (socket) {

            socket.on('update_lobby', (users) => {
                setLobbyUsers(users);
            });

            socket.on('challenge_received', (data) => {
                setChallenger(data);
                console.log('Challenge received:', data);
            });

            socket.on('challenge_accepted', (data) => {
                console.log('Challenge accepted:', data);
            });

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            socket.on('room_ready', (data) => {
                console.log('Room ready:', data);
                navigate(`/game-setup?roomId=${data.roomId}`);
            });
    
            // Cleanup when component unmounts
            return () => {
                socket.off('update_lobby');
                socket.off('challenge_received');
                socket.off('challenge_accepted');
                socket.off('connect_error');
                socket.off('room_ready');
            };
        }
    }, [socket, navigate]);

    // TODO - Add a useEffect hook to handle the user returning to the lobby
    //       after being disconnected due to reloading the page or closing the tab

    useEffect(() => {
        if (opponentId && !lobbyUsers[opponentId]) {
            setOpponentId('');
            setTimeout(() => {
                if (!userReturned) {
                    setShowDisconnectedMessage(true);
                }
            }, 5000);
            setTimeout(() => {

                setShowDisconnectedMessage(false);

            }, 10000);
        }
    }, [opponentId, lobbyUsers, userReturned]);

    const handleUserSelection = (userId: string) => {
        setOpponentId(userId);
        setUserReturned(false);
    };

    const handleChallenge = () => {
        if (opponentId && socket) {
            socket.emit('request_challenge', { challengedUserId: opponentId, challengerUserId: currentUserId });
            console.log(`Challenge request sent to ${lobbyUsers[opponentId].username}`);
        }
    };

    const handleAcceptChallenge = () => {
        if (challenger && socket) {
            socket.emit('accept_challenge', { challengerUserId: challenger['challengerUserId'], challengedUserId: currentUserId });
            console.log('Challenge accepted');
        }
    }

    return (
        <div className='lobby'>
            <h1>Lobby</h1>
            <ul>
                {Object.values(lobbyUsers).filter(user => user.id !== currentUserId).map((user) => (
                    <li key={user.id}>
                        <input
                            type='radio'
                            id={user.id}
                            name='userSelection'
                            value={user.id}
                            checked={opponentId === user.id}
                            onChange={() => handleUserSelection(user.id)}
                        />
                        <label htmlFor={user.id}>{user.username}</label>
                    </li>
                ))}
            </ul>
            {showDisconnectedMessage && (
                <p>Selected user has been disconnected!</p>
            )}
            {challenger && challenger.challengerUserId && (
                <div>
                    <p>{challenger.challengerUsername} has challenged you!</p>
                    <button onClick={handleAcceptChallenge}>Accept</button>
                </div>
            )}
            {opponentId && lobbyUsers[opponentId] && (
                <div>
                    <p>Challenge {lobbyUsers[opponentId].username}?</p>
                    <button onClick={handleChallenge}>Confirm</button>
                </div>
            )}
        </div>
    );
};

export default Lobby;
