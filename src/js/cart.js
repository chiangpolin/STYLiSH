import {renderCartNumber} from './app.js';

// main
window.addEventListener('load', function () {
  renderCartNumber();
  renderCart();
  renderService();
  renderTotal();
});

function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const cart_number = document.getElementById('cart-title-number');
  cart_number.textContent = cart.length;

  const container = document.getElementById('cart-container');
  if (cart.length === 0) {
    renderEmptyCart();
  }
  for (let i = 0; i < cart.length; i++) {
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.id = `cart-item-${i}`;

    // set main
    const main = document.createElement('div');
    main.className = 'cart-main';

    const main_image = document.createElement('img');
    main_image.src = cart[i].image;
    main.appendChild(main_image);

    const main_div = document.createElement('div');
    const main_p = [
      {class: 'cart-name', text: cart[i].title},
      {class: 'cart-id', text: cart[i].id},
      {class: 'cart-color', text: `顏色 ｜ ${cart[i].color.name}`},
      {class: 'cart-size', text: `尺寸 ｜ ${cart[i].size}`},
    ];
    for (let j = 0; j < main_p.length; j++) {
      const p = document.createElement('p');
      p.className = main_p[j].class;
      p.append(main_p[j].text);
      main_div.appendChild(p);
    }
    main.appendChild(main_div);
    item.appendChild(main);

    // set note title
    const note_title = document.createElement('div');
    note_title.className = 'cart-note-title';
    const note_title_p = ['數量', '單價', '小計'];
    for (let j = 0; j < note_title_p.length; j++) {
      const p = document.createElement('p');
      p.append(note_title_p[j]);
      note_title.appendChild(p);
    }
    item.appendChild(note_title);

    // set note
    const note = document.createElement('div');
    note.classList = 'cart-note';

    const select_div = document.createElement('div');
    const select = document.createElement('select');
    for (let j = 0; j < cart[i].stock; j++) {
      const option = document.createElement('option');
      option.append(j + 1);
      if (j + 1 === cart[i].quantity) {
        option.selected = true;
      }
      select.appendChild(option);
    }
    select.onchange = (e) =>
      modifyQuantity(
        i,
        cart[i].id,
        cart[i].color,
        cart[i].size,
        parseInt(e.target.value)
      );

    select_div.appendChild(select);
    note.appendChild(select_div);

    const note_unit = document.createElement('p');
    note_unit.append(`NT.${cart[i].price}`);
    note.appendChild(note_unit);

    const note_total = document.createElement('p');
    note_total.append(`NT.${cart[i].price * cart[i].quantity}`);
    note_total.className = 'cart-note-total';
    note_total.id = `cart-note-total-${i}`;
    note.appendChild(note_total);
    item.appendChild(note);

    // set remove icon
    const remove_icon = document.createElement('div');
    remove_icon.className = 'cart-remove';
    remove_icon.onclick = () => {
      removeCartItem(i, cart[i].id, cart[i].color, cart[i].size);
      renderCartNumber();
    };
    item.appendChild(remove_icon);

    //set hr
    const hr = document.createElement('hr');
    item.appendChild(hr);
    container.appendChild(item);
  }
}

function renderEmptyCart() {
  const container = document.getElementById('cart-container');
  const item = document.createElement('div');
  item.className = 'cart-item';
  item.style = 'display:flex; justify-content: center; padding: 15px 0';
  const p = document.createElement('p');
  p.append('您的購物車中沒有商品', ' 😢');
  item.appendChild(p);
  container.appendChild(item);
}

function renderService() {
  const service = document.getElementById('cart-service');
  const service_data = [
    {
      name: 'country',
      label: '配送國家',
      options: [
        {text: '台灣及離島', value: 0},
        {text: '日本', value: 0},
        {text: '韓國', value: 0},
        {text: '新加坡', value: 0},
      ],
      class: 'cart-country',
    },
    {
      name: 'delivery',
      label: '取貨方式',
      options: [
        {text: '郵寄 NT$ 50', value: 50},
        {text: '7-11取貨 NT$ 60', value: 60},
      ],
      class: 'cart-delivery',
    },
  ];
  for (let i = 0; i < service_data.length; i++) {
    const div = document.createElement('div');
    div.className = service_data[i].class;

    const p = document.createElement('p');
    p.append(service_data[i].label);
    div.appendChild(p);

    const select = document.createElement('select');
    select.name = service_data[i].name;
    select.onchange = () => renderTotal();
    for (let j = 0; j < service_data[i].options.length; j++) {
      const option = document.createElement('option');
      option.append(service_data[i].options[j].text);
      option.value = service_data[i].options[j].value;
      select.appendChild(option);
    }
    div.appendChild(select);
    service.appendChild(div);
  }
}

function renderTotal() {
  let sum = 0;
  const notes = document.getElementsByClassName('cart-note-total');
  for (let i = 0; i < notes.length; i++) {
    sum = sum + parseInt(notes[i].textContent.replace('NT.', ''));
  }

  const select = document.querySelectorAll('.cart-delivery select')[0];
  const freight_rate = sum > 0 ? parseInt(select.value) : 0;
  const freight = document.getElementById('freight');
  freight.textContent = freight_rate;

  const subtotal = document.getElementById('subtotal');
  subtotal.textContent = sum;

  const total = document.getElementById('total');
  total.textContent = sum + freight_rate;
}

function getCartItemIndex(cart, id, color, size) {
  for (let i = 0; i < cart.length; i++) {
    if (
      cart[i].id === id &&
      cart[i].color.code === color.code &&
      cart[i].size === size
    ) {
      return i;
    }
  }
}

function modifyQuantity(i_id, id, color, size, quantity) {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const i = getCartItemIndex(cart, id, color, size);
  cart[i].quantity = quantity;

  // modify note total
  const note_total = document.getElementById(`cart-note-total-${i_id}`);
  note_total.textContent = `NT.${cart[i].price * cart[i].quantity}`;
  renderTotal();

  // modify localstorage
  localStorage.setItem('cart', JSON.stringify(cart));
  window.alert(`商品數量已更改`);
}

function removeCartItem(i_id, id, color, size) {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const i = getCartItemIndex(cart, id, color, size);
  const new_cart = cart.filter((item) => item !== cart[i]);

  // remove item
  const container = document.getElementById('cart-container');
  const item = document.getElementById(`cart-item-${i_id}`);
  container.removeChild(item);

  // modify number
  const number = document.getElementById('cart-title-number');
  number.textContent = new_cart.length;
  renderTotal();

  // render text
  if (new_cart.length === 0) {
    renderEmptyCart();
  }

  // modify localstorage
  localStorage.setItem('cart', JSON.stringify(new_cart));
  window.alert(`商品已移除`);
}
