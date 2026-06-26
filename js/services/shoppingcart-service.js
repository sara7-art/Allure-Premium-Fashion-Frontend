let cartService;

class ShoppingCartService {

    cart = {
        items: [],
        total: 0
    };

    subtotal = 0;

    addToCart(productId) {

        const url = `${config.baseUrl}/cart/products/${productId}`;

        axios.post(url, {})
            .then(response => {

                this.setCart(response.data);

                this.updateCartDisplay();

            })
            .catch(() => {

                templateBuilder.append(
                    "error",
                    { error: "Add to cart failed." },
                    "errors"
                );

            });
    }

    setCart(data) {

        this.cart = {
            items: [],
            total: data.total
        };

        for (const [, value] of Object.entries(data.items)) {
            this.cart.items.push(value);
        }
    }

    loadCart() {

        axios.get(`${config.baseUrl}/cart`)
            .then(response => {

                this.setCart(response.data);

                this.updateCartDisplay();

            })
            .catch(() => {

                templateBuilder.append(
                    "error",
                    { error: "Load cart failed." },
                    "errors"
                );

            });
    }

    loadCartPage() {

        const main = document.getElementById("main");

        main.innerHTML = "";

        const filterBox = document.createElement("div");
        filterBox.className = "filter-box";

        main.appendChild(filterBox);

        const content = document.createElement("div");
        content.className = "content-form";

        const header = document.createElement("div");
        header.className = "cart-header";

        const title = document.createElement("h1");
        title.innerText = "Shopping Cart";

        header.appendChild(title);

        const clearBtn = document.createElement("button");

        clearBtn.className = "btn btn-danger";

        clearBtn.innerText = "Clear Cart";

        clearBtn.onclick = () => this.clearCart();

        header.appendChild(clearBtn);

        content.appendChild(header);

        this.cart.items.forEach(item => {

            this.buildItem(item, content);

        });

        this.buildOrderSummary(content);

        main.appendChild(content);

    }
    buildItem(item, parent) {

        const card = document.createElement("div");
        card.className = "cart-item";

        card.innerHTML = `

            <h4>${item.product.name}</h4>

            <div class="photo">

                <img
                    src="/images/products/${item.product.imageUrl}"
                    alt="${item.product.name}">

                <h4 class="price">
                    $${item.product.price.toFixed(2)}
                </h4>

            </div>

            <div class="description">

                ${item.product.description}

            </div>

            <div class="quantity">

                Quantity: ${item.quantity}

            </div>

        `;

        const image = card.querySelector("img");

        image.addEventListener("click", () => {

            showImageDetailForm(
                item.product.name,
                image.src
            );

        });

        parent.appendChild(card);

    }

    buildOrderSummary(parent) {

        this.subtotal = 0;

        this.cart.items.forEach(item => {

            this.subtotal +=
                item.product.price * item.quantity;

        });

        const shipping = 0;

        const tax = this.subtotal * 0.10;

        const total =
            this.subtotal +
            shipping +
            tax;

        const summary =
            document.createElement("div");

        summary.className = "order-summary";

        summary.innerHTML = `

            <h2>Order Summary</h2>

            <hr>

            <p>

                <strong>Subtotal:</strong>

                $${this.subtotal.toFixed(2)}

            </p>

            <p>

                <strong>Shipping:</strong>

                FREE

            </p>

            <p>

                <strong>Tax:</strong>

                $${tax.toFixed(2)}

            </p>

            <hr>

            <h3>

                Total:

                $${total.toFixed(2)}

            </h3>

            <button
                class="btn btn-success mt-3"
                onclick="cartService.showCheckout()">

                Proceed to Checkout

            </button>

        `;

        parent.appendChild(summary);

    }
    showCheckout() {

        const tax = this.subtotal * 0.10;

        const shipping = 0;

        const total = this.subtotal + tax + shipping;

        const main = document.getElementById("main");

        main.innerHTML = `

        <div class="checkout-page">

            <h1>Checkout</h1>

            <div class="checkout-section">

                <h3>Shipping Address</h3>

                <input
                    class="form-control mb-3"
                    placeholder="Full Name">

                <input
                    class="form-control mb-3"
                    placeholder="Street Address">

                <input
                    class="form-control mb-3"
                    placeholder="City">

                <input
                    class="form-control mb-3"
                    placeholder="State">

                <input
                    class="form-control mb-4"
                    placeholder="ZIP Code">

                <h3>Shipping Method</h3>

                <select
                    id="shipping-method"
                    class="form-select mb-4"
                    onchange="cartService.updateCheckoutTotal()">

                    <option value="0">
                        Standard Shipping (5-7 Business Days) - FREE
                    </option>

                    <option value="9.99">
                        Express Shipping (1-2 Business Days) - $9.99
                    </option>

                    <option value="19.99">
                        Overnight Shipping - $19.99
                    </option>

                </select>

                <h3>Payment Information</h3>

                <input
                    class="form-control mb-3"
                    placeholder="Card Number">

                <input
                    class="form-control mb-3"
                    placeholder="Expiration Date">

                <input
                    class="form-control mb-4"
                    placeholder="CVV">

            </div>

            <div class="order-summary">

                <h2>Order Summary</h2>

                <p>

                    Subtotal:

                    <strong>
                        $${this.subtotal.toFixed(2)}
                    </strong>

                </p>

                <p>

                    Tax:

                    <strong>
                        $${tax.toFixed(2)}
                    </strong>

                </p>

                <p>

                    Shipping:

                    <strong id="shipping-price">
                        FREE
                    </strong>

                </p>

                <hr>

                <h3>

                    Total:

                    <span id="checkout-total">

                        $${total.toFixed(2)}

                    </span>

                </h3>

                <button
                    class="btn btn-success w-100 mt-3"
                    onclick="cartService.placeOrder()">

                    Place Order

                </button>

            </div>

        </div>

        `;

    }

