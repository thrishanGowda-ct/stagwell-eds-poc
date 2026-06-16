/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroIntroParser from './parsers/hero-intro.js';
import videoBrandParser from './parsers/video-brand.js';
import columnsPositioningParser from './parsers/columns-positioning.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import carouselCapabilitiesParser from './parsers/carousel-capabilities.js';
import cardsStatsParser from './parsers/cards-stats.js';
import formParser from './parsers/form.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/stagwell-cleanup.js';
import sectionsTransformer from './transformers/stagwell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-intro': heroIntroParser,
  'video-brand': videoBrandParser,
  'columns-positioning': columnsPositioningParser,
  'cards-feature': cardsFeatureParser,
  'carousel-capabilities': carouselCapabilitiesParser,
  'cards-stats': cardsStatsParser,
  form: formParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Stagwell Global homepage with hero, content sections, and key brand messaging',
  urls: ['https://www.stagwellglobal.com/'],
  blocks: [
    { name: 'hero-intro', instances: ['.et_pb_section_0'] },
    { name: 'video-brand', instances: ['.et_pb_section_1 .et_pb_video'] },
    { name: 'columns-positioning', instances: ['.et_pb_section_2 .et_pb_row_2'] },
    { name: 'cards-feature', instances: ['.et_pb_section_3 .et_pb_row_3'] },
    { name: 'carousel-capabilities', instances: ['.et_pb_section_4 .stagwell-main-slider'] },
    {
      name: 'cards-stats',
      instances: ['.et_pb_section_5 .et_pb_column_10', '.et_pb_section_8 .et_pb_column_13'],
    },
    { name: 'form', instances: ['.hbspt-form'] },
    { name: 'section-capabilities', instances: ['.et_pb_section_4'], section: 'dark' },
    { name: 'section-challenger', instances: ['.et_pb_section_5'], section: 'grey' },
    { name: 'section-investing', instances: ['.et_pb_section_8'], section: 'dark' },
    { name: 'section-newsletter', instances: ['.et_pb_section_9'], section: 'accent' },
  ],
  sections: [
    { id: 'section-1', name: 'Intro Hero', selector: '.et_pb_section_0', style: 'light', blocks: ['hero-intro'], defaultContent: [] },
    { id: 'section-1-video', name: 'Brand Video', selector: '.et_pb_section_1', style: 'light', blocks: ['video-brand'], defaultContent: [] },
    { id: 'section-2', name: 'Positioning Statement', selector: '.et_pb_section_2', style: 'light', blocks: ['columns-positioning'], defaultContent: [] },
    { id: 'section-3', name: 'Feature Columns', selector: '.et_pb_section_3', style: 'light', blocks: ['cards-feature'], defaultContent: [] },
    { id: 'section-4', name: 'Our Capabilities', selector: '.et_pb_section_4', style: 'dark', blocks: ['carousel-capabilities'], defaultContent: ['.stagwell-main-slider__title', '.stagwell-main-slider__text'] },
    { id: 'section-5', name: 'Challenger Marketing Network', selector: '.et_pb_section_5', style: 'grey', blocks: ['cards-stats'], defaultContent: ['.et_pb_text_12', '.et_pb_text_13', '.et_pb_text_14', '.stw_inline_button_1'] },
    { id: 'section-6', name: 'Latest News', selector: '.et_pb_section_7', style: 'light', blocks: [], defaultContent: ['.et_pb_text_19', '.et_pb_text_20'] },
    { id: 'section-7', name: 'Investing in Stagwell', selector: '.et_pb_section_8', style: 'dark', blocks: ['cards-stats'], defaultContent: ['.et_pb_text_21', '.et_pb_text_22', '.et_pb_text_23', '.stw_inline_button_2'] },
    { id: 'section-8', name: 'Newsletter Sign Up', selector: '.et_pb_section_9', style: 'accent', blocks: ['form'], defaultContent: ['.et_pb_text_28', '.et_pb_text_29'] },
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

    // 3. Parse each block
    pageBlocks.forEach((block) => {
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

    // 6. Generate sanitized path (root path "/" maps to "/index")
    const pathname = new URL(params.originalURL).pathname
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
    const path = WebImporter.FileUtils.sanitizePath(pathname || '/index');

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
