const grid = document.querySelector('.catalog__grid');
const cardTemplate = document.querySelector('#card-template');
const catalogStatus = document.querySelector('.catalog__status');
const moreButton = document.querySelector('.catalog__more');
const categories = [...document.querySelectorAll('.category')];
const catalogMobile = window.matchMedia('(max-width: 768px)');
let products = [];
let activeCategory = 'coffee';
let showAllProducts = false;

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
  showAllProducts = false;
  updateVisibleProducts();
  moreButton.setAttribute('aria-label', `Show more ${category}`);
}

function updateVisibleProducts() {
  const cards = [...grid.children];
  const limit = catalogMobile.matches && !showAllProducts ? 4 : cards.length;

  cards.forEach((card, index) => {
    card.hidden = index >= limit;
  });
  moreButton.hidden = cards.length <= limit;
}

moreButton.addEventListener('click', () => {
  const firstHiddenCard = grid.querySelector('.card[hidden]');
  showAllProducts = true;
  updateVisibleProducts();

  if (firstHiddenCard) {
    firstHiddenCard.tabIndex = -1;
    firstHiddenCard.focus({ preventScroll: true });
  }
});

catalogMobile.addEventListener('change', updateVisibleProducts);

categories.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.category === activeCategory) return;

    activeCategory = button.dataset.category;
    categories.forEach((category) => {
      const active = category.dataset.category === activeCategory;
      category.classList.toggle('category--active', active);
      category.setAttribute('aria-pressed', String(active));
    });
    renderProducts(activeCategory);
  });
});

async function loadProducts() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Unable to load products');

    products = await response.json();
    renderProducts('coffee');
    catalogStatus.hidden = true;
    categories.forEach((button) => {
      button.disabled = false;
    });
  } catch {
    catalogStatus.textContent = 'Unable to load the menu. Please reload the page.';
  } finally {
    grid.setAttribute('aria-busy', 'false');
  }
}

loadProducts();
