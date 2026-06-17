import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';

  block.textContent = '';
  const wrapper = document.createElement('div');

  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    resp = await fetch(`${footerPath}.plain.html`);
  }

  if (resp.ok) {
    wrapper.innerHTML = await resp.text();
  } else {
    const fragment = await loadFragment(footerPath);
    if (fragment) {
      while (fragment.firstElementChild) wrapper.append(fragment.firstElementChild);
    }
  }
  block.append(wrapper);

  const sections = [...wrapper.children];
  const [logoSection, socialSection, copyrightSection, legalSection] = sections;

  if (logoSection) logoSection.classList.add('footer-logo');

  if (socialSection) {
    socialSection.classList.add('footer-socials');
    socialSection.querySelectorAll('a').forEach((a) => {
      a.classList.add('footer-social-link');
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  }

  if (copyrightSection) {
    copyrightSection.classList.add('footer-copyright');
    const paras = [...copyrightSection.querySelectorAll('p')];
    if (paras.length > 1) {
      const divider = document.createElement('span');
      divider.className = 'footer-divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.textContent = '|';
      paras[0].after(divider);
    }
  }

  if (legalSection) {
    legalSection.classList.add('footer-legal');
    legalSection.querySelectorAll('a').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  }
}
