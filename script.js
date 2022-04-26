const cart = document.querySelector('.cart__items');
const totalPrice = document.querySelector('.total-price');
const emptyCart = document.querySelector('.empty-cart');

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  const element = event.target;
  const itemIndex = Array.from(cart.children).indexOf(element);
  subtractItems(itemIndex);

  element.remove();
}

const addToLocalStorage = (sku, name, salePrice) => {
  const item = {
    sku, name, salePrice
  };
  const storageItem = JSON.parse(localStorage.getItem('Cart List'));
  if (!storageItem) {
    localStorage.setItem('Cart List', JSON.stringify([item]));
  }
  if (storageItem) {
    const storage = JSON.parse(localStorage.getItem('Cart List'));
    storage.push(item);
    
    localStorage.setItem('Cart List', JSON.stringify(storage));
  }
};

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const fetchApi = async (product) => {
  const result = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${product}`)
    .then((response) => response.json())
    .then((data) => data)
    .catch((e) => `Algo deu errado ${e}`);

  return result.results;
};

const fetchApiById = async (sku) => {
  const product = await fetch(`https://api.mercadolibre.com/items/${sku}`)
    .then((response) => response.json())
    .then(({id, title, price}) => {
      cart.appendChild(createCartItemElement({ sku: id, name: title, salePrice: price}));
      addToLocalStorage(id, title, price);
      sumItems(price);
    })
    .catch((e) => `Algo deu errado ${e}`);
};

const getLocalStorage = async () => {
  const ls = JSON.parse(localStorage.getItem('Cart List'));
  if (!ls) return;
  ls.forEach(({ sku, name, salePrice }) => {
    cart.appendChild(createCartItemElement({ sku, name, salePrice }));
    sumItems(salePrice);
  });
}

const add = () => {
  const listButtons = document.querySelectorAll('.item__add');
  listButtons.forEach((buttons) => {
    const sku = getSkuFromProductItem(buttons.parentNode);
    buttons.addEventListener('click', () => {
      fetchApiById(sku);
    });
  });
};

const setItemns = async (product) => {
  waiting(true);
  const result = await fetchApi(product);
  result.forEach((item) => {
    const itemns = document.querySelector('.items');
    itemns.appendChild(createProductItemElement(
      { sku: item.id, name: item.title, image: item.thumbnail },
      ));
    });
  add();
  waiting(false);
};

const sumItems = (price) => {
  const sum = Number(totalPrice.innerHTML) + Number(price);
  totalPrice.innerHTML = Math.floor(sum*100)/100;
};

const subtractItems = (index) => {
  const ls = JSON.parse(localStorage.getItem('Cart List'));
  if (!ls) return;
  const product = ls.find((_, i) => i === index);
  const { salePrice } = product;
  const subtract = Number(totalPrice.innerHTML) - Number(salePrice);
  totalPrice.innerHTML = Math.round(subtract*100)/100;
  localStorage.setItem('Cart List', JSON.stringify([]));
  ls.map(({ sku, name, salePrice }, i) => i !== index && addToLocalStorage(sku, name, salePrice));
};

emptyCart.addEventListener('click', () => {
  totalPrice.innerHTML = '';
  cart.innerHTML = '';
  localStorage.setItem('Cart List', JSON.stringify([]));
});

const waiting = (element) => {
  const items = document.querySelector('.items');
  if (element === true) {
    const h1 = document.createElement('h1');
    h1.className = 'loading';
    h1.innerText = 'loading...';
    return items.appendChild(h1);
  } if (element === false) items.firstChild.remove();
};

window.onload = () => {
  setItemns('Computador');
  getLocalStorage();
};
