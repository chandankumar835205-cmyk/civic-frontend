// The complete and final dept-dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- ELEMENT REFERENCES ---
    const userEmailDisplay = document.getElementById('user-email-display');
    const departmentNameDisplay = document.getElementById('department-name');
    const signOutBtn = document.getElementById('sign-out-btn');
    const issuesList = document.getElementById('issues-list');
    const loader = document.getElementById('loader');
    const dashboardContent = document.getElementById('dashboard-content');

    // --- 1. Authentication & User Data Fetching ---
    const user = getLoggedInUser();
    if (!user || user.role !== 'departhead') {
        window.location.href = 'index.html';
        return;
    }

    try {
        // NEW: Call /users/me to get the user's specific department
        const userData = await getMe(); 
        const userDepartment = userData.department;

        // If for some reason the department head has no department, show an error.
        if (!userDepartment) {
            loader.style.display = 'none';
            dashboardContent.classList.remove('content-hidden');
            issuesList.innerHTML = `<p class="text-red-500 text-center">Error: Your user is not assigned to a department.</p>`;
            return;
        }

        // Update UI with dynamic data
        userEmailDisplay.textContent = userData.email;
        departmentNameDisplay.textContent = userDepartment;
        
        // Now that we have the department, load their issues
        await loadDepartmentIssues(userDepartment);

    } catch (error) {
        console.error("Failed to get user data:", error);
        // If the token is invalid, the request helper in api.js will auto-logout.
    }
    
    // --- 2. Main Data Fetching Function ---
    async function loadDepartmentIssues(department) {
        issuesList.innerHTML = '<p class="text-gray-500">Loading issues...</p>';
        try {
            const issues = await getIssues({ department: department });
            renderIssues(issues);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
            issuesList.innerHTML = `<p class="text-red-500 text-center">Could not load issues.</p>`;
        }
    }

    // --- 3. Render Issues on the Page ---
    function renderIssues(issues) {
        loader.style.display = 'none';
        dashboardContent.classList.remove('content-hidden');
        issuesList.innerHTML = ''; // Clear the list

        if (issues.length === 0) {
            issuesList.innerHTML = `<p class="text-gray-500 text-center py-4">No active issues are currently assigned to your department.</p>`;
            return;
        }

        issues.forEach(issue => {
            const issueCard = createIssueCard(issue);
            issuesList.appendChild(issueCard);
        });
    }

    // --- 4. Create Issue Card HTML ---
    function createIssueCard(issue) {
        const card = document.createElement('div');
        card.className = 'issue-card bg-white p-4 rounded-lg shadow-md border flex flex-col gap-3 transition-all duration-200';
        const submittedDate = new Date(issue.created_at).toLocaleString('en-IN');

        let statusColor = 'text-blue-600'; // Pending
        if (issue.status === 'In Progress') statusColor = 'text-yellow-600';
        if (issue.status === 'Resolved') statusColor = 'text-green-600';
        
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold text-gray-800">${issue.title}</p>
                    <p class="text-sm text-gray-500">Location: ${issue.location}</p>
                    <p class="text-sm text-gray-500">Submitted: ${submittedDate}</p>
                </div>
                <div class="text-right">
                     <p class="text-sm text-gray-500">Status:</p>
                     <span class="font-medium ${statusColor}">${issue.status}</span>
                </div>
            </div>
            <div class="border-t pt-3 flex justify-end items-center gap-3">
                <button data-id="${issue.id}" class="inprogress-btn py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none">
                    Mark In Progress
                </button>
                <button data-id="${issue.id}" class="resolve-btn py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                    Mark as Resolved
                </button>
            </div>
        `;
        return card;
    }

    // --- 5. Event Listeners ---
    issuesList.addEventListener('click', async (e) => {
        const button = e.target;
        const issueId = button.dataset.id;
        if (!issueId) return;

        let newStatus = null;
        if (button.matches('.inprogress-btn')) newStatus = 'In Progress';
        if (button.matches('.resolve-btn')) newStatus = 'Resolved';
        
        if (newStatus) {
            const userDepartment = departmentNameDisplay.textContent; // Get current department from UI
            button.textContent = 'Updating...';
            button.disabled = true;
            try {
                // The updateIssueStatus function in api.js already exists and works
                await updateIssueStatus(issueId, newStatus); 
                await loadDepartmentIssues(userDepartment); // Refresh list after update
            } catch (error) {
                alert(`Failed to update status: ${error.message}`);
                // No need to re-enable button as the whole list will refresh
            }
        }
    });

    signOutBtn.addEventListener('click', () => {
        logout(); // From api.js
    });
});