import {api} from './app.js';
import {tappay_app} from './key.js';

(function initTapPay() {
  // eslint-disable-next-line no-undef
  TPDirect.setupSDK(tappay_app.id, tappay_app.key, 'sandbox');
  // eslint-disable-next-line no-undef
  TPDirect.card.setup({
    fields: {
      number: {
        element: '#card-number',
        placeholder: '**** **** **** ****',
      },
      expirationDate: {
        element: '#card-expiration-date',
        placeholder: 'MM / YY',
      },
      ccv: {
        element: '#card-ccv',
        placeholder: 'ccv',
      },
    },
    styles: {
      input: {
        color: 'grey',
      },
      'input.ccv': {
        'font-size': '16px',
      },
      'input.expiration-date': {
        'font-size': '16px',
      },
      'input.card-number': {
        'font-size': '16px',
      },
      ':focus': {
        color: 'black',
      },
      '.valid': {
        color: 'green',
      },
      '.invalid': {
        color: 'red',
      },
      // Media queries
      // Note that these apply to the iframe, not the root window.
      '@media screen and (max-width: 400px)': {
        input: {
          color: 'orange',
        },
      },
    },
  });
  // eslint-disable-next-line no-undef
  TPDirect.card.onUpdate(function (update) {
    const total = document.getElementById('total');
    const total_value = parseInt(total.textContent);
    const button = document.querySelectorAll('.cart-submit button')[0];

    if (update.canGetPrime && total_value > 0) {
      button.disabled = false;
      button.onclick = () => {
        const check = checkValidation();
        if (check.isValid) {
          // eslint-disable-next-line no-undef
          TPDirect.card.getPrime(function (response) {
            checkout(response.card.prime);
          });
        } else {
          window.alert(check.alert);
        }
      };
    } else {
      button.disabled = true;
    }
  });
})();

function checkValidation() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  if (cart === null || cart.length === 0) {
    return {isValid: false, alert: '您的購物車空空的'};
  }

  const name = document.getElementById('username').value;
  if (name === '') {
    return {isValid: false, alert: '收件人姓名 輸入有誤'};
  }

  const email = document.getElementById('email').value;
  const email_format =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email.match(email_format) === null) {
    return {isValid: false, alert: '電子信箱 輸入有誤'};
  }

  const phone = document.getElementById('phone').value;
  const phone_format = /^[0-9]{10}$/;
  if (phone.match(phone_format) === null) {
    return {isValid: false, alert: '手機 輸入有誤'};
  }

  const address = document.getElementById('address').value;
  if (address === '') {
    return {isValid: false, alert: '地址 輸入有誤'};
  }
  return {isValid: true, alert: ''};
}

function checkout(prime) {
  new Promise((resolve) => {
    // eslint-disable-next-line no-undef
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        resolve(response.authResponse.accessToken);
      } else {
        window.alert('請先登入Facebook帳號');
      }
    }, true);
  })
    .then((FB_token) => {
      return getSignInToken(FB_token);
    })
    .then((token) => {
      return getOrderNumber(prime, token);
    })
    .then((order) => {
      localStorage.setItem('order', JSON.stringify(order.data.number));
      localStorage.removeItem('cart');
      window.location.href = './thankyou.html';
    });
}

async function getSignInToken(access_token) {
  const body = {
    provider: 'facebook',
    access_token: access_token,
  };
  const profile = await fetch(`${api}/user/signin`, {
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
    method: 'POST',
    mode: 'cors',
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));
  return profile.data.access_token;
}

async function getOrderNumber(prime, access_token) {
  const body = getOrderInfomation(prime);
  const order = await fetch(`${api}/order/checkout`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(body),
    method: 'POST',
    mode: 'cors',
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));
  return order;
}

function getOrderInfomation(prime) {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const cart_list = [];

  const name = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const radio = document.querySelectorAll('.cart-radio input');
  let time;
  for (let i = 0; i < radio.length; i++) {
    if (radio[i].checked) {
      time = radio[i].value;
    }
  }
  const freight = parseInt(
    document.querySelectorAll('.cart-delivery select')[0].value
  );
  let subtotal = 0;
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    subtotal += cart[i].price * cart[i].quantity;
    cart_list.push({
      id: cart[i].id,
      name: cart[i].title,
      price: cart[i].price,
      color: cart[i].color,
      size: cart[i].size,
      qty: cart[i].quantity,
    });
  }
  total = subtotal + freight;

  const body = {
    prime: prime,
    order: {
      shipping: 'delivery',
      payment: 'credit_card',
      subtotal: subtotal,
      freight: freight,
      total: total,
      recipient: {
        name: name,
        phone: phone,
        email: email,
        address: address,
        time: time,
      },
      list: cart_list,
    },
  };
  return body;
}
