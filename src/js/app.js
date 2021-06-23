const api = 'https://api.appworks-school.tw/api/1.0';

function renderCartNumber() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const number = document
    .getElementById('nav-icon-cart-number')
    .getElementsByTagName('p')[0];
  if (cart === null) {
    return;
  }
  number.textContent = cart.length;
}

export {api, renderCartNumber};
