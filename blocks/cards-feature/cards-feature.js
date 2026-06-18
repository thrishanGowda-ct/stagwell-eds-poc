import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    let imageDiv;
    let bodyDiv;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-feature-card-image';
        imageDiv = div;
      } else {
        div.className = 'cards-feature-card-body';
        bodyDiv = div;
      }
    });

    const heading = bodyDiv?.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'cards-feature-card-title';
      titleDiv.append(heading);
      li.innerHTML = '';
      li.append(titleDiv);
      if (imageDiv) li.append(imageDiv);
      if (bodyDiv) li.append(bodyDiv);
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  // Single-card usage (e.g. the Augmented Reality article rows) renders as a
  // horizontal media row (image left, text right) instead of the 3-up grid.
  // Tag it so layout CSS can target only this case without touching the grid.
  if (ul.children.length === 1) {
    block.classList.add('cards-feature-article');
    const card = ul.querySelector('li');
    // The last paragraph in the body acts as the "Read More" call to action.
    const body = card?.querySelector('.cards-feature-card-body');
    const lastP = body?.querySelector('p:last-of-type');
    if (lastP) lastP.classList.add('cards-feature-cta');
  }
}
