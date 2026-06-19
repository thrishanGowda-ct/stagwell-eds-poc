import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  readBlockConfig,
  toClassName,
} from './aem.js';

/**
 * Reads `section-metadata` tables and applies the configured styles as classes
 * on the parent section, then removes the metadata block. This project's
 * aem.js decorateSections does not handle section metadata, so we process it
 * here before decorateSections runs (otherwise it is treated as a block).
 * @param {Element} main The container element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > div > div.section-metadata').forEach((metaBlock) => {
    const section = metaBlock.parentElement;
    const meta = readBlockConfig(metaBlock);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') {
        meta.style.split(',').map((s) => toClassName(s.trim())).filter((s) => s).forEach((s) => {
          section.classList.add(s);
        });
      } else {
        section.dataset[toClassName(key)] = meta[key];
      }
    });
    metaBlock.remove();
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Challenger Marketing Network section headings.
 * @param {Element} main The main element
 */
function decorateChallengerSection(main) {
  main.querySelectorAll('.section').forEach((section) => {
    if (!section.querySelector('.cards-stats')) return;

    const headings = [...section.querySelectorAll('h2')]
      .filter((h) => !h.closest('.cards-stats'));
    const challenger = headings.find((h) => /^the challenger$/i.test(h.textContent.trim()));
    const network = headings.find((h) => /^marketing network$/i.test(h.textContent.trim()));
    if (!challenger || !network || challenger.closest('.challenger-heading')) return;

    section.classList.add('challenger-section');

    const group = document.createElement('div');
    group.classList.add('challenger-heading');
    challenger.before(group);
    group.append(challenger, network);
    network.classList.add('challenger-heading-accent');
  });
}

/**
 * About Us leadership section: heading + carousel blocks.
 * @param {Element} main The main element
 */
function decorateLeadershipSection(main) {
  main.querySelectorAll('.section').forEach((section) => {
    if (!section.querySelector('.carousel-leadership')) return;

    section.classList.add('leadership-section');

    const headings = [...section.querySelectorAll('h2')]
      .filter((h) => !h.closest('.carousel-leadership'));
    const executive = headings.find((h) => /^our executive$/i.test(h.textContent.trim()));
    const leadership = headings.find((h) => /^leadership$/i.test(h.textContent.trim()));
    if (!executive || !leadership || executive.closest('.leadership-heading')) return;

    const group = document.createElement('div');
    group.classList.add('leadership-heading');
    executive.before(group);
    group.append(executive, leadership);
    leadership.classList.add('leadership-heading-accent');
  });
}

/**
 * Augmented Reality page: split into Stagwell section structure and tag for styling.
 *   1. Hero — title + label
 *   2. Intro copy — body paragraphs (offset right on desktop)
 *   3. Our AR Tech in Action — image + quote
 *   4–6. Article cards — one cards-feature block per section
 * @param {Element} main The main element
 */
function isArLabelParagraph(p) {
  return /marketing\s+frontiers/i.test(p.textContent);
}

function isArIntroParagraph(p) {
  if (isArLabelParagraph(p) || p.querySelector('strong') || /read more/i.test(p.textContent)) {
    return false;
  }
  const text = p.textContent.trim();
  return text.length > 60
    || /mobile-enabled|mixed-reality|augmented reality is the play|conversant in mixed-reality/i.test(
      text,
    );
}

function createArSection(insertAfter, classNames) {
  const section = document.createElement('div');
  section.classList.add('section', ...classNames);
  section.dataset.sectionStatus = 'initialized';
  const host = document.createElement('div');
  section.append(host);
  insertAfter.after(section);
  return { section, host };
}

function ensureArIntroSection(main, introPs, insertAfter) {
  if (!introPs.length) return null;

  let introSection = main.querySelector('.ar-intro-section');
  if (!introSection) {
    ({ section: introSection } = createArSection(insertAfter, ['light', 'ar-intro-section']));
    const wrapper = document.createElement('div');
    wrapper.classList.add('default-content-wrapper', 'ar-intro-content');
    introSection.querySelector(':scope > div').append(wrapper);
  }

  const wrapper = introSection.querySelector('.ar-intro-content');
  introPs.forEach((p) => wrapper.append(p));
  return introSection;
}

