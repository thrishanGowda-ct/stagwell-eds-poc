import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

// supported locales, derived from the /content/{locale}/ folder structure.
// `code` is the folder name; `label` is the author-friendly dropdown text.
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
];
const DEFAULT_LANGUAGE = 'en';

/**
 * Detect the active locale from the current path (e.g. /content/de/index → de).
 * @returns {string} the active locale code, defaulting to English
 */
function getCurrentLanguage() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const match = segments.find((s) => LANGUAGES.some((l) => l.code === s));
  return match || DEFAULT_LANGUAGE;
}

/**
 * Resolve the path prefix up to and including the active locale segment, derived
 * from the current URL so it works both locally (/content/de/index → /content/de)
 * and on the published site (/de/ → /de).
 * @returns {string} the locale base path, or '' when no locale is present
 */
function getLocaleBasePath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const localeIndex = segments.findIndex((s) => LANGUAGES.some((l) => l.code === s));
  if (localeIndex < 0) return '';
  return `/${segments.slice(0, localeIndex + 1).join('/')}`;
}

/**
 * Build the path for the same page under a different locale. Swaps an existing
 * locale segment in place, or inserts one after `content` when none is present.
 * @param {string} code The target locale code
 * @returns {string} the rewritten pathname
 */
function buildLanguageHref(code) {
  const { pathname } = window.location;
  const hadTrailingSlash = pathname.length > 1 && pathname.endsWith('/');
  const segments = pathname.split('/').filter(Boolean);
  const localeIndex = segments.findIndex((s) => LANGUAGES.some((l) => l.code === s));
  if (localeIndex >= 0) {
    segments[localeIndex] = code;
  } else {
    const contentIndex = segments.indexOf('content');
    segments.splice(contentIndex >= 0 ? contentIndex + 1 : 0, 0, code);
  }
  // preserve a trailing slash so language-root paths (e.g. /de/) don't 404
  const isLocaleRoot = segments[segments.length - 1] === code;
  const trailing = (hadTrailingSlash || isLocaleRoot) ? '/' : '';
  return `/${segments.join('/')}${trailing}`;
}

/**
 * Build the globe-icon language switcher and wire up open/close + selection.
 * @returns {Element} the language-switcher container
 */
function buildLanguageSwitcher() {
  const current = getCurrentLanguage();
  const container = document.createElement('div');
  container.className = 'nav-language';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-language-toggle';
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Select language');
  toggle.innerHTML = `<svg class="nav-language-globe" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.6"/>
      <line x1="4.2" y1="7.5" x2="19.8" y2="7.5" stroke="currentColor" stroke-width="1.6"/>
      <line x1="4.2" y1="16.5" x2="19.8" y2="16.5" stroke="currentColor" stroke-width="1.6"/>
    </svg>`;

  const menu = document.createElement('ul');
  menu.className = 'nav-language-menu';
  menu.setAttribute('role', 'menu');
  LANGUAGES.forEach(({ code, label }) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'nav-language-option';
    link.setAttribute('role', 'menuitemradio');
    link.href = buildLanguageHref(code);
    link.lang = code;
    link.textContent = label;
    if (code === current) {
      link.classList.add('is-current');
      link.setAttribute('aria-checked', 'true');
    } else {
      link.setAttribute('aria-checked', 'false');
    }
    item.append(link);
    menu.append(item);
  });

  const close = () => {
    container.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = container.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) close();
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') close();
  });

  container.append(toggle, menu);
  return container;
}

/**
 * Build the search modal overlay and hook up Algolia search with Facets.
 * @returns {Element} the search modal container
 */
