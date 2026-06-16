/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stats.
 * Base block: cards.
 * Source: https://www.stagwellglobal.com/
 *   (.et_pb_section_5 .et_pb_column_10  — Challenger Marketing Network)
 *   (.et_pb_section_8 .et_pb_column_13  — Investing in Stagwell)
 * Generated for Stagwell Global homepage migration.
 *
 * Source structure: a single Divi column (.et_pb_column) containing several
 * .et_pb_text stat modules. Each module wraps a .et_pb_text_inner holding an
 * <h4> (the headline number/value) and an <h5> (the descriptive label).
 * Some modules include an empty <p>&nbsp;</p> spacer that must be ignored.
 *
 * Target: cards "no-images" variant — text-only stat grid. One row per stat
 * with a single cell containing the number heading followed by its label.
 * The parser operates on the single element passed to it, so it works
 * identically for both instances.
 */
export default function parse(element, { document }) {
  // Each stat is a Divi text module within the column. Scope to direct text
  // modules so we get one row per stat and skip wrapper/helper divs.
  const statModules = Array.from(
    element.querySelectorAll(':scope > .et_pb_text, :scope .et_pb_text'),
  );

  const cells = [];

  statModules.forEach((module) => {
    const inner = module.querySelector('.et_pb_text_inner') || module;

    // Headline value (e.g. "13K+", "$2.7B") and its descriptive label.
    const number = inner.querySelector('h1, h2, h3, h4, h5, h6');
    const label = number
      ? inner.querySelector(
          'h1, h2, h3, h4, h5, h6 ~ h1, h2, h3, h4, h5, h6',
        )
      : null;

    // Prefer an explicit number + label pairing; fall back to all headings.
    const headings = Array.from(inner.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    const body = headings.length ? headings : [];

    // Only emit a row when the module carries meaningful stat content
    // (ignores empty <p>&nbsp;</p> spacers and empty modules).
    if (body.length) {
      cells.push([body]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
