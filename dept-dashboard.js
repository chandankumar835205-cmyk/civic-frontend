// frontend/dept-dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- ELEMENT REFERENCES ---
    const userEmailDisplay = document.getElementById('user-email-display');
    const departmentNameDisplay = document.getElementById('department-name');
    const signOutBtn = document.getElementById('sign-out-btn');
    const issuesList = document.getElementById('issues-list');
    const loader = document.getElementById('loader');
    
    // --- 1. Authentication & User Data Fetching ---
    const user = getLoggedInUser();
    // CORRECTED: Role name now matches the backend's 'department_head'
    if (!user || user.role !== 'department_head') {
        window.location.href = 'index.html';
        return;
    }
    
    userEmailDisplay.textContent = user.email;

    try {
        // CORRECTED: Call the correct function from api.js to get user details
        const employeeData = await getMe(); 
        const userDepartment = employeeData.department;

        if (!userDepartment) {
            loader.style.display = 'none';
            issuesList.innerHTML = `<p class="text-red-500 text-center">Error: Your account is not assigned to a department.</p>`;
            return;
        }

        departmentNameDisplay.textContent = `${userDepartment} Department`;
        await loadDepartmentIssues(userDepartment);

    } catch (error) {
        console.error("Failed to get user data:", error);
        loader.style.display = 'none';
        issuesList.innerHTML = `<p class="text-red-500 text-center">Failed to load dashboard. Your session may have expired.</p>`;
    }
    
    // --- 2. Main Data Fetching Function ---
    async function loadDepartmentIssues(department) {
        loader.style.display = 'block';
        issuesList.innerHTML = '';
        try {
            // The backend automatically filters issues for department_head users
            const issues = await getIssues(); 
            renderIssues(issues);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
            issuesList.innerHTML = `<p class="text-red-500 text-center">Could not load issues: ${error.message}</p>`;
        }
    }

    // --- 3. Render Issues on the Page ---
    function renderIssues(issues) {
        loader.style.display = 'none';
        
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
        card.className = 'bg-white p-4 rounded-lg shadow-md border flex flex-col gap-3';
        const submittedDate = new Date(issue.submitted_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

        let statusColorClass = 'text-yellow-600 bg-yellow-100'; // Default for 'pending'
        if (issue.status === 'in_progress') statusColorClass = 'text-blue-600 bg-blue-100';
        if (issue.status === 'resolved') statusColorClass = 'text-green-600 bg-green-100';
        
        // CORRECTED: Use the correct data fields from the backend (description, latitude, etc.)
        card.innerHTML = `
            <div class="flex justify-between items-start gap-4">
                <div>
                    <p class="font-semibold text-gray-800">${issue.description}</p>
                    <p class="text-sm text-gray-500">Location: ${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}</p>
                    <p class="text-sm text-gray-500">Submitted: ${submittedDate}</p>
                </div>
                <div class="text-right flex-shrink-0">
                     <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusColorClass}">${issue.status.replace('_', ' ')}</span>
                </div>
            </div>
             <div class="flex flex-wrap gap-2">
                ${issue.photo_url ? `<a href="${issue.photo_url}" target="_blank" class="text-sm text-blue-600 hover:underline">View Photo</a>` : ''}
                ${issue.audio_url ? `<a href="${issue.audio_url}" target="_blank" class="text-sm text-blue-600 hover:underline">Play Audio</a>` : ''}
            </div>
            <div class="border-t pt-3 flex justify-end items-center gap-3">
                <!-- CORRECTED: Status values now match backend Enum (e.g., 'in_progress') -->
                <button data-id="${issue.id}" data-status="in_progress" class="btn secondary py-1 px-3 text-sm">Mark In Progress</button>
                <button data-id="${issue.id}" data-status="resolved" class="btn accent py-1 px-3 text-sm">Mark as Resolved</button>
            </div>
        `;
        return card;
    }

    // --- 5. Event Listeners ---
    issuesList.addEventListener('click', async (e) => {
        const button = e.target.closest('button[data-id]');
        if (!button) return;

        const issueId = button.dataset.id;
        const newStatus = button.dataset.status;
        
        if (issueId && newStatus) {
            const userDepartment = departmentNameDisplay.textContent.replace(' Department', '');
            button.textContent = 'Updating...';
            button.disabled = true;
            try {
                await updateIssueStatus(issueId, newStatus); 
                await loadDepartmentIssues(userDepartment); // Refresh the list after update
            } catch (error) {
                alert(`Failed to update status: ${error.message}`);
                // Button will be re-enabled by the refresh
            }
        }
    });

    signOutBtn.addEventListener('click', logout);
});

