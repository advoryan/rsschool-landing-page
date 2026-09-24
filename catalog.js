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
let dialogTrigger = null;
let backdropPressed = false;
let currentProduct = null;

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

function openProduct(product, trigger) {
  currentProduct = product;
  dialogTrigger = trigger;
  backdropPressed = false;
  const image = document.createElement('img');
  image.className = 'modal__image';
  image.width = 340;
  image.height = 340;
  image.src = product.image;
  image.alt = product.name;
  productDialog.querySelector('.modal__photo').replaceChildren(image);
  productDialog.querySelector('.modal__title').textContent = product.name;
  productDialog.querySelector('.modal__description').textContent = product.description;
  productDialog.querySelector('[data-options="sizes"]').replaceChildren(
    ...Object.entries(product.sizes).map(([key, size]) => createOption(key, size.size, key === 's'))
  );
  productDialog.querySelector('[data-options="additives"]').replaceChildren(
    ...product.additives.map((additive, index) => createOption(String(index + 1), additive.name))
  );
  updateProductPrice();
  document.documentElement.classList.add('modal-open');
  productDialog.showModal();
}

function updateProductPrice() {
  const size = productDialog.querySelector('[data-options="sizes"] [aria-pressed="true"]');
  const additives = productDialog.querySelectorAll('[data-options="additives"] [aria-pressed="true"]');
  let total = Math.round(Number(currentProduct.price) * 100);
  total += Math.round(Number(currentProduct.sizes[size.dataset.value]['add-price']) * 100);

  additives.forEach((option) => {
    const additive = currentProduct.additives[Number(option.dataset.value) - 1];
    total += Math.round(Number(additive['add-price']) * 100);
  });

  productDialog.querySelector('.modal__price').textContent = `$${(total / 100).toFixed(2)}`;
}

grid.addEventListener('click', (event) => {
  const card = event.target.closest('.card');
  if (card) {
    openProduct(products[Number(card.dataset.productIndex)], card.querySelector('.card__open'));
  }
});

function isOutsideDialog(event) {
  const bounds = productDialog.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom;
}

productDialog.addEventListener('pointerdown', (event) => {
  backdropPressed = event.target === productDialog && isOutsideDialog(event);
});

productDialog.addEventListener('click', (event) => {
  const option = event.target.closest('.modal__option');
  if (option) {
    const group = option.closest('.modal__options');

    group.querySelectorAll('.modal__option').forEach((button) => {
      let active = button.getAttribute('aria-pressed') === 'true';
      if (group.dataset.options === 'sizes') {
        active = button === option;
      } else if (button === option) {
        active = !active;
      }
      button.classList.toggle('category--active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateProductPrice();
  }

  if (backdropPressed && event.target === productDialog && isOutsideDialog(event)) {
    productDialog.close();
  }
  backdropPressed = false;
});

productDialog.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;

  const buttons = [...productDialog.querySelectorAll('button:not(:disabled)')];
  const first = buttons[0];
  const last = buttons[buttons.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

productDialog.querySelector('.modal__close').addEventListener('click', () => {
  productDialog.close();
});

productDialog.addEventListener('close', () => {
  if (productDialog.open) return;

  document.documentElement.classList.remove('modal-open');
  const target = dialogTrigger?.getClientRects().length
    ? dialogTrigger
    : document.querySelector('.catalog__categories .category--active');
  target.focus({ preventScroll: true });
  dialogTrigger = null;
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
