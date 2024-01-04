interface ILobbyState {
    lobbyUsers: Record<string, any>;
    opponentId: string;
    challenger: {
        challengerUserId: string;
        challengerUsername: string;
    };
    isChallenger: boolean;
    message: string;
    countDown: number;
    redirectCountDown: number;
    showCountdown: boolean;
    showRedirectCountdown: boolean;
    showDisconnectedMessage: boolean;
    userReturned: boolean;
    isConfirmationButtonDisabled: boolean;
    countdownComplete: boolean;
    hideLobby: boolean;
    lastActionType: string;
    roomId: string;
}


type LobbyAction =
    | { type: 'SET_LOBBY_USERS'; payload: Record<string, any> }
    | { type: 'SET_OPPONENT_ID'; payload: string }
    | { type: 'SET_CHALLENGER'; payload: { challengerUserId: string; challengerUsername: string } }
    | { type: 'SET_IS_CHALLENGER'; payload: boolean }
    | { type: 'SET_MESSAGE'; payload: string }
    | { type: 'SET_COUNTDOWN'; payload: number }
    | { type: 'SET_REDIRECT_COUNTDOWN'; payload: number }
    | { type: 'SET_SHOW_COUNTDOWN'; payload: boolean }
    | { type: 'SET_SHOW_REDIRECT_COUNTDOWN'; payload: boolean }
    | { type: 'SET_SHOW_DISCONNECTED_MESSAGE'; payload: boolean }
    | { type: 'SET_USER_RETURNED'; payload: boolean }
    | { type: 'SET_IS_CONFIRMATION_BUTTON_DISABLED'; payload: boolean }
    | { type: 'SET_COUNTDOWN_COMPLETE'; payload: boolean }
    | { type: 'SET_HIDE_LOBBY'; payload: boolean }
    | { type: 'AUTO_REJECT_CHALLENGE' }
    | { type: 'CLEAR_MESSAGE' }
    | { type: 'CANCEL_CHALLENGE'; payload: any } 
    | { type: 'REJECT_CHALLENGE'; payload: { message: string } }
    | { type: 'UPDATE_ROOM_ID'; payload: string }
    | { type: 'DECREMENT_COUNTDOWN' };


export const initialState: ILobbyState = {
    lobbyUsers: {},
    opponentId: '',
    challenger: { challengerUserId: '', challengerUsername: '' },
    isChallenger: false,
    message: '',
    countDown: 30,
    redirectCountDown: 5,
    showCountdown: false,
    showRedirectCountdown: false,
    showDisconnectedMessage: false,
    userReturned: false,
    isConfirmationButtonDisabled: false,
    countdownComplete: false,
    hideLobby: false,
    lastActionType: '',
    roomId: '',
};


export function lobbyReducer(state: ILobbyState, action: LobbyAction): ILobbyState {
    switch (action.type) {
        case 'SET_LOBBY_USERS':
            return { ...state, lobbyUsers: action.payload.users };

        case 'SET_OPPONENT_ID':
            return { ...state, opponentId: action.payload };

        case 'SET_CHALLENGER':
            return { ...state, challenger: action.payload };

        case 'SET_IS_CHALLENGER':
            return { ...state, isChallenger: action.payload };
        
        case 'SET_MESSAGE':
            return { ...state, message: action.payload };
        
        case 'SET_COUNTDOWN':
            return { ...state, countDown: action.payload };
        
        case 'SET_REDIRECT_COUNTDOWN':
            return { ...state, redirectCountDown: action.payload };
        
        case 'SET_SHOW_COUNTDOWN':
            return { ...state, showCountdown: action.payload };
        
        case 'SET_SHOW_REDIRECT_COUNTDOWN':
            return { ...state, showRedirectCountdown: action.payload };
        
        case 'SET_SHOW_DISCONNECTED_MESSAGE':
            return { ...state, showDisconnectedMessage: action.payload };
        
        case 'SET_USER_RETURNED':
            return { ...state, userReturned: action.payload };
        
        case 'SET_IS_CONFIRMATION_BUTTON_DISABLED':
            return { ...state, isConfirmationButtonDisabled: action.payload };
        
        case 'SET_COUNTDOWN_COMPLETE':
            return { ...state, countdownComplete: action.payload };
        
        case 'SET_HIDE_LOBBY':
            return { ...state, hideLobby: action.payload };

        case 'CLEAR_MESSAGE':
            return {
                ...state,
                message: '',
            };
        
        case 'CANCEL_CHALLENGE':
        case 'REJECT_CHALLENGE':
            return {
                ...state,
                showCountdown: false,
                opponentId: '',
                isChallenger: false,
                challenger: { challengerUserId: '', challengerUsername: '' },
                countDown: 30,
                message: action.payload.message,
                lastActionType: action.type,
            };

        case 'UPDATE_ROOM_ID':
            return {
                ...state,
                roomId: action.payload,
            };

        case 'DECREMENT_COUNTDOWN':
            const newCountDown = state.countDown > 0 ? state.countDown - 1 : 0;
            return { ...state, countDown: newCountDown };

        default:
            return state;
    }
}
