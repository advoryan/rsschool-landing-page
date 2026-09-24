const grid = document.querySelector('.catalog__grid');
const cardTemplate = document.querySelector('#card-template');
const catalogStatus = document.querySelector('.catalog__status');
const moreButton = document.querySelector('.catalog__more');
const categories = [...document.querySelectorAll('.category')];
const catalogMobile = window.matchMedia('(max-width: 768px)');
const productDialog = document.querySelector('.modal');
const optionTemplate = document.querySelector('#option-template');
let products = [];
let activeCategory = 'coffee';
let showAllProducts = false;

function createCard(product) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const image = card.querySelector('.card__image');

  card.dataset.productIndex = products.indexOf(product);
  card.querySelector('.card__open').setAttribute('aria-label', `View ${product.name}`);
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
    firstHiddenCard.querySelector('.card__open').focus({ preventScroll: true });
  }
});

catalogMobile.addEventListener('change', updateVisibleProducts);

function createOption(value, label, active = false) {
  const option = optionTemplate.content.firstElementChild.cloneNode(true);
  option.dataset.value = value;
  option.querySelector('.category__icon').textContent = value.toUpperCase();
  option.querySelector('.modal__option-label').textContent = label;
  option.classList.toggle('category--active', active);
  option.setAttribute('aria-pressed', String(active));
  return option;
}

function openProduct(product) {
  const image = document.createElement('img');
  image.className = 'modal__image';
  image.width = 340;
  image.height = 340;
  image.src = product.image;
  image.alt = product.name;
  productDialog.querySelector('.modal__photo').replaceChildren(image);
  productDialog.querySelector('.modal__title').textContent = product.name;
  productDialog.querySelector('.modal__description').textContent = product.description;
  productDialog.querySelector('.modal__price').textContent = `$${Number(product.price).toFixed(2)}`;
  productDialog.querySelector('[data-options="sizes"]').replaceChildren(
    ...Object.entries(product.sizes).map(([key, size]) => createOption(key, size.size, key === 's'))
  );
  productDialog.querySelector('[data-options="additives"]').replaceChildren(
    ...product.additives.map((additive, index) => createOption(String(index + 1), additive.name))
  );
  document.documentElement.classList.add('modal-open');
  productDialog.showModal();
}

grid.addEventListener('click', (event) => {
  const card = event.target.closest('.card');
  if (card) openProduct(products[Number(card.dataset.productIndex)]);
});

productDialog.querySelector('.modal__close').addEventListener('click', () => {
  productDialog.close();
});

productDialog.addEventListener('close', () => {
  document.documentElement.classList.remove('modal-open');
});

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
