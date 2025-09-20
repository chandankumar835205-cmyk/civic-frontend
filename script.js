// The complete and updated script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const loginSelection = document.getElementById('login-selection');
    const adminLoginContainer = document.getElementById('admin-login-container');
    const deptLoginContainer = document.getElementById('dept-login-container');
    const staffLoginContainer = document.getElementById('staff-login-container');
    const showAdminLoginBtn = document.getElementById('show-admin-login');
    const showDeptLoginBtn = document.getElementById('show-dept-login');
    const showStaffLoginBtn = document.getElementById('show-staff-login');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const deptLoginForm = document.getElementById('deptLoginForm');
    const staffLoginForm = document.getElementById('staffLoginForm');
    const backButtons = document.querySelectorAll('.back-button');

    // --- UI Transition Functions ---
    const showForm = (formToShow) => {
        loginSelection.classList.add('opacity-0', 'hidden');
        formToShow.classList.remove('hidden');
        setTimeout(() => formToShow.classList.remove('opacity-0'), 10);
    };

    const showSelectionScreen = () => {
        [adminLoginContainer, deptLoginContainer, staffLoginContainer].forEach(c => {
            c.classList.add('opacity-0');
            setTimeout(() => c.classList.add('hidden'), 300);
        });
        loginSelection.classList.remove('hidden', 'opacity-0');
    };

    showAdminLoginBtn.addEventListener('click', () => showForm(adminLoginContainer));
    showDeptLoginBtn.addEventListener('click', () => showForm(deptLoginContainer));
    showStaffLoginBtn.addEventListener('click', () => showForm(staffLoginContainer));
    backButtons.forEach(button => button.addEventListener('click', showSelectionScreen));

    // --- Universal Login Handler ---
    const handleLogin = async (event, expectedRole) => {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Correctly select the message element
        const messageId = expectedRole === 'departhead' ? 'dept-message' : `${expectedRole}-message`;
        const messageEl = document.getElementById(messageId);

        messageEl.textContent = 'Signing In...';
        messageEl.className = 'message-area text-gray-600';
        submitButton.disabled = true;

        try {
            // Call the login function from api.js
            const { user_role } = await login(email, password); 
            
            // This frontend check is for user experience (UX), not security.
            if (user_role !== expectedRole) {
                throw new Error(`Access Denied. You do not have '${expectedRole}' permissions.`);
            }
            
            messageEl.textContent = 'Success! Redirecting...';
            messageEl.className = 'message-area text-green-600';

            // Redirect to the correct dashboard after a short delay
            setTimeout(() => {
                let dashboardUrl = `${expectedRole}-dashboard.html`;
                if (expectedRole === 'departhead') {
                    dashboardUrl = 'department-dashboard.html';
                }
                window.location.href = dashboardUrl;
            }, 1000);

        } catch (error) {
            messageEl.textContent = error.message;
            messageEl.className = 'message-area text-red-600';
            console.error('Login Error:', error);
        } finally {
            // Re-enable the button only if the login failed.
            // If successful, the page will redirect away.
            if (messageEl.classList.contains('text-red-600')) {
                submitButton.disabled = false;
            }
        }
    };
    
    // Attach the same handler to all forms
    adminLoginForm.addEventListener('submit', (e) => handleLogin(e, 'admin'));
    staffLoginForm.addEventListener('submit', (e) => handleLogin(e, 'staff'));
    deptLoginForm.addEventListener('submit', (e) => handleLogin(e, 'departhead'));
});