import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// locale codes that map to /content/{code}/ folders; keep in sync with the header
const LOCALE_CODES = ['en', 'de', 'fr'];

/**
 * Resolve the path prefix up to and including the active locale segment, derived
 * from the current URL so it works both locally (/content/de/index → /content/de)
 * and on the published site (/de/ → /de).
 * @returns {string} the locale base path, or '' when no locale is present
 */
function getLocaleBasePath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const localeIndex = segments.findIndex((s) => LOCALE_CODES.includes(s));
  if (localeIndex < 0) return '';
  return `/${segments.slice(0, localeIndex + 1).join('/')}`;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const localeBase = getLocaleBasePath();
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : `${localeBase}/footer`;

  block.textContent = '';
  const wrapper = document.createElement('div');

  // prefer the active locale's footer, then fall back to the root footer
  const candidatePaths = [
    localeBase && `${localeBase}/footer.plain.html`,
    '/content/footer.plain.html',
    `${footerPath}.plain.html`,
  ].filter(Boolean);
  let resp = null;
  for (let i = 0; i < candidatePaths.length && (!resp || !resp.ok); i += 1) {
    // eslint-disable-next-line no-await-in-loop
    resp = await fetch(candidatePaths[i]);
  }

  if (resp && resp.ok) {
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
