document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const loader = document.getElementById('loader');
    const dashboardContent = document.getElementById('dashboard-content');
    const adminEmailDisplay = document.getElementById('admin-email-display');
    const signOutBtn = document.getElementById('sign-out-btn');
    const issuesList = document.getElementById('issues-list');

    // --- Firebase Auth State Observer ---
    // This is the core of protecting the page.
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in.
            console.log('User is logged in:', user);
            
            // Show user's email
            adminEmailDisplay.textContent = user.email;

            // Hide loader and show the dashboard content
            loader.style.display = 'none';
            dashboardContent.classList.remove('content-hidden');

            // TODO: Fetch and display issues from Firestore
            
        } else {
            // No user is signed in.
            console.log('No user is logged in. Redirecting...');
            
            // Redirect them to the login page
            window.location.href = 'index.html';
        }
    });

    // --- Sign Out Button Logic ---
    signOutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            // Sign-out successful. The onAuthStateChanged observer will handle the redirect.
            console.log('User signed out successfully.');
        }).catch((error) => {
            // An error happened.
            console.error('Sign out error:', error);
            alert('Error signing out. Please try again.');
        });
    });
});
