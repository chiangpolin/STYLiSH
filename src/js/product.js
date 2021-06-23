import {api, renderCartNumber} from './app.js';

const dict = {};
const selection = {color: {code: '', name: ''}, size: '', quantity: 1};

// main
window.addEventListener('load', function () {
  renderCartNumber();
  renderDetails();
});

function getId() {
  const {search} = window.location;
  let id = 0;
  let query_list = search.split('&');
  query_list.forEach((q) => {
    if (q.includes('id=')) {
      id = q.split('=')[1];
    }
  });
  return id;
}

function getDetails() {
  const id = getId();
  const details = fetch(`${api}/products/details?id=${id}`)
    .then((res) => res.json())
    .catch((err) => console.error(err));
  return details;
}

async function renderDetails() {
  const details = await getDetails();

  const loading_animation = document.getElementById('detail-loading');
  loading_animation.remove();

  const details_section = document.getElementById('details');
  details_section.style = '';

  const {main_image, title, id, price} = details.data;
  const details_section_img = details_section.getElementsByTagName('img')[0];
  details_section_img.src = main_image;
  details_section_img.alt = title;
  document.getElementById('detail-title').textContent = title;
  document.getElementById('detail-id').textContent = id;
  document.getElementById('detail-price').textContent = `TWD.${price}`;

  // set colors
  const {colors} = details.data;
  const color_div = document.getElementById('detail-colors');
  for (let i = 0; i < colors.length; i++) {
    const color = document.createElement('div');
    color.className = 'detail-color';
    color.style = `background-color: #${colors[i].code};`;
    color.onclick = () => selectColor(i, colors[i].code, colors[i].name);
    color_div.appendChild(color);
  }

  // set sizes
  const {sizes} = details.data;
  const size_div = document.getElementById('detail-sizes');
  for (let i = 0; i < sizes.length; i++) {
    const size = document.createElement('div');
    size.className = 'detail-size';
    size.onclick = () => selectSize(i, sizes[i]);

    const p = document.createElement('p');
    p.textContent = sizes[i];

    size.appendChild(p);
    size_div.appendChild(size);
  }

  // import variants and initialize dictionary
  const {variants} = details.data;
  initDictionary(colors, sizes, variants);

  // initialize selection
  initSelection(colors, sizes);

  // set onclick limit refers to stock record in dictionary
  setLimit(dict[selection.color.code][selection.size].stock, 1);

  // set others
  const {note, texture, description, wash, place} = details.data;
  document.getElementById('detail-note').textContent = '*' + note;
  document.getElementById('detail-texture').textContent = texture;
  document.getElementById('detail-description').textContent = description;
  document.getElementById('detail-wash').textContent = '親洗：' + wash;
  document.getElementById('detail-place').textContent = '產地：' + place;

  // set images
  const {images, story} = details.data;
  const image_div = document.getElementById('detail-images');
  const image_title = document.createElement('div');
  image_title.id = 'detail-images-title';
  const title_p = document.createElement('p');
  title_p.textContent = '細部說明';
  const title_hr = document.createElement('hr');
  image_title.appendChild(title_p);
  image_title.appendChild(title_hr);
  image_div.appendChild(image_title);

  const story_p = document.createElement('p');
  story_p.id = 'detail-story';
  story_p.textContent = story;
  image_div.appendChild(story_p);

  for (let i = 0; i < images.length; i++) {
    const image = document.createElement('img');
    image.src = images[i];
    image.alt = title;
    image.className = 'detail-image';
    image_div.appendChild(image);
  }

  // set add to cart button
  const button = document.getElementById('add-to-cart');
  button.onclick = () =>
    addToCart(
      id,
      main_image,
      title,
      price,
      selection.color,
      selection.size,
      selection.quantity
    );
}

function initDictionary(colors, sizes, variants) {
  for (let i = 0; i < colors.length; i++) {
    dict[`${colors[i].code}`] = {};
    for (let j = 0; j < sizes.length; j++) {
      dict[`${colors[i].code}`][`${sizes[j]}`] = {index: j, stock: 0};
    }
  }
  variants.forEach(
    (variant) => (dict[variant.color_code][variant.size].stock = variant.stock)
  );
}

