import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const isSingleCard = block.children.length === 1;
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
    if (heading && !isSingleCard) {
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

  // Augmented Reality article rows: one card per block, horizontal media layout.
  if (ul.children.length === 1) {
    const body = ul.querySelector('.cards-feature-card-body');
    const heading = body?.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && /^ar in /i.test(heading.textContent.trim())) {
      block.classList.add('cards-feature-ar-article');
      ul.classList.add('cards-feature-ar-article-list');
      ul.querySelectorAll(':scope > li').forEach((li) => {
        li.classList.add('cards-feature-ar-article-item');
      });
      ul.querySelectorAll('.cards-feature-card-image').forEach((imageDiv) => {
        imageDiv.classList.add('cards-feature-ar-image');
      });
      heading.classList.add('cards-feature-ar-title');
      const lastP = body?.querySelector('p:last-of-type');
      if (lastP && /read more/i.test(lastP.textContent.trim())) {
        lastP.classList.add('cards-feature-ar-cta');
      }
    } else {
      block.classList.add('cards-feature-article');
      const lastP = body?.querySelector('p:last-of-type');
      if (lastP) lastP.classList.add('cards-feature-cta');
    }
  }
}
