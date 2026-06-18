/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroIntroParser from './parsers/hero-intro.js';
import columnsPositioningParser from './parsers/columns-positioning.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsStatsParser from './parsers/cards-stats.js';
import formParser from './parsers/form.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/stagwell-cleanup.js';
import sectionsTransformer from './transformers/stagwell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-intro': heroIntroParser,
  'columns-positioning': columnsPositioningParser,
  'cards-feature': cardsFeatureParser,
  'cards-stats': cardsStatsParser,
  form: formParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'augmented-reality',
  description: 'Stagwell Augmented Reality marketing-frontiers page: hero intro, intro copy, AR tech feature quote, three AR article cards, Data Corner stats, contact, and newsletter',
  urls: ['https://www.stagwellglobal.com/augmented-reality/'],
  blocks: [
    { name: 'hero-intro', instances: ['.et_pb_section_0 .et_pb_row_0'] },
    { name: 'columns-positioning', instances: ['.et_pb_section_0 .et_pb_row_2'] },
    { name: 'cards-feature', instances: ['.et_pb_section_0 .et_pb_row_4', '.et_pb_section_0 .et_pb_row_6', '.et_pb_section_0 .et_pb_row_8'] },
    { name: 'cards-stats', instances: ['.et_pb_section_1 .et_pb_column_19'] },
    { name: 'form', instances: ['.hbspt-form'] },
    { name: 'section-newsletter', instances: ['.et_pb_section_4'], section: 'accent' },
  ],
  sections: [
    { id: 'section-1', name: 'Hero Intro', selector: '.et_pb_section_0 .et_pb_row_0', style: 'light', blocks: ['hero-intro'], defaultContent: [] },
    { id: 'section-2', name: 'Intro Copy', selector: '.et_pb_section_0 .et_pb_row_1', style: 'light', blocks: [], defaultContent: ['.et_pb_section_0 .et_pb_row_1 .et_pb_text_inner'] },
    { id: 'section-3', name: 'Our AR Tech in Action', selector: '.et_pb_section_0 .et_pb_row_2', style: 'light', blocks: ['columns-positioning'], defaultContent: [] },
    { id: 'section-4', name: 'AR Article Cards', selector: '.et_pb_section_0 .et_pb_row_4', style: 'light', blocks: ['cards-feature'], defaultContent: [] },
    { id: 'section-5', name: 'Data Corner', selector: '.et_pb_section_1', style: 'light', blocks: ['cards-stats'], defaultContent: [] },
    { id: 'section-6', name: 'Contact Us', selector: '#sw-contact-us', style: 'light', blocks: [], defaultContent: [] },
    { id: 'section-7', name: 'Newsletter Sign Up', selector: '.et_pb_section_4', style: 'accent', blocks: ['form'], defaultContent: [] },
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
    //    serves at /content/en/augmented-reality
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
