// Image loading handler
function handleImageLoading() {
    const images = document.querySelectorAll('.gallery-item img, .collection-card img');
    
    images.forEach(img => {
        // Create container div if it doesn't exist
        if (!img.parentElement.classList.contains('img-container')) {
            const container = document.createElement('div');
            container.className = 'img-container loading';
            img.parentElement.insertBefore(container, img);
            container.appendChild(img);
        }
        
        const container = img.parentElement;
        
        if (img.complete) {
            container.classList.remove('loading');
            container.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                container.classList.remove('loading');
                container.classList.add('loaded');
            });
            
            img.addEventListener('error', () => {
                container.classList.remove('loading');
                container.classList.add('error');
                
                // Try fallback image if specified
                if (img.hasAttribute('data-fallback')) {
                    img.src = img.getAttribute('data-fallback');
                }
            });
        }
    });
}

// Call when DOM is loaded
document.addEventListener('DOMContentLoaded', handleImageLoading);
