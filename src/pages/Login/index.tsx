import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import './style.css';

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const auth = useAuth();
    const navigate = useNavigate(); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await loginUser(formData);
            if (response.token && response.user_id) {
                auth.login(response.token, response.user_id);
                navigate('/');
            }

        } catch (error) {
            console.error('Login failed', error);
            // TODO handle display  error
        }
    };

    return (
        <div className='login-form'>
            <h1>Login</h1>
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
            <button onClick={ handleSubmit }>Login</button>
        </div>
    );
};

export default LoginPage;

