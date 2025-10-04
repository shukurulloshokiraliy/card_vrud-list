const productForm = document.getElementById("productForm");
const productName = document.getElementById("productName");
const productImage = document.getElementById("productImage");
const productPrice = document.getElementById("productPrice");
const productStock = document.getElementById("productStock");
const hasDiscount = document.getElementById("hasDiscount");
const discountPercent = document.getElementById("discountPercent");
const discountGroup = document.getElementById("discountGroup");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const productsList = document.getElementById("productsList");
const filterSelect = document.getElementById("filterSelect");
const btnDrawer = document.getElementById("btn-drawer");
const closeDrawer = document.getElementById("close-drawer");
const overlayDrawer = document.getElementById("overlay-drawer");
const drawer = document.getElementById("drawer");

let products = [];
let editingId = null;
let currentFilter = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const drawerProductsContainer = drawer.querySelector(".flex-1");
const totalProductsText = drawer.querySelector(".p-4 .flex span:first-child");
const totalPriceText = drawer.querySelector(".p-4 .flex span:last-child");

btnDrawer.addEventListener("click", () => {
  overlayDrawer.classList.remove("hidden");
  setTimeout(() => drawer.classList.remove("translate-x-full"), 10);
});

closeDrawer.addEventListener("click", () => {
  drawer.classList.add("translate-x-full");
  setTimeout(() => overlayDrawer.classList.add("hidden"), 300);
});

overlayDrawer.addEventListener("click", closeDrawerFunc);
closeDrawer.addEventListener("click", closeDrawerFunc);

function closeDrawerFunc() {
  drawer.classList.add("translate-x-full");
  setTimeout(() => overlayDrawer.classList.add("hidden"), 300);
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  renderCart();
  productForm.addEventListener("submit", handleFormSubmit);
  hasDiscount.addEventListener("change", toggleDiscountField);
  cancelBtn.addEventListener("click", resetForm);
  filterSelect.addEventListener("change", handleFilterChange);
});

function toggleDiscountField() {
  discountGroup.classList.toggle("hidden", !hasDiscount.checked);
  discountPercent.required = hasDiscount.checked;
}

function handleFormSubmit(e) {
  e.preventDefault();
  const product = {
    id: editingId || Date.now(),
    name: productName.value.trim(),
    image:
      productImage.value.trim() ||
      "https://via.placeholder.com/300x200?text=No+Image",
    price: parseFloat(productPrice.value),
    stock: parseInt(productStock.value),
    hasDiscount: hasDiscount.checked,
    discountPercent: hasDiscount.checked
      ? parseInt(discountPercent.value) || 0
      : 0,
  };
  editingId ? updateProduct(product) : addProduct(product);
  resetForm();
}

function addProduct(product) {
  products.push(product);
  saveProducts();
  renderProducts();
}

function updateProduct(product) {
  const i = products.findIndex((p) => p.id === editingId);
  if (i !== -1) products[i] = product;
  saveProducts();
  renderProducts();
  editingId = null;
}

function deleteProduct(id) {
  if (confirm("O‘chirasanmi 🤔?")) {
    products = products.filter((p) => p.id !== id);
    saveProducts();

    cart = cart.filter((c) => c.id !== id);
    saveCart();
    renderCart();

    renderProducts();
  }
}

function editProduct(id) {
  const p = products.find((p) => p.id === id);
  if (!p) return;
  productName.value = p.name;
  productImage.value = p.image;
  productPrice.value = p.price;
  productStock.value = p.stock;
  hasDiscount.checked = p.hasDiscount;
  discountPercent.value = p.discountPercent;
  toggleDiscountField();
  editingId = id;
  submitBtn.textContent = "Mahsulotni Yangilash";
  cancelBtn.classList.remove("hidden");
}

function resetForm() {
  productForm.reset();
  editingId = null;
  submitBtn.textContent = "Mahsulot Qo'shish";
  cancelBtn.classList.add("hidden");
  discountGroup.classList.add("hidden");
  discountPercent.required = false;
}

function handleFilterChange() {
  currentFilter = filterSelect.value;
  renderProducts();
}

