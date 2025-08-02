// Test data
const testBooks = [
    {
        id: 'test-1',
        title: 'The Great Adventure',
        author: 'John Smith',
        price: 24.99,
        image: 'images/books/adventure1.jpg'
    },
    {
        id: 'test-2',
        title: 'Mystery of the Lost Key',
        author: 'Sarah Johnson',
        price: 19.99,
        image: 'images/books/mystery1.jpg'
    }
];

// Test functions
async function testCart() {
    console.group('Cart Testing');
    
    // Clear any existing cart data
    sessionStorage.clear();
    console.log('Initial state cleared');

    // Initialize cart
    const cart = CartManager.init();
    console.log('Cart initialized');

    // Test 1: Add first item
    console.group('Test 1: Add first item');
    cart.addItem(testBooks[0]);
    console.log('Cart after adding first item:', cart.cart);
    console.log('Storage state:', JSON.parse(sessionStorage.getItem('cart')));
    console.log('Total items:', cart.cart.reduce((sum, item) => sum + item.quantity, 0));
    console.groupEnd();

    // Test 2: Add same item again
    console.group('Test 2: Add same item again');
    cart.addItem(testBooks[0]);
    console.log('Cart after adding same item:', cart.cart);
    console.log('First item quantity:', cart.cart[0].quantity);
    console.groupEnd();

    // Test 3: Add different item
    console.group('Test 3: Add different item');
    cart.addItem(testBooks[1]);
    console.log('Cart after adding different item:', cart.cart);
    console.log('Total items:', cart.cart.length);
    console.log('Total quantity:', cart.cart.reduce((sum, item) => sum + item.quantity, 0));
    console.groupEnd();

    // Test 4: Update quantity
    console.group('Test 4: Update quantity');
    cart.updateQuantity(testBooks[0].id, 5);
    console.log('Cart after updating quantity:', cart.cart);
    console.log('Updated item quantity:', cart.cart[0].quantity);
    console.groupEnd();

    // Test 5: Calculate total
    console.group('Test 5: Calculate total');
    const total = cart.getTotal();
    console.log('Cart total:', total);
    console.log('Expected total:', (testBooks[0].price * 5) + (testBooks[1].price * 1));
    console.groupEnd();

    // Test 6: Remove item
    console.group('Test 6: Remove item');
    cart.removeItem(testBooks[1].id);
    console.log('Cart after removing item:', cart.cart);
    console.log('Total items:', cart.cart.length);
    console.groupEnd();

    // Test 7: Process order
    console.group('Test 7: Process order');
    await cart.processOrder();
    console.log('Cart after processing:', cart.cart);
    console.log('Last order:', JSON.parse(sessionStorage.getItem('lastOrder')));
    console.groupEnd();

    // Test 8: Clear cart
    console.group('Test 8: Clear cart');
    cart.clear();
    console.log('Cart after clearing:', cart.cart);
    console.log('Storage state:', sessionStorage.getItem('cart'));
    console.groupEnd();

    console.groupEnd();
}

// Run tests
document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.createElement('button');
    testButton.textContent = 'Run Cart Tests';
    testButton.className = 'btn btn-primary';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '20px';
    testButton.style.right = '20px';
    testButton.style.zIndex = '9999';
    testButton.onclick = testCart;
    document.body.appendChild(testButton);
});
