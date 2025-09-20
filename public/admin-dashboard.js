// The refactored admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const userEmailDisplay = document.getElementById('user-email-display');
    const signOutBtn = document.getElementById('sign-out-btn');
    const departmentCardsContainer = document.getElementById('department-cards-container');
    // Note: We'll handle the toast/reminder functionality in a later step if needed.

    // --- 1. Authentication Check ---
    const user = getLoggedInUser();
    if (!user || user.role !== 'admin') {
        // If no token, or if the user is not an admin, redirect to login.
        window.location.href = 'index.html';
        return; 
    }
    userEmailDisplay.textContent = user.email;

    // --- 2. Main Analytics Function ---
    async function loadAnalyticsData() {
        try {
            // Use our API helper to get ALL issues (no filters)
            const allIssues = await getIssues();
            
            // Calculate stats on the frontend
            const departmentStats = {};
            allIssues.forEach(issue => {
                const dept = issue.department || 'Unassigned';
                if (!departmentStats[dept]) {
                    departmentStats[dept] = { total: 0, pending: 0, inProgress: 0, resolved: 0 };
                }
                departmentStats[dept].total++;
                if (issue.status === 'Pending') {
                    departmentStats[dept].pending++;
                } else if (issue.status === 'In Progress') {
                    departmentStats[dept].inProgress++;
                } else if (issue.status === 'Resolved') {
                    departmentStats[dept].resolved++;
                }
            });

            renderDepartmentCards(departmentStats);

        } catch (error) {
            console.error("Error loading analytics data:", error);
            departmentCardsContainer.innerHTML = `<p class="text-red-500">Error loading analytics: ${error.message}</p>`;
        }
    }

    // --- 3. UI RENDERING FUNCTION ---
    function renderDepartmentCards(stats) {
        departmentCardsContainer.innerHTML = '';
        const sortedDepartments = Object.keys(stats).sort();

        if (sortedDepartments.length === 0) {
            departmentCardsContainer.innerHTML = `<p class="text-gray-500">No issues have been reported yet.</p>`;
            return;
        }

        for (const departmentName of sortedDepartments) {
            const data = stats[departmentName];
            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-lg shadow-md border';
            card.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-900 mb-4">${departmentName}</h3>
                <div class="space-y-2 text-gray-700">
                    <p class="flex justify-between">Total Issues: <span class="font-bold text-slate-800">${data.total}</span></p>
                    <p class="flex justify-between">Pending / In Progress: <span class="font-bold text-yellow-500">${data.pending + data.inProgress}</span></p>
                    <p class="flex justify-between">Resolved: <span class="font-bold text-green-500">${data.resolved}</span></p>
                </div>
                <div class="mt-6 border-t pt-4">
                     <button data-dept="${departmentName}" class="reminder-btn w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900">
                        Send Reminder
                    </button>
                </div>
            `;
            departmentCardsContainer.appendChild(card);
        }
    }

    // --- 4. Event Listeners ---
    signOutBtn.addEventListener('click', () => {
        logout(); // From api.js
    });

    departmentCardsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.reminder-btn')) {
            const department = e.target.dataset.dept;
            // NOTE: We have not built a '/reminders' endpoint in the backend yet.
            // This button won't do anything until we add that feature.
            alert(`Reminder button for ${department} clicked! (Feature to be built)`);
        }
    });

    // --- INITIAL LOAD ---
    loadAnalyticsData();
});