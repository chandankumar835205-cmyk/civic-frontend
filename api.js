// in api.js

const API_URL = 'https://saarthi-xjh6.onrender.com';

// This is a helper function to make authenticated requests
const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // If a token exists, add it to the Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        if (response.status === 401) { // Unauthorized
            logout(); // If token is invalid, log the user out
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An API error occurred');
    }
    
    if (response.status === 204) return; // For requests that don't return content
    
    return response.json();
};

// --- Authentication ---
// in api.js

async function login(email, password) {
    // 1. Create form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    // 2. Make the request without the 'Content-Type' header
    // The browser will automatically set it to 'application/x-www-form-urlencoded'
    const data = await request('/token', {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    
    // The rest of your function remains the same
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('userRole', data.user_role);
    localStorage.setItem('userEmail', email);
    return data;
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

function getLoggedInUser() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return {
        token,
        role: localStorage.getItem('userRole'),
        email: localStorage.getItem('userEmail'),
    };
}
// in api.js, add this function with the others

// --- User Information ---
async function getMe() {
    return request('/users/me');
}

// --- NEW: Issue Management Functions ---
async function getIssues(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return request(`/issues/?${queryParams}`);
}

async function updateIssueStatus(issueId, newStatus) {
    return request(`/issues/${issueId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
    });
}