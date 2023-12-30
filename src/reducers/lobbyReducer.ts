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
    | { type: 'SET_HIDE_LOBBY'; payload: boolean };


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
};


export function lobbyReducer(state: ILobbyState, action: LobbyAction): ILobbyState {
    switch (action.type) {
        case 'SET_LOBBY_USERS':
            return { ...state, lobbyUsers: action.payload };

        default:
            return state;
    }
}