    updateCheckoutTotal() {

        const shipping = parseFloat(
            document.getElementById("shipping-method").value
        );

        const tax = this.subtotal * 0.10;

        const total =
            this.subtotal +
            tax +
            shipping;

        document.getElementById("shipping-price").innerText =
            shipping === 0
                ? "FREE"
                : "$" + shipping.toFixed(2);

        document.getElementById("checkout-total").innerText =
            "$" + total.toFixed(2);

    }

    placeOrder() {

        axios.post(`${config.baseUrl}/orders`)
            .then(() => {

                alert("🎉 Thank you! Your order has been placed.");

                this.loadCart();

                loadHome();

            })
            .catch(() => {

                templateBuilder.append(
                    "error",
                    {
                        error: "Checkout failed."
                    },
                    "errors"
                );

            });

    }
    clearCart() {

        const url = `${config.baseUrl}/cart`;

        axios.delete(url)
            .then(response => {
                this.cart = {
                    items: [],
                    total: 0
                }

                this.cart.total = response.data.total;

                for (const [key, value] of Object.entries(response.data.items)) {
                    this.cart.items.push(value);
                }

                this.updateCartDisplay()
                this.loadCartPage()

            })
            .catch(error => {

                const data = {
                    error: "Empty cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })
    }

    updateCartDisplay() {
        try {
            const itemCount = this.cart.items.length;
            const cartControl = document.getElementById("cart-items")

            cartControl.innerText = itemCount;
        } catch (e) {

        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    cartService = new ShoppingCartService();

    if (userService.isLoggedIn()) {
        cartService.loadCart();
    }

});

    const subtotal = this.cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const shipping = 9.99;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    const main = document.getElementById("main");

    main.innerHTML = `
        <div class="checkout-page">

            <h1>Checkout</h1>

            <div class="checkout-section">

                <h3>Shipping Address</h3>

                <input class="form-control mb-3"
                    placeholder="Full Name">

                <input class="form-control mb-3"
                    placeholder="Street Address">

                <input class="form-control mb-3"
                    placeholder="City">

                <input class="form-control mb-3"
                    placeholder="State">

                <input class="form-control mb-4"
                    placeholder="ZIP Code">

                <h3>Shipping Method</h3>

                <select id="shipping-method"
                        class="form-select mb-4"
                        onchange="cartService.updateCheckoutTotal()">

                    <option value="0">
                        Standard (FREE)
                    </option>

                    <option value="9.99">
                        Express ($9.99)
                    </option>

                    <option value="19.99">
                        Overnight ($19.99)
                    </option>

                </select>

                <h3>Payment</h3>

                <input class="form-control mb-3"
                    placeholder="Card Number">

                <input class="form-control mb-3"
                    placeholder="Expiration">

                <input class="form-control mb-4"
                    placeholder="CVV">

            </div>

            <div class="order-summary">

                <h2>Order Summary</h2>

                <p>Subtotal:
                    <strong>$${this.subtotal.toFixed(2)}</strong>
                </p>

                <p>Tax:
                    <strong>$${tax.toFixed(2)}</strong>
                </p>

                <p>
                    Shipping:
                 <strong id="shipping-price">
                  FREE
                 </strong>
                </p>

                <hr>

                <h3>
                    Total:
                    <span id="checkout-total">
                        $${total.toFixed(2)}
                    </span>
                </h3>

                <button
                    class="btn btn-success w-100 mt-3"
                    onclick="cartService.placeOrder()">

                    Place Order

                </button>

            </div>

         </div>
       `;

    updateCheckoutTotal()
{
    const shipping = parseFloat(
        document.getElementById("shipping-method").value
    );

    const tax = this.subtotal * 0.10;

    const total =
        this.subtotal +
        tax +
        shipping;

    document.getElementById("shipping-price").innerText =
        shipping === 0
            ? "FREE"
            : "$" + shipping.toFixed(2);

    document.getElementById("checkout-total").innerText =
        "$" + total.toFixed(2);

}

placeOrder()

function loadOrders() {

}

{
    const url = `${config.baseUrl}/orders`;

    axios.post(url)
        .then(response => {

            alert("🎉 Order placed successfully!");

            // Reload the cart from the server
            this.loadCart();

            // Go to My Orders (we'll build this next)
            // this.loadOrders();

            this.loadOrders();

        })
        .catch(error => {

            templateBuilder.append("error",
                {
                    error: "Checkout failed."
                },
                "errors");

            console.error(error);

        });

    loadOrders()
    {
        alert("loadOrders() called");

    axios.get(`${config.baseUrl}/orders`)
        .then(response => {

            const orders = response.data;

            const main = document.getElementById("main");

            main.innerHTML = `
                <h1 class="mb-4">My Orders</h1>
            `;

            if (orders.length === 0) {

                main.innerHTML += `
                    <div class="alert alert-info">

                        You haven't placed any orders yet.

                    </div>
                `;

                return;
            }

            orders.forEach(order => {

                main.innerHTML += `

                    <div class="card mb-3 shadow-sm">

                        <div class="card-body">

                            <h5>
                                Order #${order.orderId}
                            </h5>

                            <p>

                                <strong>Date:</strong>
                                ${order.date}

                            </p>

                            <p>

                                <strong>Shipping Address:</strong><br>

                                ${order.address}<br>

                                ${order.city},
                                ${order.state}
                                ${order.zip}

                            </p>

                        </div>

                    </div>

                `;

            });

        })
        .catch(error => {

            console.error(error);

            templateBuilder.append(
                "error",
                {
                    error: "Unable to load orders."
                },
                "errors"
            );

        });

}
}