function renderProducts() {
  if (!products.length) {
    productsList.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-10 text-gray-500">
          <h3 class="text-lg font-semibold mb-2">Hozircha mahsulot yo‘q</h3>
          <p>Birinchi mahsulotingizni qo‘shing!</p>
        </td>
      </tr>`;
    return;
  }

  let list = [...products];
  switch (currentFilter) {
    case "az":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "za":
      list.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "priceHigh":
      list.sort((a, b) => b.price - a.price);
      break;
    case "priceLow":
      list.sort((a, b) => a.price - b.price);
      break;
  }

  productsList.innerHTML = list.map((p) => createRow(p)).join("");
}

function createRow(p) {
  const finalPrice = p.hasDiscount
    ? p.price * (1 - p.discountPercent / 100)
    : p.price;
  return `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-4 py-3"><img src="${p.image}" alt="${
    p.name
  }" class="w-14 h-14 object-cover rounded-md border"></td>
      <td class="px-4 py-3 font-semibold text-gray-800">${p.name}</td>
      <td class="px-4 py-3 text-indigo-600 font-bold">
        ${
          p.hasDiscount
            ? `<span class="line-through text-gray-400 mr-2">$${p.price.toFixed(
                2
              )}</span>`
            : ""
        }
        $${finalPrice.toFixed(2)}
        ${
          p.hasDiscount
            ? `<span class="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">-${p.discountPercent}%</span>`
            : ""
        }
      </td>
      <td class="px-4 py-3 text-center text-gray-600">${p.stock} dona</td>
      <td class="px-4 py-3 text-center">
        ${
          p.hasDiscount
            ? `<span class="bg-green-600 text-white text-xs px-2 py-1 rounded">${p.discountPercent}%</span>`
            : `<span class="italic text-gray-400">Skidka yo‘q</span>`
        }
      </td>
      <td class="px-4 py-3 text-center">
        <button onclick="addToCart(${
          p.id
        })" class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
          <img class="w-[24px] h-[30px]" src="./images/korzinka.svg" alt="korzinka">
        </button>
        <button onclick="editProduct(${
          p.id
        })" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
          <img class="w-[24px] h-[30px]" src="./images/edit_pen.svg" alt="edit">
        </button>
        <button onclick="deleteProduct(${
          p.id
        })" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
          <img class="w-[24px] h-[30px]" src="./images/trash-can.png" alt="trash">
        </button>
      </td>
    </tr>`;
}

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function loadProducts() {
  const saved = localStorage.getItem("products");
  if (saved) products = JSON.parse(saved);
  renderProducts();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const existing = cart.find((item) => item.id === id);
  if (existing) return;
  cart.push({ ...product, qty: 1 });
  saveCart();
  renderCart();
  const btn = document.querySelector(`button[onclick="addToCart(${id})"]`);
  if (btn) btn.classList.add("hidden");
}

function renderCart() {
  drawerProductsContainer.innerHTML = "";
  if (cart.length === 0) {
    drawerProductsContainer.innerHTML = `<p class="text-center text-gray-500 mt-10">Savat bo‘sh 🛒</p>`;
    updateCartInfo();
    return;
  }

  cart.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add(
      "flex",
      "items-center",
      "justify-between",
      "border-b",
      "pb-3"
    );
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${item.image}" alt="${
      item.name
    }" class="w-12 h-12 object-cover rounded-lg border" />
        <div>
          <h4 class="font-medium text-gray-800">${item.name}</h4>
          <p class="text-sm text-gray-600">$${item.price.toFixed(2)} x ${
      item.qty
    }</p>
        </div>
      </div>
      <button class="remove-item text-red-500 text-lg" data-id="${
        item.id
      }">✖</button>
    `;
    drawerProductsContainer.appendChild(div);
  });

  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      cart = cart.filter((x) => x.id !== id);
      saveCart();
      renderCart();
      const addBtn = document.querySelector(
        `button[onclick="addToCart(${id})"]`
      );
      if (addBtn) addBtn.classList.remove("hidden");
    });
  });

  updateCartInfo();
}

function updateCartInfo() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  totalProductsText.textContent = `${totalItems} Product`;
  totalPriceText.textContent = `$${totalPrice.toFixed(2)}`;
}