function initSelection(colors, sizes) {
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < sizes.length; j++) {
      if (dict[colors[i].code][sizes[j]].stock !== 0) {
        selection.color.code = colors[i].code;
        selection.color.name = colors[i].name;
        selection.size = sizes[j];
        selectColor(i, colors[i].code, colors[i].name);
        selectSize(j, sizes[j]);
        return;
      }
    }
  }
}

function resetSelection() {
  for (let size in dict[selection.color.code]) {
    if (dict[selection.color.code][size].stock !== 0) {
      selectSize(dict[selection.color.code][size].index, size);
      return;
    }
  }
}

function selectColor(index, code, name) {
  // select color
  const colors = document.getElementsByClassName('detail-color');
  for (let i = 0; i < colors.length; i++) {
    colors[i].className = 'detail-color';
  }
  colors[index].className += ' detail-color-selected';

  // update size option
  enableSizes();
  for (let size in dict[code]) {
    if (dict[code][size].stock === 0) {
      disableSize(dict[code][size].index);
    }
  }

  // update selection
  selection.color.code = code;
  selection.color.name = name;
  if (dict[selection.color.code][selection.size].stock === 0) {
    resetSelection();
  }
  setLimit(dict[selection.color.code][selection.size].stock, 1);
}

function selectSize(index, size) {
  const sizes = document.getElementsByClassName('detail-size');
  for (let i = 0; i < sizes.length; i++) {
    if (sizes[i].className === 'detail-size detail-size-selected') {
      sizes[i].className = 'detail-size';
    }
  }
  sizes[index].className += ' detail-size-selected';

  // update selection
  selection.size = size;
  setLimit(dict[selection.color.code][selection.size]['stock'], 1);
}

function enableSizes() {
  const sizes = document.getElementsByClassName('detail-size');
  for (let i = 0; i < sizes.length; i++) {
    if (sizes[i].className === 'detail-size detail-size-disable') {
      sizes[i].className = 'detail-size';
    }
  }
}

function disableSize(index) {
  const sizes = document.getElementsByClassName('detail-size');
  sizes[index].className = 'detail-size detail-size-disable';
}

function setLimit(max, min) {
  document.getElementById('increment').onclick = () => increase(max);
  document.getElementById('decrement').onclick = () => decrease(min);
  resetQuantity();
}

function increase(max) {
  if (selection.quantity < max) {
    selection.quantity += 1;
    renderQuantity();
  }
}

function decrease(min) {
  if (selection.quantity > min) {
    selection.quantity -= 1;
    renderQuantity();
  }
}

function resetQuantity() {
  selection.quantity = 1;
  renderQuantity();
}

function renderQuantity() {
  const stock_p = document
    .getElementById('detail-stock')
    .getElementsByTagName('p')[0];
  stock_p.textContent = selection.quantity;
}

async function getStock(color, size) {
  const details = await getDetails();
  const {variants} = details.data;
  for (let i = 0; i < variants.length; i++) {
    if (variants[i].color_code === color.code && variants[i].size === size) {
      return variants[i].stock;
    }
  }
  return 0;
}

function initCart() {
  const cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
}

async function addToCart(id, main_image, title, price, color, size, quantity) {
  let cart = JSON.parse(localStorage.getItem('cart'));
  if (cart === null || cart == undefined) {
    cart = initCart();
  }

  const stock = await getStock(color, size);
  if (quantity > stock) {
    window.alert('此商品已經沒有庫存');
    return;
  }

  for (let i = 0; i < cart.length; i++) {
    if (
      cart[i].id === id &&
      cart[i].color.code === color.code &&
      cart[i].size === size
    ) {
      cart[i].quantity += quantity;
      cart[i].stock = stock;
      if (cart[i].quantity > stock) {
        window.alert('無法加購此數量');
        return;
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.alert(`加購 ${quantity} 件商品加入購物車`);

      resetQuantity();
      return;
    }
  }

  cart.push({
    id: id,
    image: main_image,
    title: title,
    price: price,
    color: color,
    size: size,
    quantity: quantity,
    stock: stock,
  });

  localStorage.setItem('cart', JSON.stringify(cart));
  window.alert(`將 ${quantity} 件商品加入購物車`);

  resetQuantity();
  renderCartNumber();
}
