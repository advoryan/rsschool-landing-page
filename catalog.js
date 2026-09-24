const grid = document.querySelector('.catalog__grid');
const cardTemplate = document.querySelector('#card-template');
const catalogStatus = document.querySelector('.catalog__status');
const moreButton = document.querySelector('.catalog__more');
let products = [];

function createCard(product) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const image = card.querySelector('.card__image');

  card.dataset.productIndex = products.indexOf(product);
  image.src = product.image;
  image.alt = product.name;
  card.querySelector('.card__title').textContent = product.name;
  card.querySelector('.card__description').textContent = product.description;
  card.querySelector('.card__price').textContent = `$${Number(product.price).toFixed(2)}`;

  return card;
}

function renderProducts(category) {
  const cards = products
    .filter((product) => product.category === category)
    .map(createCard);

  grid.replaceChildren(...cards);
}

async function loadProducts() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Unable to load products');

    products = await response.json();
    renderProducts('coffee');
    catalogStatus.hidden = true;
    moreButton.hidden = false;
  } catch {
    catalogStatus.textContent = 'Unable to load the menu. Please reload the page.';
  } finally {
    grid.setAttribute('aria-busy', 'false');
  }
}

loadProducts();
