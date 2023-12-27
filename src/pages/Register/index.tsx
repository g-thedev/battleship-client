import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';
import './style.css';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const navigate = useNavigate(); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await registerUser(formData);
            if (response.accessToken && response.refreshToken) {
                navigate('/login');
            }
            
        } catch (error) {
            console.error('Registration failed', error);
            // TODO handle display  error
        }
    };

    return (
        <div className='registration-form'>
            <h1>Register</h1>
            <input
                type="text"
                placeholder="Username"
                name="username"
                value={ formData.username }
                onChange={ handleChange }
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={ formData.password }
                onChange={ handleChange }
                required
            />
            <button onClick={ handleSubmit }>Register</button>
        </div>
    );
};

export default RegisterPage;

