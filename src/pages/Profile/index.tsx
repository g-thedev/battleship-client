import React, { useEffect } from 'react';
import { getUser } from '../../services/api';
import './style.css';

const ProfilePage: React.FC = () => {
    const [username, setUsername] = React.useState<string>('');

    useEffect(() => {
        // get userid from localstorage
        const userId = localStorage.getItem('user_id');
        const getUserData = async () => {
            if (userId) {
                const user = await getUser(userId);
                setUsername(user);
            }
        };
        getUserData();
    });

    return (
        <div className='profile'>
            <h1>Profile</h1>
            <h2>{ username }</h2>

        </div>
    );
};

export default ProfilePage;

