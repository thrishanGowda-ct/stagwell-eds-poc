import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Collapse every open nav dropdown and hide the overlay.
 * @param {Element} navSections The nav sections container
 * @param {Element} overlay The backdrop overlay element
 */
function closeAllDropdowns(navSections, overlay) {
  navSections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    drop.setAttribute('aria-expanded', 'false');
  });
  if (overlay) overlay.classList.remove('is-visible');
}

/**
 * Open a single dropdown (closing the others) and show the overlay.
 * @param {Element} drop The nav-drop list item to open
 * @param {Element} navSections The nav sections container
 * @param {Element} overlay The backdrop overlay element
 */
function openDropdown(drop, navSections, overlay) {
  navSections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((other) => {
    if (other !== drop) other.setAttribute('aria-expanded', 'false');
  });
  drop.setAttribute('aria-expanded', 'true');
  if (overlay) overlay.classList.add('is-visible');
}

/**
 * Toggle the mobile menu open/closed.
 * @param {Element} nav The nav element
 * @param {Element} navSections The nav sections container
 * @param {Element} overlay The backdrop overlay element
 * @param {boolean|null} forceExpanded Force a specific state when not null
 */
function toggleMenu(nav, navSections, overlay, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
  if (expanded) closeAllDropdowns(navSections, overlay);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment — try the configured/local path, then the published root path
  const navMeta = getMetadata('nav');
  const candidatePaths = navMeta
    ? [new URL(navMeta, window.location).pathname]
    : ['/content/nav', '/nav'];
  let fragment = null;
  for (let i = 0; i < candidatePaths.length && !fragment; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    fragment = await loadFragment(candidatePaths[i]);
  }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  if (!fragment) return;
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand link cleanup
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const container = brandLink.closest('.button-container');
      if (container) container.className = '';
    }
  }

  // hoist the top-level <ul> to be a direct child of <nav> (nav > ul) so the
  // menu list is the .nav-sections landmark itself, not a wrapped div
  const sectionsWrapper = nav.querySelector('.nav-sections');
  let navSections = sectionsWrapper;
  if (sectionsWrapper) {
    const topUl = sectionsWrapper.querySelector('ul');
    if (topUl && topUl.parentElement !== nav) {
      topUl.classList.add('nav-sections');
      sectionsWrapper.classList.remove('nav-sections');
      sectionsWrapper.replaceWith(topUl);
      navSections = topUl;
    }
  }

  // backdrop overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';

  if (navSections) {
    navSections.querySelectorAll(':scope > li').forEach((navSection) => {
      const submenu = navSection.querySelector('ul');
      if (submenu) {
        navSection.classList.add('nav-drop');
        submenu.classList.add('nav-megamenu-panel');
        submenu.setAttribute('role', 'menu');
        navSection.setAttribute('aria-expanded', 'false');
        // inject the trigger label as a real panel heading element
        const trigger = navSection.querySelector(':scope > a');
        if (trigger) {
          const heading = document.createElement('h2');
          heading.className = 'nav-megamenu-heading';
          heading.textContent = trigger.textContent.trim();
          submenu.prepend(heading);
        }

        // desktop: open on hover of the list item (sibling panels close).
        // Closing is handled at the nav level (mouseleave of the whole header),
        // so the panel stays open while the pointer roams within it.
        navSection.addEventListener('mouseenter', () => {
          if (isDesktop.matches) openDropdown(navSection, navSections, overlay);
        });

        // dropdown trigger is not a real destination — toggle instead of navigating
        if (trigger && (trigger.getAttribute('href') === '#' || !trigger.getAttribute('href'))) {
          trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const open = navSection.getAttribute('aria-expanded') === 'true';
            if (open) closeAllDropdowns(navSections, overlay);
            else openDropdown(navSection, navSections, overlay);
          });
        }
      }
    });
  }

  // close when the pointer leaves the whole header, and on escape
  nav.addEventListener('mouseleave', () => {
    if (isDesktop.matches) closeAllDropdowns(navSections, overlay);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllDropdowns(navSections, overlay);
  });

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections, overlay));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    closeAllDropdowns(navSections, overlay);
    toggleMenu(nav, navSections, overlay, isDesktop.matches);
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  navWrapper.append(overlay);
  block.append(navWrapper);
}
