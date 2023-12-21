import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

export interface ConfirmationModalHandle {
    show: () => void;
}

const ConfirmationModal = forwardRef<ConfirmationModalHandle>((props, ref) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    useImperativeHandle(ref, () => ({
        show() {
            setShowModal(true);
        }
    }));

    if (!showModal) {
        return null;
    }

    const handleConfirm = () => {
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
