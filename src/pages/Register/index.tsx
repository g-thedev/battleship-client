import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';
import './style.css';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const navigate = useNavigate(); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await registerUser(formData);
            if (response.accessToken && response.refreshToken) {
                setSuccess('Registration successful. Redirecting to login page...');
            }
            
        } catch (error) {
            if (error instanceof Error) {
                console.error('Registration failed', error);
                setError(error.message);
            } else {
                console.error('An unexpected error occurred');
                setError('An unexpected error occurred');
            }
        }
    };

    useEffect(() => {
        if (success) {
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    });

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                setError('');
            }, 5000);
        }
    });

    return (
        <div className='registration-form'>
            { error && <p>{ error }</p> }
            { success && <p>{ success }</p> }
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

