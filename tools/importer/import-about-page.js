/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroIntroParser from './parsers/hero-intro.js';
import columnsPositioningParser from './parsers/columns-positioning.js';
import carouselLeadershipParser from './parsers/carousel-leadership.js';
import carouselCapabilitiesParser from './parsers/carousel-capabilities.js';
import cardsStatsParser from './parsers/cards-stats.js';
import formParser from './parsers/form.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/stagwell-cleanup.js';
import sectionsTransformer from './transformers/stagwell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-intro': heroIntroParser,
  'columns-positioning': columnsPositioningParser,
  'carousel-leadership': carouselLeadershipParser,
  'carousel-capabilities': carouselCapabilitiesParser,
  'cards-stats': cardsStatsParser,
  form: formParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-page',
  description: 'Stagwell About Us page with hero intro, our story, executive leadership, capabilities carousel, challenger stats, impact, contact, and newsletter',
  urls: ['https://www.stagwellglobal.com/about-us/'],
  blocks: [
    { name: 'hero-intro', instances: ['.et_pb_section_0'] },
    { name: 'columns-positioning', instances: ['.et_pb_section_1 .et_pb_row_1', '.et_pb_section_7 .et_pb_row_7'] },
    { name: 'carousel-leadership', instances: ['.et_pb_section_3 .stw_featured_person', '.et_pb_section_3 .stw_people_slider'] },
    { name: 'carousel-capabilities', instances: ['.et_pb_section_4 .stagwell-main-slider'] },
    { name: 'cards-stats', instances: ['#sw-featured-stats .et_pb_column_8'] },
    { name: 'form', instances: ['.hbspt-form'] },
    { name: 'section-capabilities', instances: ['.et_pb_section_4'], section: 'dark' },
    { name: 'section-challenger', instances: ['#sw-featured-stats'], section: 'grey' },
    { name: 'section-newsletter', instances: ['.et_pb_section_9'], section: 'accent' },
  ],
  sections: [
    { id: 'section-1', name: 'Hero Intro', selector: '.et_pb_section_0', style: 'light', blocks: ['hero-intro'], defaultContent: [] },
    { id: 'section-2', name: 'Our Story', selector: '.et_pb_section_1', style: 'light', blocks: ['columns-positioning'], defaultContent: [] },
    { id: 'section-3', name: 'Accelerating Change', selector: '.et_pb_section_2', style: 'light', blocks: [], defaultContent: ['.et_pb_section_2 .et_pb_text_inner'] },
    { id: 'section-4', name: 'Executive Leadership', selector: '.et_pb_section_3', style: 'light', blocks: ['carousel-leadership'], defaultContent: ['.et_pb_text_7', '.et_pb_text_8'] },
    { id: 'section-5', name: 'Our Capabilities', selector: '.et_pb_section_4', style: 'dark', blocks: ['carousel-capabilities'], defaultContent: [] },
    { id: 'section-6', name: 'Spacer', selector: '.et_pb_section_5', style: 'light', blocks: [], defaultContent: [] },
    { id: 'section-7', name: 'Challenger Marketing Network', selector: '#sw-featured-stats', style: 'grey', blocks: ['cards-stats'], defaultContent: ['.et_pb_text_9', '.et_pb_text_10', '.et_pb_text_11'] },
    { id: 'section-8', name: 'Our Impact', selector: '.et_pb_section_7', style: 'light', blocks: ['columns-positioning'], defaultContent: [] },
    { id: 'section-9', name: 'Contact Us', selector: '#sw-contact-us', style: 'light', blocks: [], defaultContent: ['.et_pb_text_24', '.et_pb_text_25'] },
    { id: 'section-10', name: 'Newsletter Sign Up', selector: '.et_pb_section_9', style: 'accent', blocks: ['form'], defaultContent: ['.et_pb_text_26'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, sections after (in afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks
    .filter((blockDef) => !blockDef.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      });
    });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path under the /en locale folder so the page
    //    serves at /content/en/about-us
    const pathname = new URL(params.originalURL).pathname
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
    const localized = `/en${pathname || '/index'}`;
    const path = WebImporter.FileUtils.sanitizePath(localized);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
