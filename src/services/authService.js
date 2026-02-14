const API_URL = '/api/auth';

export const register = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return response.json();
};

export const verifyOtp = async (otpData) => {
    const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(otpData),
    });
    return response.json();
};

export const login = async (loginData) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    });
    return response.json();
};
export const forgotPassword = async (email) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    return response.json();
};

export const resetPassword = async (resetData) => {
    const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
    });
    return response.json();
};
