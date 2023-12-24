import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import './style.css';
// import NodeJS from 'node';


const Lobby = () => {
    const navigate = useNavigate();
    const { socket, updateRoomId } = useSocket();
    
    const [lobbyUsers, setLobbyUsers] = useState<Record<string, any>>({});

    const currentUserId = localStorage.getItem('user_id');

    const [opponentId, setOpponentId] = useState<string>('');
    const [challenger, setChallenger] = useState<{ challengerUserId: string, challengerUsername: string }>({ challengerUserId: '', challengerUsername: '' });
    const [isChallenger, setIsChallenger] = useState(false);

    const [message, setMessage] = useState<string>('');

    const [countDown, setCountDown] = useState(30); // Countdown state
    const [showCountdown, setShowCountdown] = useState(false); // State to control countdown display

    
    const [showDisconnectedMessage, setShowDisconnectedMessage] = useState<boolean>(false);
    const [userReturned, setUserReturned] = useState<boolean>(false);
    

    useEffect(() => {
        const onChallengeRejected = (data: { message: any; }) => {
            setOpponentId('');
            setMessage(`${data.message}`);
    
            setTimeout(() => {
                setMessage('');
            }, 5000);
        };


        if (socket) {

            socket.on('update_lobby', (users) => {
                setLobbyUsers(users);
                if (opponentId && users[opponentId].inPendingChallenge) {
                    setOpponentId('');
                }
            });

            socket.on('challenge_received', (data) => {
                setChallenger(data);
            });

            socket.on('challenge_accepted', (data) => {
                console.log('Challenge accepted:', data);
            });

            socket.on('challenge_rejected', onChallengeRejected);

            socket.on('challenge_unavailable', onChallengeRejected);

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            socket.on('room_ready', (data) => {
                if (updateRoomId) {
                    updateRoomId(data.roomId);
                }
                navigate(`/game-setup?roomId=${data.roomId}`);
            });
    
            // Cleanup when component unmounts
            return () => {
                socket.off('update_lobby');
                socket.off('challenge_received');
                socket.off('challenge_accepted');
                socket.off('challenge_rejected', onChallengeRejected);
                socket.off('challenge_unavailable', onChallengeRejected);
                socket.off('connect_error');
                socket.off('room_ready');
            };
        }
    }, [socket, navigate]);

    const handleAutoRejectChallenge = () => {
        if (challenger && socket) {
            socket.emit('reject_challenge', { challengerUserId: challenger['challengerUserId'], challengedUserId: currentUserId });
            setShowCountdown(false); // Hide the countdown
            setMessage('Challenge auto-rejected due to timeout.'); // Set the timeout message
    
            // Use setTimeout to clear the message after 5 seconds
            setTimeout(() => {
                setMessage(''); // Clear the message
            }, 5000);
    
            setChallenger({ challengerUserId: '', challengerUsername: '' }); // Reset challenger info
        }
    };

// Countdown useEffect for the challenger
useEffect(() => {
    let timer: number;
    if (isChallenger) {
        setShowCountdown(true);
        setCountDown(30); // Reset countdown to 30 seconds
        timer = setInterval(() => {
            setCountDown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(timer); // Clear the interval timer
                    setShowCountdown(false); // Hide the countdown message
                    setIsChallenger(false); // Reset challenger status
                    return 0; // Set countdown to 0 and stop
                }
                return prevCount - 1;
            });
        }, 1000);
    }

    // Cleanup function for challenger
    return () => {
        clearInterval(timer);
    };
}, [isChallenger]);

// Countdown useEffect for the challenged
useEffect(() => {
    let timer: number;
    if (challenger.challengerUserId && currentUserId !== challenger.challengerUserId && !isChallenger) {
        setShowCountdown(true);
        setCountDown(30); // Reset countdown to 30 seconds
        timer = setInterval(() => {
            setCountDown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(timer); // Clear the interval timer
                    setShowCountdown(false); // Hide the countdown message
                    handleAutoRejectChallenge(); // Auto reject challenge
                    return 0; // Set countdown to 0 and stop
                }
                return prevCount - 1;
            });
        }, 1000);
    }

    // Cleanup function for challenged
    return () => {
        clearInterval(timer);
    };
}, [challenger.challengerUserId, currentUserId]);


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
            setIsChallenger(true);
            socket.emit('request_challenge', { challengedUserId: opponentId, challengerUserId: currentUserId });
        }
    };

    const handleAcceptChallenge = () => {
        if (challenger && socket) {
            socket.emit('accept_challenge', { challengerUserId: challenger['challengerUserId'], challengedUserId: currentUserId });
        }
    }

    const handleRejectChallenge = () => {
        if (challenger && socket) {
            challenger && setChallenger({ challengerUserId: '', challengerUsername: '' });
            socket.emit('reject_challenge', { challengerUserId: challenger['challengerUserId'], challengedUserId: currentUserId });
        }
    }

    return (
        <div className='lobby'>
            <ul>
                <div className='status-bar'>
                    {message && <p>{message}</p>}
                    {showCountdown && (
                <p>Challenge expires in {countDown} seconds</p>
            )}
                </div>
                {Object.values(lobbyUsers)
                    .filter(user => user.id !== currentUserId && !user.inPendingChallenge) 
                    .map((user) => (
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
                    ))
                }
                </ul>
            {showDisconnectedMessage && (
                <p>Selected user has been disconnected!</p>
            )}
            {challenger && challenger.challengerUserId && (
                <div className='confirmation'>
                    <p>{challenger.challengerUsername} has challenged you!</p>
                    <button onClick={handleAcceptChallenge}>Accept</button>
                    <button onClick={handleRejectChallenge}>Reject</button>
                </div>
            )}
            {opponentId && lobbyUsers[opponentId] && (
                <div className='confirmation'>
                    <p>Challenge {lobbyUsers[opponentId].username}?</p>
                    <button onClick={handleChallenge}>Confirm</button>
                    <button onClick={() => setOpponentId('')}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default Lobby;