function splitMergedArBlocks(main) {
  const merged = [...main.querySelectorAll('.section')].find((section) => (
    section.querySelector('.columns-positioning') && section.querySelector('.cards-feature')
  ));
  if (!merged) return;

  const cardWrappers = [...merged.querySelectorAll('.cards-feature-wrapper')];
  let anchor = merged;
  cardWrappers.forEach((wrapper) => {
    const { section, host } = createArSection(anchor, [
      'light',
      'ar-article-section',
      'cards-feature-container',
    ]);
    host.append(wrapper);
    anchor = section;
  });

  merged.classList.remove('cards-feature-container');

  const introWrapper = merged.querySelector('.default-content-wrapper');
  if (introWrapper) {
    const introPs = [...introWrapper.querySelectorAll('p')].filter(isArIntroParagraph);
    const heroSection = main.querySelector('.hero-intro')?.closest('.section');
    if (introPs.length && heroSection) {
      ensureArIntroSection(main, introPs, heroSection);
    }
    if (!introWrapper.textContent.trim()) introWrapper.remove();
  }

  if (merged.querySelector('.columns-positioning')) {
    merged.classList.add('ar-quote-section', 'light');
  }
}

function decorateAugmentedRealitySections(main) {
  if (main.dataset.arSectionsDecorated) return;

  const heroBlock = main.querySelector('.hero-intro');
  const heroH1 = heroBlock?.querySelector('h1');
  const isArPage = (heroH1 && /augmented\s+reality/i.test(heroH1.textContent.trim()))
    || /\/augmented-reality\/?$/.test(window.location.pathname);
  if (!isArPage) return;

  main.dataset.arSectionsDecorated = 'true';

  splitMergedArBlocks(main);

  const heroSection = heroBlock?.closest('.section');
  if (heroSection) {
    heroSection.classList.add('ar-hero-section', 'light');
    heroSection.querySelectorAll('.default-content-wrapper').forEach((wrapper) => {
      if (wrapper.querySelector('img[src*="about:error"], img[src^="about:"]')) wrapper.remove();
    });

    const introFromHero = heroBlock
      ? [...heroBlock.querySelectorAll('p')].filter(isArIntroParagraph)
      : [];
    if (introFromHero.length) {
      ensureArIntroSection(main, introFromHero, heroSection);
    }
  }

  main.querySelectorAll('.section').forEach((section) => {
    if (section.querySelector('.columns-positioning-ar, .columns-positioning')) {
      const heading = section.querySelector('h3');
      if (heading && /ar tech/i.test(heading.textContent)) {
        section.classList.add('ar-quote-section', 'light');
      }
    }
    if (section.querySelector('.cards-feature-ar-article') && !section.classList.contains('ar-article-section')) {
      section.classList.add('ar-article-section', 'light', 'cards-feature-container');
    }
  });

  const orphanIntro = [...main.querySelectorAll('.section')].find((section) => {
    if (section === heroSection || section.classList.contains('ar-intro-section')) return false;
    const wrapper = section.querySelector(':scope > .default-content-wrapper');
    if (!wrapper || section.querySelector('.block')) return false;
    return [...wrapper.querySelectorAll('p')].some(isArIntroParagraph);
  });
  if (orphanIntro && heroSection) {
    orphanIntro.classList.add('ar-intro-section', 'light');
    orphanIntro.querySelector('.default-content-wrapper')?.classList.add('ar-intro-content');
  }
}

/**
 * Newsletter sign-up: move vector logo image to a right-side decorative background.
 * Shared by About Us, AR, and homepage.
 * @param {Element} main The main element
 */
function decorateNewsletterSection(main) {
  main.querySelectorAll('.section.accent').forEach((section) => {
    if (!section.querySelector('.form')) return;
    if (section.classList.contains('newsletter-section')) return;

    section.classList.add('newsletter-section');

    const wrapper = section.querySelector(':scope > .default-content-wrapper');
    if (!wrapper) return;

    const bgParagraph = [...wrapper.querySelectorAll('p')].find((p) => (
      p.querySelector('picture, img') && !p.textContent.replace(/\u00a0/g, ' ').trim()
    ));
    if (!bgParagraph) return;

    const picture = bgParagraph.querySelector('picture') || bgParagraph.querySelector('img');
    if (!picture) return;

    const bgWrap = document.createElement('div');
    bgWrap.className = 'newsletter-bg';
    bgWrap.setAttribute('aria-hidden', 'true');
    bgWrap.append(picture);
    bgParagraph.remove();

    section.querySelector(':scope > div')?.append(bgWrap);
  });
}

