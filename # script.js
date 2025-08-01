/* script.js */
function handleSubscribe() {
  const email = document.getElementById("subscribeEmail").value;
  if (email && /\S+@\S+\.\S+/.test(email)) {
    alert("Thank you for subscribing");
  } else {
    alert("Please enter a valid email address.");
  }
}

function addToCart(itemName) {
  let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  cart.push(itemName);
  sessionStorage.setItem("cart", JSON.stringify(cart));
  alert("Item added to the cart");
}

function viewCart() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  document.getElementById("cartModal").innerText = cart.length ? cart.join(", ") : "Cart is empty";
}

function clearCart() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  if (cart.length) {
    sessionStorage.removeItem("cart");
    alert("Cart cleared");
    viewCart();
  } else {
    alert("No items to clear");
  }
}

function processOrder() {
  const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
  if (cart.length) {
    alert("Thank you for your order");
    sessionStorage.removeItem("cart");
    viewCart();
  } else {
    alert("Cart is empty");
  }
}

function submitContactForm(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;
  if (name && email && message) {
    localStorage.setItem("contactForm", JSON.stringify({ name, email, message }));
    alert("Thank you for your message");
  } else {
    alert("Please fill in all fields");
  }
}


