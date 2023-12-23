import React from 'react';
import './style.css';

interface Props {
    className?: string;
    text: string;
    onClick: () => void;
    disabled?: boolean;
}

const Button: React.FC<Props> = ({ className, text, onClick, disabled }) => {
    return (
        <button className={className} onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
};

export default Button;