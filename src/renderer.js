//nak simpan semua produk yang di-fetch dari API
let allProducts = [];

//fetch produk dari beberapa brand dan simpan dalam allProducts
function fetchProducts(brands = ['maybelline']) {
  brands = Array.isArray(brands) ? brands : [brands];

//buat array  untuk setiap brand
  const fetchPromises = brands.map(brand =>
    fetch(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}`)
      .then(response => {
          //check kalau response berjaya
        if (!response.ok) throw new Error(`Failed to fetch ${brand}`);
        return response.json();
      })
      .catch(error => {
        console.error(error);
        return [];//return array kosong kalau ada error
      })
  );

  //tunggu semua fetch requests siap
  Promise.all(fetchPromises)
    .then(results => {
      allProducts = results.flat(); 
      displayProducts(allProducts); //display semua products
    })
    .catch(error => console.error('Error fetching products:', error));
}

//function untuk display produk kat makeuplist.html
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
  
    if (products.length === 0) {
      productList.innerHTML = '<p>No products available.</p>';
      return;
    }
  
    products.forEach(product => {
      const productDiv = document.createElement('div');
      productDiv.className = 'product';
      productDiv.innerHTML = `
        <img src="${product.image_link || 'placeholder.jpg'}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
        <p><strong>Price:</strong> ${product.price ? `$${product.price}` : 'N/A'}</p>
        <p><strong>Type:</strong> ${product.product_type || 'Unknown'}</p>
        <p><strong>Rating:</strong> ${product.rating ? product.rating : 'No rating available'}</p>
        <p><strong>Description:</strong> ${product.description || 'No description available'}</p>
  
        <p><strong>Tags:</strong> ${product.tag_list && product.tag_list.length > 0 
          ? product.tag_list.join(', ') 
          : 'No tags available.'}
        </p>
  
        <div class="color-container">
          <strong>Colors:</strong>
          ${product.product_colors && product.product_colors.length > 0 
            ? product.product_colors.map(color => `
              <span class="color-box" 
                    style="background-color: ${color.hex_value}; 
                           display: inline-block; 
                           width: 20px; 
                           height: 20px; 
                           border-radius: 50%; 
                           margin: 2px;" 
                    title="${color.colour_name || 'Unnamed Color'}">
              </span>
            `).join('')
            : 'No colors available.'}
        </div>
  
        <a href="${product.product_link}" target="_blank">View Product</a>
        <a href="${product.website_link}" target="_blank">Official Website</a>
        <button class="add-to-wishlist" data-id="${product.id}">Add to Wishlist</button>
      `;
      productList.appendChild(productDiv);
  

      productDiv.querySelector('.add-to-wishlist').addEventListener('click', () => {
        addToWishlist(product);
      });
    });
  }
  
//function untuk add produk dalam wishlist dan simpan kat localStorage
function addToWishlist(product) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  if (!wishlist.some(item => item.id === product.id)) {
    product.note = ''; 
    wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    showToast(`${product.name} added to wishlist!`);
  } else {
    showToast(`${product.name} is already in your wishlist!`);
  }
}

//function untuk display item wishlist kat halaman wishlist
function displayWishlist() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const wishlistDiv = document.getElementById('wishlist');
  wishlistDiv.innerHTML = ''; 

  if (wishlist.length === 0) {
    wishlistDiv.innerHTML = '<p>Your wishlist is empty.</p>';
    return;
  }

  wishlist.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'wishlist-item';
    itemDiv.innerHTML = `
      <img src="${item.image_link || 'placeholder.jpg'}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p><strong>Price:</strong> ${item.price ? `$${item.price}` : 'N/A'}</p>
      <p class="note-text" id="note-text-${item.id}">${item.note || 'No note added.'}</p>
      <input type="text" id="note-${item.id}" style="display:none;" value="${item.note || ''}" placeholder="Add a note" />
      <button class="update-note" data-id="${item.id}">Update Note</button>
      <button class="save-note" data-id="${item.id}" style="display:none;">Save Note</button>
      <button class="remove-item" data-id="${item.id}">Remove Item</button>
    `;
    wishlistDiv.appendChild(itemDiv);
  });

  attachWishlistEventListeners(); 
}

function attachWishlistEventListeners() {
  const removeButtons = document.querySelectorAll('.remove-item');
  const updateButtons = document.querySelectorAll('.update-note');
  const saveButtons = document.querySelectorAll('.save-note');

  removeButtons.forEach(button => {
    button.addEventListener('click', event => {
      const productId = event.target.getAttribute('data-id');
      removeWishlistItem(productId);
    });
  });

  updateButtons.forEach(button => {
    button.addEventListener('click', event => {
      const productId = event.target.getAttribute('data-id');
      toggleNoteEdit(productId, true); // Enable edit mode
    });
  });

  saveButtons.forEach(button => {
    button.addEventListener('click', event => {
      const productId = event.target.getAttribute('data-id');
      saveNoteForItem(productId); // Save the note
    });
  });
}

//function untuk toggle mode edit untuk update note
function toggleNoteEdit(productId, isEditMode) {
  const noteText = document.getElementById(`note-text-${productId}`);
  const noteInput = document.getElementById(`note-${productId}`);
  const updateButton = document.querySelector(`.update-note[data-id="${productId}"]`);
  const saveButton = document.querySelector(`.save-note[data-id="${productId}"]`);

  if (isEditMode) {
    noteInput.style.display = 'block';
    noteText.style.display = 'none';
    updateButton.style.display = 'none';
    saveButton.style.display = 'block'; //tunjuk Save Note button
    noteInput.focus();
  } else {
    noteInput.style.display = 'none';
    noteText.style.display = 'block';
    updateButton.style.display = 'block'; //tunjuk Update Note button
    saveButton.style.display = 'none'; //sorok Save Note button
  }
}

//function untuk simpan atau update nota produk tertentu
function saveNoteForItem(productId) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const noteInput = document.getElementById(`note-${productId}`);
  const updatedNote = noteInput.value;

  const productIndex = wishlist.findIndex(item => item.id == productId);
  if (productIndex !== -1) {
    wishlist[productIndex].note = updatedNote;
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    showToast('Note updated successfully!');
    toggleNoteEdit(productId, false); 
    displayWishlist(); 
  }
}

//function untuk buang produk dari wishlist dan update localStorage
function removeWishlistItem(productId) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  wishlist = wishlist.filter(item => item.id != productId); //buang item dari array
  localStorage.setItem('wishlist', JSON.stringify(wishlist)); //update localStorage
  displayWishlist(); 
  showToast('Item removed from wishlist.');
}

//function untuk display toast notification dengan duplicate prevention
function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove(); 

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

//Navigate balik ke  product list page
document.getElementById('go-to-product-list').addEventListener('click', () => {
  location.href = 'makeuplist.html'; 
});

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'makeuplist.html') {
    fetchProducts(); //fetch products untuk  product list page
  } else if (currentPage === 'wishlist.html') {
    displayWishlist(); //display wishlist items kat wishlist page
  }
});
