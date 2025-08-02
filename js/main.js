const API_URL = "http://localhost:8080/api/productos";
const modal = new bootstrap.Modal(document.getElementById('modalProducto'));

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "http://localhost:8080/login";
}

document.addEventListener("DOMContentLoaded", () => {
  // Si la URL tiene ?token=... (después del login), guárdalo y limpia la URL
  const params = new URLSearchParams(window.location.search);
  if (params.has("token")) {
    setToken(params.get("token"));
    // Limpia la URL para que no quede el token visible
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  if (!getToken()) {
    logout();
    return;
  }
  listarProductos();
});

function listarProductos() {
  fetch(API_URL, {
    headers: { "Authorization": "Bearer " + getToken() }
  })
    .then(response => {
      if (response.status === 401) {
        logout();
        return [];
      }
      return response.json();
    })
    .then(data => {
      const tbody = document.getElementById("tabla-productos");
      tbody.innerHTML = "";
      data.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${p.nombre}</td>
          <td>${p.precio}</td>
          <td>${p.stock}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" onclick="editarProducto(${p.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function abrirModalNuevo() {
  limpiarFormulario();
  modal.show();
}

function guardarProducto() {
  const id = document.getElementById("producto-id").value;
  const producto = {
    nombre: document.getElementById("nombre").value,
    precio: parseFloat(document.getElementById("precio").value),
    stock: parseInt(document.getElementById("stock").value)
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getToken()
    },
    body: JSON.stringify(producto)
  })
    .then(response => {
      if (response.status === 401) {
        logout();
        return;
      }
      modal.hide();
      listarProductos();
    });
}

function editarProducto(id) {
  fetch(`${API_URL}/${id}`, {
    headers: { "Authorization": "Bearer " + getToken() }
  })
    .then(r => {
      if (r.status === 401) {
        logout();
        return null;
      }
      return r.json();
    })
    .then(p => {
      if (!p) return;
      document.getElementById("producto-id").value = p.id;
      document.getElementById("nombre").value = p.nombre;
      document.getElementById("precio").value = p.precio;
      document.getElementById("stock").value = p.stock;
      modal.show();
    });
}

function eliminarProducto(id) {
  if (confirm("¿Eliminar este producto?")) {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + getToken() }
    })
      .then(response => {
        if (response.status === 401) {
          logout();
          return;
        }
        listarProductos();
      });
  }
}

function limpiarFormulario() {
  document.getElementById("producto-id").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("stock").value = "";
}