/**
 * Contact Us section: heading + intro row, three-column contact details.
 * Shared by About Us (GENERAL + WORK WITH US) and AR page (EMAIL only).
 * @param {Element} main The main element
 */
function getContactColumnLabel(paragraph) {
  return paragraph.querySelector('strong')?.textContent.trim() || '';
}

function decorateContactSection(main) {
  main.querySelectorAll('.section').forEach((section) => {
    if (section.classList.contains('contact-section')) return;

    const wrapper = section.querySelector(':scope > .default-content-wrapper');
    if (!wrapper || section.querySelector('.block')) return;

    const heading = [...wrapper.querySelectorAll('h2')].find((h) => /contact/i.test(h.textContent));
    if (!heading) return;

    const intro = [...wrapper.querySelectorAll('p')].find((p) => (
      !p.querySelector('strong') && /get in touch|message|experts behind/i.test(p.textContent)
    ));
    const detailPs = [...wrapper.querySelectorAll('p')].filter((p) => p !== intro);

    const phoneIdx = detailPs.findIndex((p) => /^phone$/i.test(getContactColumnLabel(p)));
    const addressIdx = detailPs.findIndex((p) => /^global address$/i.test(getContactColumnLabel(p)));
    if (phoneIdx < 0 || addressIdx < 0) return;

    const emailColumnLabels = /^(general|email|work with us)$/i;
    const hasEmailColumn = detailPs.slice(0, phoneIdx).some((p) => (
      emailColumnLabels.test(getContactColumnLabel(p))
    ));
    if (!hasEmailColumn) return;

    section.classList.add('contact-section');

    const headingEl = document.createElement('h2');
    const accentSpan = heading.querySelector('span');
    if (accentSpan) {
      headingEl.append(document.createTextNode('Contact '));
      const accent = document.createElement('span');
      accent.className = 'contact-heading-accent';
      accent.textContent = accentSpan.textContent.trim();
      headingEl.append(accent);
      heading.remove();
    } else if (/^contact\s+us$/i.test(heading.textContent.trim())) {
      headingEl.append(document.createTextNode('Contact '));
      const accent = document.createElement('span');
      accent.className = 'contact-heading-accent';
      accent.textContent = 'Us';
      headingEl.append(accent);
      heading.remove();
    } else {
      headingEl.textContent = heading.textContent;
      heading.remove();
    }

    const headingWrap = document.createElement('div');
    headingWrap.className = 'contact-heading';
    headingWrap.append(headingEl);

    if (intro) intro.classList.add('contact-intro');

    const layout = document.createElement('div');
    layout.className = 'contact-layout';
    wrapper.prepend(layout);
    layout.append(headingWrap);
    if (intro) layout.append(intro);

    const columnClasses = ['contact-column-emails', 'contact-column-phone', 'contact-column-address'];
    [
      detailPs.slice(0, phoneIdx),
      detailPs.slice(phoneIdx, addressIdx),
      detailPs.slice(addressIdx),
    ].forEach((paragraphs, index) => {
      const column = document.createElement('div');
      column.className = `contact-column ${columnClasses[index]}`;
      paragraphs.forEach((p) => column.append(p));
      layout.append(column);
    });
  });
}

/**
 * About Us mission section: "Accelerating Change. Revolutionizing Growth."
 * @param {Element} main The main element
 */
function decorateAboutMissionSection(main) {
  main.querySelectorAll('.section').forEach((section) => {
    if (section.querySelector('.block')) return;

    const h4 = section.querySelector('h4');
    const p = section.querySelector('p');
    if (!h4 || !p || !/accelerating change/i.test(h4.textContent)) return;

    section.classList.add('about-mission');
    const content = h4.parentElement;
    if (content) content.classList.add('about-mission-content');
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSectionMetadata(main);
  decorateSections(main);
  decorateChallengerSection(main);
  decorateLeadershipSection(main);
  decorateContactSection(main);
  decorateAboutMissionSection(main);
  decorateNewsletterSection(main);
  decorateBlocks(main);
  decorateAugmentedRealitySections(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
