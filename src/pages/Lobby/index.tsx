import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './style.css';

const ENDPOINT = 'http://localhost:3000';

const Lobby = () => {
    const [lobbyUsers, setLobbyUsers] = useState<Record<string, any>>({});
    const [selectedUser, setSelectedUser] = useState<string>('');

    const currentUserId = localStorage.getItem('user_id');

    useEffect(() => {
        // Retrieve the token from local storage
        const token = localStorage.getItem('accessToken'); // Replace 'tokenName' with your actual key

        // Initialize the socket only if the token exists
        if (token) {
            const socket: Socket = io(ENDPOINT, {
                auth: {
                    token: token,
                },
            });

            socket.on('lobbyUpdate', (users) => {
                setLobbyUsers(users);
            });

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            // Cleanup function to disconnect the socket when the component unmounts
            return () => {
                socket.disconnect();
            };
        }
    }, []);

    const handleUserSelection = (userId: string) => {
        setSelectedUser(userId);
    };

    const handleChallenge = () => {
        if (selectedUser) {
            console.log(`Challenge request send to ${lobbyUsers[selectedUser].username}`);
        }
    };

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
                            checked={selectedUser === user.id}
                            onChange={() => handleUserSelection(user.id)}
                        />
                        <label htmlFor={user.id}>{user.username}</label>
                    </li>
                ))}
            </ul>
            {selectedUser && (
                <div>
                    <p>Challenge {lobbyUsers[selectedUser].username}?</p>
                    <button onClick={handleChallenge}>Confirm</button>
                </div>
            )}
        </div>
    );
};

export default Lobby;
