interface IWinner {
    username: string;
    winnerId: string;
    message?: string;
  }

interface IGameRoomState {
    currentPlayerTurn: boolean;
    gameOver: boolean;
    winner: IWinner;
    countDown: number;
    shipSunk: string;
}