document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    let currentIndex = 0;
    let galleryItems = [];

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.gallery-item').forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Lightbox functionality
    function openLightbox(index) {
        galleryItems = Array.from(document.querySelectorAll('.gallery-item:not([style*="display: none"])'));
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
    }

    function updateLightboxContent() {
        const item = galleryItems[currentIndex];
        const img = item.querySelector('img');
        const caption = item.querySelector('figcaption');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = caption.textContent;
    }

    gallery.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const index = Array.from(galleryItems).indexOf(item);
            openLightbox(index);
        }
    });

    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxContent();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateLightboxContent();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape': 
                lightbox.classList.remove('active');
                break;
            case 'ArrowLeft':
                prevBtn.click();
                break;
            case 'ArrowRight':
                nextBtn.click();
                break;
        }
    });
});
