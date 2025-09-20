// The refactored staff-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const userGreeting = document.getElementById('user-greeting');
    const logoutButton = document.getElementById('logout-button');
    const issuesContainer = document.getElementById('issues-container');
    const loader = document.getElementById('loader');
    const noIssuesMessage = document.getElementById('no-issues-message');

    // --- 1. Authentication Check ---
    // Instead of onAuthStateChanged, we use our helper to check for a token.
    const user = getLoggedInUser();
    if (!user || user.role !== 'staff') {
        // If no token, or if the user is not a staff member, redirect.
        window.location.href = 'index.html';
        return; // Stop executing the rest of the script
    }
    userGreeting.textContent = `Welcome, ${user.email}`;

    // --- 2. Main Data Fetching Function ---
    async function loadPendingIssues() {
        loader.style.display = 'block';
        noIssuesMessage.classList.add('hidden');
        issuesContainer.innerHTML = ''; // Clear previous issues
        try {
            // Use our new API helper to get issues with a 'Pending Review' status.
            // NOTE: Your old code used 'Pending Review'. Our new backend uses 'Pending'. Let's use that.
            const pendingIssues = await getIssues({ status: 'Pending' });
            renderIssues(pendingIssues);
        } catch (error) {
            console.error('Failed to fetch pending issues:', error);
            loader.style.display = 'none';
            issuesContainer.innerHTML = `<p class="text-red-500 text-center">Could not load issues. Error: ${error.message}</p>`;
        }
    }
    
    // --- 3. Render Issues on the Page ---
    function renderIssues(issues) {
        loader.style.display = 'none';

        if (issues.length === 0) {
            noIssuesMessage.classList.remove('hidden');
        } else {
            noIssuesMessage.classList.add('hidden');
            issues.forEach(issue => {
                const issueCard = createIssueCard(issue);
                issuesContainer.appendChild(issueCard);
            });
        }
    }

    // --- 4. Create Issue Card HTML ---
    function createIssueCard(issue) {
        const card = document.createElement('div');
        card.className = 'issue-card';
        const submittedDate = new Date(issue.created_at).toLocaleString('en-IN');

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">${issue.title}</h3>
                    <p class="text-sm text-gray-500">Location: ${issue.location}</p>
                    <p class="text-sm text-gray-500">Submitted on: ${submittedDate}</p>
                </div>
                <span class="badge">${issue.department}</span>
            </div>
            <p class="text-gray-700 my-3">${issue.description}</p>
            <div class="mt-4 pt-4 border-t">
                <h4 class="font-semibold mb-2">Update Status:</h4>
                <div class="flex gap-2">
                    <button class="status-btn btn accent" data-id="${issue.id}" data-status="In Progress">Mark In Progress</button>
                    <button class="status-btn btn" data-id="${issue.id}" data-status="Resolved">Mark Resolved</button>
                </div>
            </div>
        `;
        return card;
    }
    
    // --- 5. Event Listener for Clicks ---
    issuesContainer.addEventListener('click', async (e) => {
        if (e.target.matches('.status-btn')) {
            const button = e.target;
            const issueId = button.dataset.id;
            const newStatus = button.dataset.status;

            if (issueId && newStatus) {
                button.textContent = 'Updating...';
                button.disabled = true;
                try {
                    // Use our new API helper to update the status
                    await updateIssue(issueId, { status: newStatus });
                    // Refresh the list to show the change
                    loadPendingIssues(); 
                } catch (error) {
                    console.error("Error updating status:", error);
                    alert(`Could not update the issue: ${error.message}`);
                    button.textContent = `Mark ${newStatus}`;
                    button.disabled = false;
                }
            }
        }
    });

    // --- 6. Logout Button ---
    logoutButton.addEventListener('click', () => {
        logout(); // This is the logout function from api.js
    });

    // --- INITIAL LOAD ---
    loadPendingIssues();
});