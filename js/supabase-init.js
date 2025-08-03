// Initialize Supabase globally
window.initSupabase = () => {
    try {
        window.supabase = window.Supabase || window.supabase;
        console.log('DEBUG: Supabase global object initialized');
    } catch (error) {
        console.error('DEBUG: Failed to initialize global Supabase object:', error);
    }
};
