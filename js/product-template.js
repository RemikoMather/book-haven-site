// Product template renderer
export function renderProductCard(product) {
    return `
        <div class="gallery-item" data-product-id="${product.id}">
            <div class="img-container">
                <img src="${product.imageUrl}" 
                     alt="${product.title}" 
                     loading="lazy"
                     data-fallback="/images/book-placeholder.jpg">
            </div>
            <h3>${product.title}</h3>
            <p class="book-author">By ${product.author}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button class="btn add-to-cart" data-product-id="${product.id}">
                Add to Cart
            </button>
            <figcaption class="book-description">${product.description}</figcaption>
        </div>
    `;
}
