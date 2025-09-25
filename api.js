// frontend/api.js

// Use the base URL of your deployed WEB PORTAL backend.
// For local testing, this will be 'http://127.0.0.1:8000'.
// Replace with your actual Render URL when deployed.
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * A helper function to make authenticated requests to the API.
 * It automatically adds the JWT token to the headers.
 * @param {string} endpoint - The API endpoint to call (e.g., '/issues/').
 * @param {object} options - Optional fetch options (method, body, etc.).
 * @returns {Promise<any>} - The JSON response from the API.
 */
const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        // If the token is invalid or expired, the server will send a 401 error.
        // In that case, we automatically log the user out.
        if (response.status === 401) {
            logout();
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An API error occurred');
    }
    
    // For DELETE requests that return no content (204)
    if (response.status === 204) {
        return null;
    }
    
    return response.json();
};

// --- Authentication Functions ---

/**
 * Logs in a user and stores the token and role.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - The login response data.
 */
async function login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email); // The backend expects the email in the 'username' field
    formData.append('password', password);

    // CORRECTED: The endpoint is /token, not /token/employee
    const data = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    }).then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw new Error(err.detail); });
        }
        return res.json();
    });
    
    // CORRECTED: Storing data from the new, richer login response
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('userRole', data.user_role);
    localStorage.setItem('userEmail', data.user_email);
    return data;
}

/**
 * Logs the user out by clearing stored data and redirecting to the login page.
 */
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html'; // Or your main login page
}

/**
 * Retrieves the logged-in user's data from local storage.
 * @returns {object|null} - The user object or null if not logged in.
 */
function getLoggedInUser() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        return null;
    }
    return {
        token,
        role: localStorage.getItem('userRole'),
        email: localStorage.getItem('userEmail'),
    };
}


// --- User Information ---

/**
 * Fetches the details of the currently authenticated user.
 * @returns {Promise<object>} - The user's data (email, role, department).
 */
async function getMe() {
    // CORRECTED: The endpoint is /users/me, not /employees/me
    return request('/users/me/');
}


// --- Issue Management Functions ---

/**
 * Fetches a list of all issues.
 * @returns {Promise<Array>} - An array of issue objects.
 */
async function getIssues() {
    // CORRECTED: The endpoint is /issues/, not /issues/all/
    return request('/issues/');
}

/**
 * Updates the status of a specific issue.
 * @param {number} issueId - The ID of the issue to update.
 * @param {string} newStatus - The new status ('pending', 'in_progress', or 'resolved').
 * @returns {Promise<object>} - The updated issue object.
 */
async function updateIssueStatus(issueId, newStatus) {
    // CORRECTED: The endpoint is /issues/{id}, not /issues/{id}/status
    return request(`/issues/${issueId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
    });
}

/**
 * Deletes a specific issue. (Super Admin only).
 * @param {number | string} issueId - The ID of the issue to delete.
 * @returns {Promise<null>}
 */
async function deleteIssue(issueId) {
    // This endpoint now matches the new one added to the backend
    return request(`/issues/${issueId}`, {
        method: 'DELETE',
    });
}
