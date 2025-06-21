// --- CONFIGURACIÓN ---
const DOM = {
  productContainer: document.querySelector('.product-container'),
  cartModal: document.getElementById('cart-modal'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  cartBtn: document.getElementById('cart-btn'),
  closeCart: document.getElementById('close-cart'),
  cartCount: document.getElementById('cart-count'),
  form: document.querySelector('form'),
};

// --- ESTADO GLOBAL ---
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// --- FUNCIONES DE PRODUCTOS ---
async function cargarProductos() {
  try {
    const res = await fetch('productos.json');
    if (!res.ok) throw new Error('No se pudo cargar la lista de productos');
    const productos = await res.json();
    mostrarProductos(productos);
  } catch (error) {
    console.error(error);
    mostrarMensaje('Error al cargar los productos');
  }
}

function mostrarProductos(productos) {
  DOM.productContainer.innerHTML = productos
    .map(
      (producto) => `
        <div class="product-card">
          <img src="${producto.image}" alt="${producto.title}" loading="lazy">
          <h3>${producto.title}</h3>
          <p>${producto.description}</p>
          <span>$${producto.price.toFixed(2)}</span>
          <button class="add-to-cart" data-id="${producto.id}">Agregar al carrito</button>
        </div>
      `
    )
    .join('');

  DOM.productContainer.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', agregarAlCarrito);
  });
}

// --- FUNCIONES DE CARRITO ---
function agregarAlCarrito(e) {
  const id = e.target.dataset.id;
  const card = e.target.closest('.product-card');
  const producto = {
    id,
    nombre: card.querySelector('h3').textContent,
    precio: parseFloat(card.querySelector('span').textContent.replace('$', '')),
    imagen: card.querySelector('img').src,
    cantidad: 1,
  };

  const itemExistente = carrito.find((item) => item.id === id);
  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push(producto);
  }

  guardarCarrito();
  actualizarContador();
  mostrarMensaje('Producto agregado al carrito');
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarContador() {
  DOM.cartCount.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

function mostrarCarrito() {
  DOM.cartItems.innerHTML = '';
  let suma = 0;

  if (carrito.length === 0) {
    DOM.cartItems.innerHTML = '<p>El carrito está vacío.</p>';
    DOM.cartTotal.textContent = 'Total: $0.00';
  } else {
    DOM.cartItems.innerHTML = carrito
      .map(
        (item) => `
          <div class="cart-item">
            <img src="${item.imagen}" alt="${item.nombre}" width="40" loading="lazy">
            <span>${item.nombre}</span>
            <input type="number" min="1" value="${item.cantidad}" data-id="${item.id}" class="cantidad-input">
            <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
            <button class="eliminar-item" data-id="${item.id}">🗑️</button>
          </div>
        `
      )
      .join('');
    suma = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    DOM.cartTotal.textContent = `Total: $${suma.toFixed(2)}`;
  }

  if (!DOM.cartTotal) {
    console.error('Error: El elemento #cart-total no se encuentra en el DOM');
    mostrarMensaje('Error al mostrar el total del carrito');
    return;
  }

  DOM.cartModal.classList.remove('hidden');
  DOM.cartModal.classList.add('active');
  DOM.cartItems.querySelectorAll('.cantidad-input').forEach((input) => {
    input.addEventListener('change', cambiarCantidad);
  });
  DOM.cartItems.querySelectorAll('.eliminar-item').forEach((btn) => {
    btn.addEventListener('click', eliminarItem);
  });
}

function cambiarCantidad(e) {
  const id = e.target.dataset.id;
  const nuevaCantidad = parseInt(e.target.value, 10);
  if (nuevaCantidad > 0) {
    const producto = carrito.find((item) => item.id === id);
    if (producto) {
      producto.cantidad = nuevaCantidad;
      guardarCarrito();
      mostrarCarrito();
      actualizarContador();
    }
  } else {
    eliminarItem({ target: { dataset: { id } } });
  }
}

function eliminarItem(e) {
  carrito = carrito.filter((item) => item.id !== e.target.dataset.id);
  guardarCarrito();
  mostrarCarrito();
  actualizarContador();
}

// --- MODAL DEL CARRITO ---
DOM.cartBtn.addEventListener('click', mostrarCarrito);
DOM.closeCart.addEventListener('click', () => {
  DOM.cartModal.classList.remove('active');
  DOM.cartModal.classList.add('hidden');
});

// --- MENSAJES AL USUARIO ---
function mostrarMensaje(mensaje) {
  const aviso = document.createElement('div');
  Object.assign(aviso.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#0277bd',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    zIndex: '2000',
  });
  aviso.textContent = mensaje;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 2000);
}

// --- VALIDACIÓN DEL FORMULARIO DE CONTACTO ---
if (DOM.form) {
  DOM.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = DOM.form.nombre.value.trim();
    const email = DOM.form.email.value.trim();
    const mensaje = DOM.form.mensaje.value.trim();

    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !mensaje) {
      mostrarMensaje('Por favor, completa todos los campos correctamente.');
      return;
    }

    mostrarMensaje('Formulario enviado con éxito');
    DOM.form.reset();
  });
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  actualizarContador();
});