import {api, renderCartNumber} from './app.js';

// main
let slide_effect;
let slide_list = [];
let dot_list = [];

window.addEventListener('load', function () {
  renderCartNumber();
  renderCarousels();
  renderProducts(0);

  // set slide effect
  slide_effect = window.setInterval(switchSlide, 5000);
  setSlideMouseEvent();
});

// infinite scroll
let next_paging;
let is_loading = true;

window.addEventListener('scroll', function () {
  const {bottom} = document
    .getElementsByTagName('footer')[0]
    .getBoundingClientRect();
  if (
    window.innerHeight + 10 >= bottom &&
    next_paging !== undefined &&
    is_loading === false
  ) {
    renderLoadingAnimation();
    renderProducts(next_paging);
    is_loading = true;
  }
});

// get carousels
const getCarousels = () =>
  fetch(`${api}/marketing/campaigns`)
    .then((res) => res.json())
    .catch((err) => console.error(err));

async function renderCarousels() {
  const campaigns = await getCarousels();
  if (campaigns.data.length === 0) {
    return;
  }

  const loading_animation = document.getElementById('carousel-loading');
  loading_animation.remove();

  for (let i = 0; i < campaigns.data.length; i++) {
    const id = campaigns.data[i].product_id;
    const story = campaigns.data[i].story.split('\n');

    // set carousel
    const a = document.createElement('a');
    a.href = './product.html' + '?id=' + id;
    a.style = `background-image: url('${campaigns.data[i].picture}')`;
    a.className = i === 0 ? 'carousel carousel-active' : 'carousel';

    const div = document.createElement('div');
    for (let j = 0; j < story.length; j++) {
      const p = document.createElement('p');
      p.id = j === story.length - 1 ? 'quote' : '';
      p.append(story[j]);
      div.appendChild(p);
    }
    a.appendChild(div);
    document.getElementById('carousels').appendChild(a);

    // set oval
    const oval = document.createElement('div');
    oval.className = i === 0 ? 'oval oval-active' : 'oval';
    oval.onclick = () => visitSlide(i);
    document.getElementById('ovals').appendChild(oval);
  }

  getSlideClassList();
}

// slide effect
function getSlideClassList() {
  const slides = document.getElementById('carousels').getElementsByTagName('a');
  const dots = document.getElementsByClassName('oval');
  for (let i = 0; i < slides.length; i++) {
    slide_list.push(slides[i].className);
    dot_list.push(dots[i].className);
  }
}

function visitSlide(index) {
  slide_list = slide_list.map(() => 'carousel');
  slide_list[index] += ' carousel-active';

  dot_list = dot_list.map(() => 'oval');
  dot_list[index] += ' oval-active';

  updateSlideClass();
}

function switchSlide() {
  const slide = slide_list.pop();
  slide_list.unshift(slide);

  const dot = dot_list.pop();
  dot_list.unshift(dot);

  updateSlideClass();
}

function updateSlideClass() {
  const slides = document.getElementById('carousels').getElementsByTagName('a');
  const dots = document.getElementsByClassName('oval');
  for (let i = 0; i < slides.length; i++) {
    slides[i].className = slide_list[i];
    dots[i].className = dot_list[i];
  }
}

function setSlideMouseEvent() {
  const carousels = document.getElementById('carousels');
  carousels.addEventListener('mouseenter', function () {
    clearInterval(slide_effect);
  });
  carousels.addEventListener('mouseleave', function () {
    slide_effect = window.setInterval(switchSlide, 5000);
  });
}

// get products
function getParams() {
  const {search} = window.location;

  let query;
  let query_list = search.split('&');
  query_list.forEach((q) => {
    if (q.includes('tag=')) {
      query = q.split('=')[1];
    }
  });

  let tag, keyword, link;
  if (query === undefined || query === 'all') {
    tag = 'all';
  } else if (query === 'men' || query === 'women' || query === 'accessories') {
    tag = query;
    link = document.getElementsByClassName(`link link-${tag}`)[0];
    link.className += ' link-active';
  } else {
    tag = 'search';
    keyword = query;
  }
  return {tag, keyword};
}

function getProducts(paging) {
  const {tag, keyword} = getParams();
  const products = fetch(
    `${api}/products/${tag}?keyword=${keyword}&paging=${paging}`
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));
  return products;
}

async function renderProducts(paging) {
  const products = await getProducts(paging);
  if (products.data.length === 0) {
    return;
  }

  const loading_animation = document.getElementById('product-loading');
  if (loading_animation) {
    loading_animation.remove();
  }

  for (let i = 0; i < products.data.length; i++) {
    // create product
    const a = document.createElement('a');
    a.className = 'product';
    a.href = './product.html' + '?id=' + products.data[i].id;

    // set image
    const image = document.createElement('img');
    image.src = products.data[i].main_image;
    image.alt = products.data[i].title;
    a.appendChild(image);

    // set colors
    const squares = document.createElement('div');
    squares.className = 'product-squares';
    for (let j = 0; j < products.data[i].colors.length; j++) {
      const square = document.createElement('div');
      square.className = 'product-square';
      square.style = `background-color: #${products.data[i].colors[j].code}`;
      squares.appendChild(square);
    }
    a.appendChild(squares);

    // set title
    const title = document.createElement('p');
    title.className = 'product-name';
    title.append(products.data[i].title);
    a.appendChild(title);

    // set price
    const price = document.createElement('p');
    price.className = 'product-price';
    price.append(`TWD.${products.data[i].price}`);
    a.appendChild(price);

    // append product
    document.getElementById('products').appendChild(a);

    next_paging = products.next_paging;
    is_loading = false;
  }
}

function renderLoadingAnimation() {
  const loading_animation = document.createElement('div');
  loading_animation.id = 'product-loading';
  const loading_image = document.createElement('img');
  loading_image.src = '../src/images/loading.gif';
  loading_image.alt = 'loading';
  loading_animation.appendChild(loading_image);
  document.getElementById('products').appendChild(loading_animation);
}
