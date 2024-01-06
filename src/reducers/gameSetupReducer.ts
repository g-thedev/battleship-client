const initialShipsState = {
    carrier: [],
    battleship: [],
    cruiser: [],
    submarine: [],
    destroyer: []
};

interface IGameSetupState {
    countDown: number;
    redirectCountDown: number;
    gameCancelled: string;
    opponentReady: string;
    opponenetReset: boolean;
    isReadyButtonDisabled: boolean;
    showGameStart: boolean;
    firstPlayer: string;
    countdownComplete: boolean;
    ships: Record<string, any>;
    currentShip: string;
}

type GameSetupAction =
    | { type: 'SET_COUNTDOWN'; payload: number }
    | { type: 'SET_REDIRECT_COUNTDOWN'; payload: number }
    | { type: 'SET_GAME_CANCELLED'; payload: string }
    | { type: 'SET_OPPONENT_READY'; payload: string }
    | { type: 'SET_OPPONENT_RESET'; payload: boolean }
    | { type: 'SET_IS_READY_BUTTON_DISABLED'; payload: boolean }
    | { type: 'SET_SHOW_GAME_START'; payload: boolean }
    | { type: 'SET_FIRST_PLAYER'; payload: string }
    | { type: 'SET_COUNTDOWN_COMPLETE'; payload: boolean }
    | { type: 'SET_CURRENT_SHIP'; payload: string }
    | { type: 'UPDATE_ROOM_ID'; payload: string };

export const initialState: IGameSetupState = {
    countDown: 30,
    redirectCountDown: 5,
    gameCancelled: '',
    opponentReady: '',
    opponenetReset: false,
    isReadyButtonDisabled: false,
    showGameStart: false,
    firstPlayer: '',
    countdownComplete: false,
    ships: initialShipsState,
    currentShip: '',
};

export const gameSetupReducer = (state: IGameSetupState, action: GameSetupAction) => {
    switch (action.type) {
        case 'SET_COUNTDOWN': {
            return {
                ...state,
                countDown: action.payload
            };
        }
        case 'SET_REDIRECT_COUNTDOWN': {
            return {
                ...state,
                redirectCountDown: action.payload
            };
        }
        case 'SET_GAME_CANCELLED': {
            return {
                ...state,
                gameCancelled: action.payload
            };
        }
        case 'SET_OPPONENT_READY': {
            return {
                ...state,
                opponentReady: action.payload
            };
        }
        case 'SET_OPPONENT_RESET': {
            return {
                ...state,
                opponenetReset: action.payload
            };
        }
        case 'SET_IS_READY_BUTTON_DISABLED': {
            return {
                ...state,
                isReadyButtonDisabled: action.payload
            };
        }
        case 'SET_SHOW_GAME_START': {
            return {
                ...state,
                showGameStart: action.payload
            };
        }
        case 'SET_FIRST_PLAYER': {
            return {
                ...state,
                firstPlayer: action.payload
            };
        }
        case 'SET_COUNTDOWN_COMPLETE': {
            return {
                ...state,
                countdownComplete: action.payload
            };
        }
        case 'SET_CURRENT_SHIP': {
            return {
                ...state,
                currentShip: action.payload
            };
        }
        case 'UPDATE_ROOM_ID': {
            return {
                ...state,
                roomId: action.payload
            };
        }
        
        
        default: {
            return state;
        }
    }
}

