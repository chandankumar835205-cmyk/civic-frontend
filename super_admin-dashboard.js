// frontend/super_admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const userEmailDisplay = document.getElementById('user-email-display');
    const signOutBtn = document.getElementById('sign-out-btn');
    const issuesTableBody = document.getElementById('issues-table-body');
    const departmentFilter = document.getElementById('department-filter');
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    let allIssues = []; // Local cache for issues
    let issueToDeleteId = null;

    // --- 1. Authentication Check ---
    const user = getLoggedInUser();
    if (!user || user.role !== 'super_admin') {
        window.location.href = 'index.html';
        return;
    }
    userEmailDisplay.textContent = user.email;

    // --- 2. Data Fetching and Rendering ---

    async function initializeDashboard() {
        try {
            allIssues = await getIssues(); // From api.js
            populateDepartmentFilter(allIssues);
            renderIssues(allIssues);
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            issuesTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">${error.message}</td></tr>`;
        }
    }

    function populateDepartmentFilter(issues) {
        const departments = [...new Set(issues.map(issue => issue.department))];
        departments.sort();
        departmentFilter.innerHTML = '<option value="all">All Departments</option>'; // Reset
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });
    }

    function renderIssues(issues) {
        issuesTableBody.innerHTML = '';
        if (issues.length === 0) {
            issuesTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No issues found.</td></tr>`;
            return;
        }

        issues.forEach(issue => {
            const statusClass = issue.status.toLowerCase().replace(' ', '-');
            const row = document.createElement('tr');
            row.id = `issue-row-${issue.id}`;
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${issue.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="font-semibold">${issue.description}</div>
                    <div class="text-gray-500">${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${issue.department}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="status-badge status-${statusClass}">${issue.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                    <button class="delete-btn text-red-600 hover:text-red-900" data-id="${issue.id}" title="Delete Issue">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    </button>
                </td>
            `;
            issuesTableBody.appendChild(row);
        });
    }

    // --- 3. Event Handlers ---
    
    departmentFilter.addEventListener('change', () => {
        const selectedDept = departmentFilter.value;
        const filteredIssues = (selectedDept === 'all')
            ? allIssues
            : allIssues.filter(issue => issue.department === selectedDept);
        renderIssues(filteredIssues);
    });

    issuesTableBody.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            issueToDeleteId = deleteButton.dataset.id;
            deleteModal.classList.remove('hidden');
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
        issueToDeleteId = null;
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (issueToDeleteId) {
            confirmDeleteBtn.textContent = 'Deleting...';
            confirmDeleteBtn.disabled = true;
            try {
                await deleteIssue(issueToDeleteId); // From api.js
                // Remove from local cache and re-render for instant feedback
                allIssues = allIssues.filter(issue => issue.id !== parseInt(issueToDeleteId));
                renderIssues(allIssues.filter(issue => departmentFilter.value === 'all' || issue.department === departmentFilter.value));
                populateDepartmentFilter(allIssues);
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                deleteModal.classList.add('hidden');
                issueToDeleteId = null;
                confirmDeleteBtn.textContent = 'Delete';
                confirmDeleteBtn.disabled = false;
            }
        }
    });

    signOutBtn.addEventListener('click', logout); // From api.js

    // --- 4. Initial Load ---
    initializeDashboard();
});

