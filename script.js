document.addEventListener("DOMContentLoaded", () => {
    // Utilidad: Obtener elemento por ID
    const $ = (id) => document.getElementById(id);
  
    // --- Lógica para la tienda (store.html) ---
    if ($("products-grid")) {
      const products = [
        { id: 1, name: "Varilla de Hierro 10mm", price: 15000, img: "varilla10mm.jpg" },
        { id: 2, name: "Lámina de Acero 1x2m", price: 120000, img: "laminaAcero.jpg" },
        { id: 3, name: "Tubo Estructural 3x3", price: 70000, img: "tuboEstructural.jpg" },
        { id: 4, name: "Alambre Galvanizado 1kg", price: 25000, img: "alambreGalvanizado.jpg" },
        { id: 5, name: "Tornillos (50 pcs)", price: 20000, img: "tornillos.jpg" },
      ];
      
      let cart = [];
      const productsGrid = $("products-grid");
      const cartItems = $("cart-items");
      const totalAmount = $("total-amount");
      const finalizeOrderBtn = $("finalize-order");
      const customerSection = $("customer-section");
      const customerForm = $("customer-form");
  
      // Renderizar productos
      function renderProducts() {
        productsGrid.innerHTML = "";
        products.forEach((product) => {
          const div = document.createElement("div");
          div.className = "product";
          div.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Precio: $${product.price.toLocaleString()}</p>
            <button data-id="${product.id}">Agregar al Carrito</button>
          `;
          productsGrid.appendChild(div);
        });
      }
  
      // Actualizar carrito
      function updateCart() {
        cartItems.innerHTML = "";
        let total = 0;
        cart.forEach((item, index) => {
          total += item.price * item.quantity;
          const div = document.createElement("div");
          div.className = "cart-item";
          div.innerHTML = `
            <p>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}</p>
            <button class="delete" data-index="${index}">Eliminar</button>
          `;
          cartItems.appendChild(div);
        });
        totalAmount.textContent = `$${total.toLocaleString()}`;
      }
  
      // Agregar producto al carrito
      productsGrid.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
          const id = parseInt(e.target.dataset.id, 10);
          const product = products.find((p) => p.id === id);
          const existing = cart.find((item) => item.id === id);
          if (existing) {
            existing.quantity++;
          } else {
            cart.push({ ...product, quantity: 1 });
          }
          updateCart();
        }
      });
  
      // Eliminar producto del carrito
      cartItems.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete")) {
          const index = parseInt(e.target.dataset.index, 10);
          cart.splice(index, 1);
          updateCart();
        }
      });
  
      // Mostrar formulario de cliente para finalizar el pedido
      finalizeOrderBtn.addEventListener("click", () => {
        if (cart.length === 0) {
          alert("El carrito está vacío.");
          return;
        }
        customerSection.classList.remove("hidden");
      });
  
      // Manejar cambio en la opción de domicilio
      $("delivery-option").addEventListener("change", (e) => {
        if (e.target.value === "Sí") {
          $("address-section").classList.remove("hidden");
        } else {
          $("address-section").classList.add("hidden");
        }
      });
  
      // Procesar formulario y generar pedido
      customerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const customerName = $("customer-name").value;
        const delivery = $("delivery-option").value;
        const address = $("address").value;
        const deliveryDate = $("delivery-date").value;
        const deliveryTime = $("delivery-time").value;
        const deliveryCost = delivery === "Sí" ? 10000 : 0;
        let total = 0;
        cart.forEach(item => total += item.price * item.quantity);
        total += deliveryCost;
  
        const order = {
          id: Date.now(),
          customerName,
          delivery,
          address: delivery === "Sí" ? address : "Recoger en tienda (Cra 30A #16-76)",
          deliveryDate,
          deliveryTime,
          items: cart,
          total,
          date: new Date().toLocaleString()
        };
  
        // Guardar pedido actual y en el historial
        localStorage.setItem("currentOrder", JSON.stringify(order));
        const ordersHistory = JSON.parse(localStorage.getItem("orders")) || [];
        ordersHistory.push(order);
        localStorage.setItem("orders", JSON.stringify(ordersHistory));
  
        // Redirigir a la factura
        window.location.href = "invoice.html";
      });
  
      renderProducts();
    }
  
    // --- Lógica para invoice.html ---
    if ($("invoice-content")) {
      const invoiceContent = $("invoice-content");
      const order = JSON.parse(localStorage.getItem("currentOrder"));
      if (order) {
        let itemsHTML = "";
        order.items.forEach(item => {
          itemsHTML += `<p>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}</p>`;
        });
        invoiceContent.innerHTML = `
          <h2>Factura</h2>
          <p><strong>Nombre:</strong> ${order.customerName}</p>
          <p><strong>Entrega:</strong> ${order.delivery} - ${order.address}</p>
          <p><strong>Fecha y Hora de Entrega:</strong> ${order.deliveryDate} ${order.deliveryTime}</p>
          <p><strong>Fecha del Pedido:</strong> ${order.date}</p>
          <div><strong>Productos:</strong><br>${itemsHTML}</div>
          <p><strong>Total:</strong> $${order.total.toLocaleString()}</p>
          <a href="https://wa.me/573212858390?text=${encodeURIComponent('Pago de ' + order.total + ' COP por ' + order.customerName)}" target="_blank" class="btn">Pagar por Nequi</a>\n      `;
      } else {
        invoiceContent.innerHTML = `<p>No hay pedido actual.</p>`;
      }
      $("print-invoice").addEventListener("click", () => {
        window.print();
      });
    }
  
    // --- Lógica para seller.html ---
    if ($("orders-list")) {
      const ordersList = $("orders-list");
      const ordersHistory = JSON.parse(localStorage.getItem("orders")) || [];
      ordersList.innerHTML = "";
      ordersHistory.forEach((order, index) => {
        let itemsHTML = "";
        order.items.forEach(item => {
          itemsHTML += `<li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}</li>`;
        });
        const div = document.createElement("div");
        div.className = "order";
        div.innerHTML = `
          <p><strong>ID:</strong> ${order.id}</p>
          <p><strong>Cliente:</strong> ${order.customerName}</p>
          <p><strong>Entrega:</strong> ${order.delivery} - ${order.address}</p>
          <p><strong>Fecha:</strong> ${order.date}</p>
          <ul>${itemsHTML}</ul>
          <p><strong>Total:</strong> $${order.total.toLocaleString()}</p>
          <button class="delete-order" data-index="${index}">Eliminar Pedido</button>
        `;
        ordersList.appendChild(div);
      });
  
      ordersList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-order")) {
          const index = parseInt(e.target.dataset.index, 10);
          const orders = JSON.parse(localStorage.getItem("orders")) || [];
          orders.splice(index, 1);
          localStorage.setItem("orders", JSON.stringify(orders));
          location.reload();
        }
      });
    }
  });
  