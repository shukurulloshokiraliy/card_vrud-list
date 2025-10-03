const productForm = document.getElementById('productForm')
const productName = document.getElementById('productName')
const productImage = document.getElementById('productImage')
const productPrice = document.getElementById('productPrice')
const productStock = document.getElementById('productStock')
const hasDiscount = document.getElementById('hasDiscount')
const discountPercent = document.getElementById('discountPercent')
const discountGroup = document.getElementById('discountGroup')
const submitBtn = document.getElementById('submitBtn')
const cancelBtn = document.getElementById('cancelBtn')
const productsList = document.getElementById('productsList')
const filterSelect = document.getElementById('filterSelect')

let products = []
let editingId = null
let currentFilter = null

document.addEventListener('DOMContentLoaded', () => {
  loadProducts()
  productForm.addEventListener('submit', handleFormSubmit)
  hasDiscount.addEventListener('change', toggleDiscountField)
  cancelBtn.addEventListener('click', resetForm)
  filterSelect.addEventListener('change', handleFilterChange)
})

function toggleDiscountField() {
  discountGroup.classList.toggle('hidden', !hasDiscount.checked)
  discountPercent.required = hasDiscount.checked
}

function handleFormSubmit(e) {
  e.preventDefault()
  const product = {
    id: editingId || Date.now(),
    name: productName.value.trim(),
    image: productImage.value.trim() || 'https://via.placeholder.com/300x200?text=No+Image',
    price: parseFloat(productPrice.value),
    stock: parseInt(productStock.value),
    hasDiscount: hasDiscount.checked,
    discountPercent: hasDiscount.checked ? (parseInt(discountPercent.value) || 0) : 0
  }
  editingId ? updateProduct(product) : addProduct(product)
  resetForm()
}

function addProduct(product) {
  products.push(product)
  saveProducts()
  renderProducts()
}

function updateProduct(product) {
  const i = products.findIndex(p => p.id === editingId)
  if (i !== -1) products[i] = product
  saveProducts()
  renderProducts()
  editingId = null
}

function deleteProduct(id) {
  if (confirm("O‘chirasanmi🧐🤔?")) {
    products = products.filter(p => p.id !== id)
    saveProducts()
    renderProducts()
  }x
}

function editProduct(id) {
  const p = products.find(p => p.id === id)
  if (!p) return
  productName.value = p.name
  productImage.value = p.image
  productPrice.value = p.price
  productStock.value = p.stock
  hasDiscount.checked = p.hasDiscount
  discountPercent.value = p.discountPercent
  toggleDiscountField()
  editingId = id
  submitBtn.textContent = "Mahsulotni Yangilash"
  cancelBtn.classList.remove('hidden')
  productForm.scrollIntoView({ behavior: 'smooth' })
}

function resetForm() {
  productForm.reset()
  editingId = null
  submitBtn.textContent = "Mahsulot Qo'shish"
  cancelBtn.classList.add('hidden')
  discountGroup.classList.add('hidden')
  discountPercent.required = false
}

function handleFilterChange() {
  currentFilter = filterSelect.value
  renderProducts()
}

function renderProducts() {
  if (!products.length) {
    productsList.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-10 text-gray-500">
          <h3 class="text-lg font-semibold mb-2">Hozircha mahsulot yo‘q</h3>
          <p>Birinchi mahsulotingizni qo‘shing!</p>
        </td>
      </tr>`
    return
  }
  let list = [...products]
  switch (currentFilter) {
    case 'az': list.sort((a, b) => a.name.localeCompare(b.name)); break
    case 'za': list.sort((a, b) => b.name.localeCompare(a.name)); break
    case 'priceHigh': list.sort((a, b) => b.price - a.price); break
    case 'priceLow': list.sort((a, b) => a.price - b.price); break
  }
  productsList.innerHTML = list.map(p => createRow(p)).join('')
}

function createRow(p) {
  const finalPrice = p.hasDiscount ? p.price * (1 - p.discountPercent / 100) : p.price
  return `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-4 py-3"><img src="${p.image}" alt="${p.name}" class="w-14 h-14 object-cover rounded-md border" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'"></td>
      <td class="px-4 py-3 font-semibold text-gray-800">${p.name}</td>
      <td class="px-4 py-3 text-indigo-600 font-bold">
        ${p.hasDiscount ? `<span class="line-through text-gray-400 mr-2">$${p.price.toFixed(2)}</span>` : ""}
        $${finalPrice.toFixed(2)}
        ${p.hasDiscount ? `<span class="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">-${p.discountPercent}%</span>` : ""}
      </td>
      <td class="px-4 py-3 text-center text-gray-600">${p.stock} dona</td>
      <td class="px-4 py-3 text-center">
        ${p.hasDiscount ? `<span class="bg-green-600 text-white text-xs px-2 py-1 rounded">${p.discountPercent}%</span>` : `<span class="italic text-gray-400">Skidka yo‘q</span>`}
      </td>
      <td class="px-4 py-3 text-center">
        <button onclick="editProduct(${p.id})" class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Tahrirlash✏️</button>
        <button onclick="deleteProduct(${p.id})" class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">O‘chirish🗑️</button>
      </td>
    </tr>`
}

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products))
}

function loadProducts() {
  const saved = localStorage.getItem('products')
  if (saved) products = JSON.parse(saved)
  renderProducts()
}
