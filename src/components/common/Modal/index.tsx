import React from "react";
import "./style.css";

interface ConfirmationModalProps {
    showModal: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ showModal, onConfirm, onCancel }) => {
    if (!showModal) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <p>Are you sure you want to leave the game?</p>
                <div className="modal-button-container">
                    <button onClick={onConfirm}>Confirm</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;