async function buildSearchModal() {
  const modal = document.createElement('div');
  modal.className = 'search-modal';
  modal.innerHTML = `
    <div class="search-modal-content">
      <button class="search-close" aria-label="Close Search">&times;</button>
      <div class="search-input-wrapper">
        <svg class="search-input-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/>
          <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" stroke-width="1.6"/>
        </svg>
        <input type="text" id="global-search-input" placeholder="Search Stagwell..." autocomplete="off" />
      </div>
      <div class="search-facets-wrapper" id="global-search-facets"></div>
      <div class="search-results" id="global-search-results"></div>
    </div>
  `;

  const input = modal.querySelector('#global-search-input');
  const resultsContainer = modal.querySelector('#global-search-results');
  const facetsContainer = modal.querySelector('#global-search-facets');

  let activeCategory = '';

  modal.querySelector('.search-close').addEventListener('click', () => {
    modal.classList.remove('is-active');
    document.body.style.overflowY = '';
    input.value = '';
    resultsContainer.innerHTML = '';
    facetsContainer.innerHTML = '';
    activeCategory = '';
  });

  // eslint-disable-next-line import/no-unresolved
  const { default: algoliasearch } = await import('https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.esm.browser.js');
  const client = algoliasearch('EX4T3T2OE1', '89ac8a6eaa175d2683eb6c95c1808ba2');
  const index = client.initIndex('stagwell-index');

  const performSearch = async () => {
    const query = input.value;
    const currentLang = getCurrentLanguage(); // <-- Grabs the active language!

    if (query.trim().length < 2 && !activeCategory) {
      resultsContainer.innerHTML = '';
      facetsContainer.innerHTML = '';
      return;
    }

    try {
      const searchParams = {
        hitsPerPage: 5,
        facets: ['category'],
        facetFilters: [`language:${currentLang}`], // <-- Strict language filter applied
      };

      if (activeCategory) {
        searchParams.facetFilters = [
          `language:${currentLang}`,
          `category:${activeCategory}`,
        ];
      }

      const { hits, facets } = await index.search(query, searchParams);

      const categoryFacets = facets?.category || {};
      let facetsHTML = '';

      if (Object.keys(categoryFacets).length > 0) {
        facetsHTML = Object.entries(categoryFacets).map(([categoryName, count]) => {
          const isSelected = activeCategory === categoryName ? 'is-selected' : '';
          return `<button class="facet-pill ${isSelected}" data-category="${categoryName}">
                    ${categoryName} <span class="facet-count">(${count})</span>
                  </button>`;
        }).join('');
      }

      if (activeCategory) {
        facetsHTML = `<button class="facet-pill clear-facet" data-category="">&times; Clear Filter</button>${facetsHTML}`;
      }

      facetsContainer.innerHTML = facetsHTML;

      if (hits.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No results found.</p>';
        return;
      }

      const resultsHTML = hits.map((hit) => {
        // eslint-disable-next-line no-underscore-dangle
        const title = hit._highlightResult?.title?.value || hit.title || hit.path;
        const description = hit.description || '';
        return `
          <a href="${hit.path}" class="search-result-item">
            <h4 class="search-result-title">${title}</h4>
            <p class="search-result-desc">${description}</p>
          </a>
        `;
      }).join('');

      resultsContainer.innerHTML = resultsHTML;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Algolia Search Error:', error);
      resultsContainer.innerHTML = '<p class="error-results">Search is currently unavailable.</p>';
    }
  };

  input.addEventListener('input', performSearch);

  facetsContainer.addEventListener('click', (e) => {
    const clickedPill = e.target.closest('.facet-pill');
    if (!clickedPill) return;
    activeCategory = clickedPill.getAttribute('data-category');
    performSearch();
    input.focus();
  });

  return modal;
}
/**
 * Toggle the search modal visibility.
 */
async function toggleSearchModal() {
  let searchModal = document.querySelector('.search-modal');
  if (!searchModal) {
    searchModal = await buildSearchModal();
    document.body.append(searchModal);
  }

  const isActive = searchModal.classList.toggle('is-active');
  if (isActive) {
    const input = searchModal.querySelector('input');
    if (input) input.focus();
    document.body.style.overflowY = 'hidden'; // Prevent background scrolling
  } else {
    document.body.style.overflowY = '';
  }
}
/**
 * Build the search icon trigger.
 * @returns {Element} the search trigger container
 */
function buildSearchTrigger() {
  const container = document.createElement('div');
  container.className = 'nav-search';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-label', 'Open search');

  // Inline SVG matching the styling of the globe icon
  toggle.innerHTML = `<svg class="nav-search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" stroke-width="1.6"/>
    </svg>`;

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSearchModal();
  });

  container.append(toggle);
  return container;
}

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
  // load nav as fragment — prefer the active locale's nav, then fall back to
  // the configured/local path and the published root path
  const navMeta = getMetadata('nav');
  const localeBase = getLocaleBasePath();
  const candidatePaths = navMeta
    ? [new URL(navMeta, window.location).pathname]
    : [localeBase && `${localeBase}/nav`, '/content/nav', '/nav'].filter(Boolean);
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
  let brandLogoSrc = '';
  if (navBrand) {
    const brandImg = navBrand.querySelector('img');
    if (brandImg) brandLogoSrc = brandImg.getAttribute('src') || '';
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

  // unwrap <p> wrappers around top-level links so the `li > a` CSS selectors
  // (navy, uppercase, bold) and the dropdown trigger detection both match
  if (navSections) {
    navSections.querySelectorAll(':scope > li > p').forEach((p) => {
      if (p.children.length === 1 && p.firstElementChild.tagName === 'A') {
        p.replaceWith(p.firstElementChild);
      }
    });
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

        // Stagwell logo at the bottom of every dropdown panel (matches source)
        if (brandLogoSrc) {
          const panelLogo = document.createElement('img');
          panelLogo.className = 'nav-megamenu-logo';
          panelLogo.src = brandLogoSrc;
          panelLogo.alt = 'Stagwell';
          panelLogo.loading = 'lazy';
          submenu.append(panelLogo);
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

  // globe language switcher, placed beside the brand logo
  const languageSwitcher = buildLanguageSwitcher();
  if (navBrand) navBrand.before(languageSwitcher);
  else nav.append(languageSwitcher);

  //  Inject search right after the language switcher ---
  const searchTrigger = buildSearchTrigger();
  languageSwitcher.after(searchTrigger);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  navWrapper.append(overlay);
  block.append(navWrapper);
}
