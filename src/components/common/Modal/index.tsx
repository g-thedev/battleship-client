import { useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import './style.css';

export interface ConfirmationModalHandle {
    show: () => void;
}

const ConfirmationModal = forwardRef<ConfirmationModalHandle>((props, ref) => {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const currentUserId = localStorage.getItem('user_id');

    const roomId = localStorage.getItem('gameRoomId');

    useImperativeHandle(ref, () => ({
        show() {
            setShowModal(true);
        }
    }));

    if (!showModal) {
        return null;
    }

    const handleConfirm = () => {
        socket?.emit('leave_game', {roomId, playerId: currentUserId, currentRoom: location.pathname });
        navigate('/');
        setShowModal(false);
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <p>Are you sure you want to leave the game?</p>
                <div className="modal-button-container">
                    <button onClick={handleConfirm}>Confirm</button>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
});

export default ConfirmationModal;
