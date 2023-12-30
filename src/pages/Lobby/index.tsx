import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import { useSocket as socketContext } from '../../context/SocketContext';
import { lobbyReducer, initialState } from '../../reducers/lobbyReducer'
import './style.css';


const Lobby = () => {
    const navigate = useNavigate();
    const { socket } = socketContext();
    
    const currentUserId = localStorage.getItem('user_id');

    const [state, dispatch] = useReducer(lobbyReducer, initialState);

    const socketEventHandlers = {
        'update_lobby': (users: Record<string, any>) => dispatch({ type: 'SET_LOBBY_USERS', payload: { users } }),
        'challenge_received': (data: any) => dispatch({ type: 'SET_CHALLENGER', payload: data }),
        'challenge_accepted': () => dispatch({ type: 'SET_HIDE_LOBBY', payload: true }),
        'challenge_canceled': (data: any) => dispatch({ type: 'CANCEL_CHALLENGE', payload: data }),
        'challenge_rejected': (data: any) => dispatch({ type: 'REJECT_CHALLENGE', payload: data }),
        'challenge_unavailable': (data: any) => dispatch({ type: 'REJECT_CHALLENGE', payload: data }),
        'connect_error': (error: any) => console.error('Connection error:', error),
        'room_ready': (data: any) => {
            dispatch({ type: 'UPDATE_ROOM_ID', payload: data.roomId });
            dispatch({ type: 'SET_SHOW_REDIRECT_COUNTDOWN', payload: true });
            dispatch({ type: 'SET_REDIRECT_COUNTDOWN', payload: 5 });
        },

    };

    useEffect(() => {
        let messageTimeout: NodeJS.Timeout;
    
        if (state.message !== '') {
            messageTimeout = setTimeout(() => {
                if (state.lastActionType === 'CANCEL_CHALLENGE') {
                    dispatch({ type: 'CANCEL_CHALLENGE', payload: { message: '' } });
                } else if (state.lastActionType === 'REJECT_CHALLENGE') {
                    dispatch({ type: 'REJECT_CHALLENGE', payload: { message: '' } });
                }
            }, 5000);
        }
    
        return () => clearTimeout(messageTimeout);
    }, [state.message, state.lastActionType]);

    useEffect(() => {
        let redirectInterval: NodeJS.Timeout;

        if (state.showRedirectCountdown && state.redirectCountDown > 0) {
            redirectInterval = setInterval(() => {
                dispatch({ type: 'SET_REDIRECT_COUNTDOWN', payload: state.redirectCountDown - 1 });
            }, 1000);
        } else if (state.redirectCountDown === 0) {
            dispatch({ type: 'SET_COUNTDOWN_COMPLETE', payload: true });
        }

        return () => clearInterval(redirectInterval);
    }, [state.showRedirectCountdown, state.redirectCountDown, dispatch]);

    useEffect(() => {
        if (state.roomId) {
            localStorage.setItem('gameRoomId', state.roomId);
        }
    }, [state.roomId]);

    useEffect(() => {
        if (state.countdownComplete) {
            const roomId = localStorage.getItem('gameRoomId');
            navigate(`/game-setup?roomId=${roomId}`);
        }
    }, [state.countdownComplete, navigate]);
    

    useSocket(socketEventHandlers);

    useEffect(() => {
        localStorage.setItem('onLobbyPage', 'true');

        if (socket) {
            socket.emit('request_lobby_update');

            return () => {
                localStorage.removeItem('onLobbyPage');
            };
        }
    }, [socket, navigate]);

    // Manage navigation outside of the useEffect above to prevent
    // Cannot update a component (`BrowserRouter`) while rendering a different component (`Lobby`).

    const handleAutoRejectChallenge = () => {
        if (state.challenger && socket) {
            socket.emit('reject_challenge', { challengerUserId: state.challenger['challengerUserId'], challengedUserId: currentUserId });
            dispatch({ type: 'SET_SHOW_COUNTDOWN', payload: false });
            dispatch({ type: 'SET_MESSAGE', payload: 'Challenge auto-rejected due to timeout.' });
    
            
            setTimeout(() => {
                dispatch({ type: 'SET_MESSAGE', payload: '' }); 
            }, 5000);
    
            dispatch({ type: 'SET_CHALLENGER', payload: { challengerUserId: '', challengerUsername: '' } });
        }
    };

   
    useEffect(() => {
        let countdownInterval: NodeJS.Timeout;
    
        if (state.isChallenger) {
            dispatch({ type: 'SET_SHOW_COUNTDOWN', payload: true });
            dispatch({ type: 'SET_COUNTDOWN', payload: 30 });
    
            countdownInterval = setInterval(() => {
                dispatch({ type: 'DECREMENT_COUNTDOWN' });
    
                if (state.countDown <= 1) {
                    clearInterval(countdownInterval);
                    dispatch({ type: 'SET_SHOW_COUNTDOWN', payload: false });
                    dispatch({ type: 'SET_IS_CHALLENGER', payload: false });
                }
            }, 1000);
        }
    
        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [state.isChallenger, state.countDown]);
    
   
    useEffect(() => {
        let countdownInterval : NodeJS.Timeout;
    
        if (state.challenger.challengerUserId && currentUserId !== state.challenger.challengerUserId && !state.isChallenger) {
            dispatch({ type: 'SET_SHOW_COUNTDOWN', payload: true });
            dispatch({ type: 'SET_COUNTDOWN', payload: 30 });
    
            countdownInterval = setInterval(() => {
                dispatch({ type: 'DECREMENT_COUNTDOWN' });
    
                if (state.countDown <= 1) {
                    clearInterval(countdownInterval);
                    dispatch({ type: 'SET_SHOW_COUNTDOWN', payload: false });
                    handleAutoRejectChallenge();
                }
            }, 1000);
        }
    
        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [state.challenger.challengerUserId, currentUserId, state.isChallenger, state.countDown, dispatch]);
    


    // TODO - Add a useEffect hook to handle the user returning to the lobby
    //       after being disconnected due to reloading the page or closing the tab

    // useEffect(() => {
    //     if (opponentId && !lobbyUsers[opponentId]) {
    //         setOpponentId('');
    //         setTimeout(() => {
    //             if (!userReturned) {
    //                 setShowDisconnectedMessage(true);
    //             }
    //         }, 5000);
    //         setTimeout(() => {

    //             setShowDisconnectedMessage(false);

    //         }, 10000);
    //     }
    // }, [opponentId, lobbyUsers, userReturned]);

    const handleUserSelection = (userId: string) => {
        dispatch({ type: 'SET_OPPONENT_ID', payload: userId });
        dispatch({ type: 'SET_USER_RETURNED', payload: false });
    };
    
    const handleChallenge = () => {
        if (state.opponentId && socket) {
            dispatch({ type: 'SET_IS_CHALLENGER', payload: true });
            dispatch({ type: 'SET_IS_CONFIRMATION_BUTTON_DISABLED', payload: true });
            socket.emit('request_challenge', { challengedUserId: state.opponentId, challengerUserId: currentUserId });
        }
    };
    

    const handleAcceptChallenge = () => {
        if (state.challenger && socket) {
            socket.emit('accept_challenge', { challengerUserId: state.challenger.challengerUserId, challengedUserId: currentUserId });
        }
    };
    

    const handleRejectChallenge = () => {
        if (state.challenger && socket) {
            dispatch({ type: 'SET_CHALLENGER', payload: { challengerUserId: '', challengerUsername: '' } });
            socket.emit('reject_challenge', { challengerUserId: state.challenger.challengerUserId, challengedUserId: currentUserId });
            dispatch({ type: 'SET_SHOW_COUNTDOWN', payload: false });
            dispatch({ type: 'SET_COUNTDOWN', payload: 30 });
        }
    };
    

    const handleCancelChallenge = () => {
        if (state.opponentId && socket) {
            if (state.isChallenger && state.showCountdown) {
                socket.emit('cancel_challenge', { challengerUserId: currentUserId, challengedUserId: state.opponentId });
                dispatch({ type: 'SET_IS_CHALLENGER', payload: false });
                dispatch({ type: 'SET_SHOW_COUNTDOWN', payload: false });
                dispatch({ type: 'SET_COUNTDOWN', payload: 30 });
                dispatch({ type: 'SET_IS_CONFIRMATION_BUTTON_DISABLED', payload: false });
            }
        }
        dispatch({ type: 'SET_OPPONENT_ID', payload: '' });
    };    

    let availableUsers = Object.values(state.lobbyUsers)
        .filter(user => user.id !== currentUserId && !user.inPendingChallenge);

    const areUsersAvailable = availableUsers.length > 0;

    return (
        <div className='lobby'>
            <div className="gutter"></div>
            <div className="wrapper">
                <div className='status-bar'>
                    {state.message && <p>{state.message}</p>}
                    {state.showCountdown && (<p>Challenge expires in {state.countDown} seconds</p>)}
                    {state.showRedirectCountdown && <p>Challenge confirmed! Moving to game setup in {state.redirectCountDown} seconds...</p>}
                </div>
                {console.log('lobby users:',state.lobbyUsers)}
                {console.log(availableUsers)}
                {console.log(availableUsers[0])}
                {areUsersAvailable ? (
                    <ul className={state.hideLobby ? 'hide' : ''}>
                        {availableUsers.map((user) => (
                            <li key={user.id}>
                                <input
                                    type="radio"
                                    id={user.id}
                                    name="userSelection"
                                    value={user.id}
                                    checked={state.opponentId === user.id}
                                    onChange={() => handleUserSelection(user.id)}
                                    disabled={!!state.challenger.challengerUserId || !!state.opponentId}
                                />
                                <label htmlFor={user.id}>{user.username}</label>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users available</p>
                )}
                {state.showDisconnectedMessage && (
                    <p>Selected user has been disconnected!</p>
                )}
                {state.challenger && state.challenger.challengerUserId && (
                    <div className='confirmation'>
                        <p>{state.challenger.challengerUsername} has challenged you!</p>
                        <button onClick={handleAcceptChallenge}>Accept</button>
                        <button onClick={handleRejectChallenge}>Reject</button>
                    </div>
                )}
                {state.opponentId && state.lobbyUsers[state.opponentId] && (
                    <div className='confirmation'>
                        <p>Challenge {state.lobbyUsers[state.opponentId].username}?</p>
                        <button className='confirm-button' onClick={handleChallenge} disabled={state.isConfirmationButtonDisabled}>Confirm</button>
                        <button onClick={handleCancelChallenge}>Cancel</button>
                    </div>
                )}
            </div>
            <div className="gutter"></div>
        </div>
    );
    
};

export default Lobby;
