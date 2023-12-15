import React from 'react';
import Button from '../../components/button';
import { useNavigate } from 'react-router-dom';
import './style.css';

const Homepage: React.FC = () => {
    const navigate = useNavigate(); 

    return (
        <div className='main-menu-container'>
            <h1>Main Menu</h1>
            <div className='menu-nav'>
                <Button text="P v P" onClick={() => {navigate('/lobby')}} />
                <Button text="P v AI" onClick={() => {navigate('/')}} />
            </div>
        </div>
    );
}

export default Homepage;