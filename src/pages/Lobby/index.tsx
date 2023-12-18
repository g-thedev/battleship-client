import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './style.css';

const ENDPOINT = 'http://localhost:3000';

const Lobby = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [lobbyUsers, setLobbyUsers] = useState<Record<string, any>>({});

    const currentUserId = localStorage.getItem('user_id');

    const [opponentId, setOpponentId] = useState<string>('');
    const [challenger, setChallenger] = useState<{ challengerUserId: string, challengedUserId: string }>({ challengerUserId: '', challengedUserId: '' });
    
    const [showDisconnectedMessage, setShowDisconnectedMessage] = useState<boolean>(false);
    const [userReturned, setUserReturned] = useState<boolean>(false);
    

    useEffect(() => {
        // Retrieve the token from local storage
        const token = localStorage.getItem('accessToken');

        // Initialize the socket only if the token exists
        if (token) {
            const newSocket: Socket = io(ENDPOINT, {
                auth: {
                    token: token,
                },
            });

            newSocket.on('update_lobby', (users) => {
                setLobbyUsers(users);
            });

            newSocket.on('challenge_received', (data) => {
                setChallenger(data);
                console.log('Challenge received:', data);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            // Set the socket state
            setSocket(newSocket);

            // Cleanup function to disconnect the socket when the component unmounts
            return () => {
                newSocket.disconnect();
            };
        }
    }, []);

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
