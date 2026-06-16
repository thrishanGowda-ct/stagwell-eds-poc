/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form.
 * Base block: form (forms-plugin base block — no variant)
 * Source URL: https://www.stagwellglobal.com/
 * Selector: .hbspt-form
 * Generated: 2026-06-16
 *
 * Target structure (form block): 1 column.
 *   Row 1: block name ("form")
 *   Row 2: single cell referencing the form source / embed.
 *
 * Source HTML (validated against the live DOM):
 *   <div class="et_pb_module et_pb_code et_pb_code_0">
 *     <div class="et_pb_code_inner">
 *       <div id="hbspt-form-ed92c235-4f50-4403-85c0-d1f38b808043" class="hbspt-form">
 *         <iframe id="hs-form-iframe-0" class="hs-form-iframe" title="Form 0"></iframe>
 *       </div>
 *     </div>
 *   </div>
 *
 * Note: this is an embedded HubSpot newsletter sign-up form. The actual form
 * fields are rendered dynamically inside the <iframe>, so they are not present
 * in the static source. The reliably-available reference is the HubSpot form
 * container id (and the HubSpot region, na1, seen in forms-na1.hsforms.com
 * embed assets on this page). We capture that container id / embed reference as
 * the form source so the import remains valid and the embed can be re-wired
 * after import.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against the live DOM) --------------------------

  // The HubSpot form container. `element` is the .hbspt-form div itself, but
  // support both cases (element matched directly, or a wrapping container).
  const formContainer = element.matches('.hbspt-form')
    ? element
    : element.querySelector('.hbspt-form');

  // HubSpot container id, e.g. "hbspt-form-ed92c235-4f50-4403-85c0-d1f38b808043".
  const containerId = formContainer ? (formContainer.getAttribute('id') || '') : '';

  // Embedded iframe (optional) — carries the rendered form; src may be empty in
  // static HTML because HubSpot injects it client-side.
  const iframe = element.querySelector('iframe.hs-form-iframe, iframe[id^="hs-form-iframe"], iframe');
  const iframeSrc = iframe
    ? (iframe.getAttribute('src') || iframe.getAttribute('data-src') || '')
    : '';

  // Prefer a real embed URL if one is present, otherwise fall back to the
  // HubSpot container id reference.
  const formRef = iframeSrc || containerId;

  // OUTPUT CONSTRUCTION (single column, single content cell) -------------------
  const cellContent = document.createElement('div');

  if (formRef) {
    const refPara = document.createElement('p');
    if (iframeSrc) {
      // Real embed URL → reference as a link.
      const link = document.createElement('a');
      link.href = iframeSrc;
      link.textContent = iframeSrc;
      refPara.append(link);
    } else {
      // Only the container id is available → capture it as text reference.
      refPara.textContent = formRef;
    }
    cellContent.append(refPara);
  }

  const cells = [[cellContent]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
