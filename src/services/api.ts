export interface IUser {
    id?: string;
    username: string;
    email?: string;
    password: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData: IUser) => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (response.status === 409) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return response.json()
};

export const loginUser = async (userData: IUser) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (response.status === 401) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return response.json();
};

export const callRefreshToken = async () => {
    const refresh = localStorage.getItem('refreshToken');
    // Call API to refresh token
    const response = await fetch('/api/users/refresh', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-refresh-token': JSON.stringify({refresh}),
        }
    });
    return response.json();
};

export const getUser = async (id: string) => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (response.status === 404) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return response.json();
}

