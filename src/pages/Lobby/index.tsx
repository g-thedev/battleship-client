import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './style.css';

const ENDPOINT = 'http://localhost:3000';

const Lobby = () => {
    const [lobbyUsers, setLobbyUsers] = useState<Record<string, any>>({});
    const [challengedUserId, setChallengedUserId] = useState<string>('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [showDisconnectedMessage, setShowDisconnectedMessage] = useState<boolean>(false);
    const [userReturned, setUserReturned] = useState<boolean>(false);

    const challengerUserId = localStorage.getItem('user_id');

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

            newSocket.on('lobbyUpdate', (users) => {
                setLobbyUsers(users);
            });

            newSocket.on('challenge-received', (data) => {
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
        if (challengedUserId && !lobbyUsers[challengedUserId]) {
            setChallengedUserId('');
            setTimeout(() => {
                if (!userReturned) {
                    setShowDisconnectedMessage(true);
                }
            }, 5000);
            setTimeout(() => {

                setShowDisconnectedMessage(false);

            }, 10000);
        }
    }, [challengedUserId, lobbyUsers, userReturned]);

    const handleUserSelection = (userId: string) => {
        setChallengedUserId(userId);
        setUserReturned(false);
    };

    const handleChallenge = () => {
        if (challengedUserId && socket) {
            socket.emit('challenge-request', { challengedUserId, challengerUserId });
            console.log(`Challenge request sent to ${lobbyUsers[challengedUserId].username}`);
        }
    };

    return (
        <div className='lobby'>
            <h1>Lobby</h1>
            <ul>
                {Object.values(lobbyUsers).filter(user => user.id !== challengerUserId).map((user) => (
                    <li key={user.id}>
                        <input
                            type='radio'
                            id={user.id}
                            name='userSelection'
                            value={user.id}
                            checked={challengedUserId === user.id}
                            onChange={() => handleUserSelection(user.id)}
                        />
                        <label htmlFor={user.id}>{user.username}</label>
                    </li>
                ))}
            </ul>
            {showDisconnectedMessage && (
                <p>Selected user has been disconnected!</p>
            )}
            {challengedUserId && lobbyUsers[challengedUserId] && (
                <div>
                    <p>Challenge {lobbyUsers[challengedUserId].username}?</p>
                    <button onClick={handleChallenge}>Confirm</button>
                </div>
            )}
        </div>
    );
};

export default Lobby;
