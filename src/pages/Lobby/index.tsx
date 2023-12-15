import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './style.css';

const ENDPOINT = 'http://localhost:3000';

const Lobby = () => {
    const [lobbyUsers, setLobbyUsers] = useState<Record<string, any>>({});

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

    return (
        <div className='lobby'>
            <h1>Lobby</h1>
            <ul>
                {Object.values(lobbyUsers).filter(user => user.id !== currentUserId).map((user) => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
};

export default Lobby;
