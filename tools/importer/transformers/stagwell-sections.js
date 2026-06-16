/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Stagwell Global section breaks + section metadata.
 *
 * Driven entirely by payload.template.sections (from page-templates.json).
 * Runs in afterTransform only.
 *
 * For each section (processed in reverse document order so inserts don't shift
 * earlier section elements):
 *   - If the section has a `style`, append a "Section Metadata" block immediately
 *     after the section element.
 *   - For every section except the first, insert an <hr> before the section
 *     element to mark the section break.
 *
 * Section selectors are the Divi container selectors verified in
 * migration-work/cleaned.html (e.g. .et_pb_section_0 line 133, .et_pb_section_9
 * line 730). The DOM has no .et_pb_section_6, matching the template.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument;

  // Process in reverse so DOM insertions don't disturb not-yet-processed sections.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const el = element.querySelector(section.selector);
    if (!el) continue;

    // Section Metadata block after the section element (only when style is set).
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (el.nextSibling) {
        el.parentNode.insertBefore(metaBlock, el.nextSibling);
      } else {
        el.parentNode.appendChild(metaBlock);
      }
    }

    // Section break before every section except the first.
    if (i > 0) {
      el.parentNode.insertBefore(doc.createElement('hr'), el);
    }
  }
}
