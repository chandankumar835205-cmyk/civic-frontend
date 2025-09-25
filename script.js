// frontend/script.js

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
        loginSelection.classList.add('opacity-0');
        setTimeout(() => {
            loginSelection.classList.add('hidden');
            formToShow.classList.remove('hidden');
            setTimeout(() => formToShow.classList.remove('opacity-0'), 10);
        }, 300);
    };

    const showSelectionScreen = (currentForm) => {
        currentForm.classList.add('opacity-0');
        setTimeout(() => {
            currentForm.classList.add('hidden');
            loginSelection.classList.remove('hidden');
            setTimeout(() => loginSelection.classList.remove('opacity-0'), 10);
        }, 300);
    };

    showAdminLoginBtn.addEventListener('click', () => showForm(adminLoginContainer));
    showDeptLoginBtn.addEventListener('click', () => showForm(deptLoginContainer));
    showStaffLoginBtn.addEventListener('click', () => showForm(staffLoginContainer));
    backButtons.forEach(button => {
        const parentForm = button.closest('.form-container');
        button.addEventListener('click', () => showSelectionScreen(parentForm));
    });

    // --- Universal Login Handler ---
    const handleLogin = async (event, expectedRole) => {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const submitButton = form.querySelector('button[type="submit"]');
        const messageEl = form.querySelector('.message-area');

        messageEl.textContent = 'Signing In...';
        messageEl.className = 'message-area text-gray-600';
        submitButton.disabled = true;

        try {
            const { user_role } = await login(email, password); 
            
            if (user_role !== expectedRole) {
                throw new Error(`Access Denied. Your account does not have '${expectedRole}' permissions.`);
            }
            
            messageEl.textContent = 'Success! Redirecting...';
            messageEl.className = 'message-area text-green-600';

            // --- CORRECTED REDIRECTION LOGIC ---
            setTimeout(() => {
                if (user_role === 'department_head') {
                    // Special case for department head to match the correct filename.
                    window.location.href = `department-dashboard.html`;
                } else {
                    // Handles 'super_admin', 'staff', etc.
                    window.location.href = `${user_role}-dashboard.html`;
                }
            }, 1000);

        } catch (error) {
            messageEl.textContent = error.message;
            messageEl.className = 'message-area text-red-600';
            submitButton.disabled = false;
        }
    };
    
    // Attach the handler to all forms with the CORRECT role names
    adminLoginForm.addEventListener('submit', (e) => handleLogin(e, 'super_admin'));
    staffLoginForm.addEventListener('submit', (e) => handleLogin(e, 'staff'));
    deptLoginForm.addEventListener('submit', (e) => handleLogin(e, 'department_head'));
});
