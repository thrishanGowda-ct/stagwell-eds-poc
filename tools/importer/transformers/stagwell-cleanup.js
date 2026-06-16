/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Stagwell Global site-wide cleanup.
 *
 * Source: WordPress + Divi page builder (sgstg.wpengine.com / stagwellglobal.com).
 * All selectors below are taken from migration-work/cleaned.html (the captured DOM
 * of https://www.stagwellglobal.com/). None are guessed.
 *
 * beforeTransform: removes elements that would corrupt block parsing — most
 *   importantly the slick carousel's duplicated `.slick-cloned` slides (the slider
 *   clones the first/last cards for its infinite loop; if left in place the
 *   carousel parser would emit duplicate cards). Also strips decorative slider
 *   chrome (nav arrows, slide counter) that is not authorable content.
 * afterTransform: removes non-authorable site shell (header, footer, nav,
 *   React portal), embedded form iframes and other safe-to-drop elements, then
 *   cleans leftover attributes.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Carousel infinite-loop duplicates — found at lines 318+ in cleaned.html:
    //   <div class="slick-slide slick-cloned" id="">
    // Remove so the carousel-capabilities parser only sees the real slides.
    WebImporter.DOMUtils.remove(element, ['.slick-cloned']);

    // Decorative slider controls (not authorable):
    //   <button class="stagwell-main-slider__arrow js-main-slider-prev/next"> (lines 307,310)
    //   <div class="stagwell-main-slider__numbering"> (line 303) — "01 / 05" counter
    WebImporter.DOMUtils.remove(element, [
      '.stagwell-main-slider__arrow',
      '.stagwell-main-slider__numbering',
      '.stagwell-main-slider__details',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (site shell). Verified in cleaned.html:
    //   <header id="header" class="header js-homepage"> (line 2)
    //   <nav class="nav-header"> (line 4)
    //   <footer id="footer" class="footer"> (line 767)
    //   <nav class="nav-footer"> (line 792)
    //   <div id="react-portal"> ... <div id="react-portal-tooltip"> (lines 813-815)
    WebImporter.DOMUtils.remove(element, [
      'header#header',
      'nav.nav-header',
      'footer#footer',
      'nav.nav-footer',
      '#react-portal',
    ]);

    // Embedded form iframes / safe-to-drop elements. Verified in cleaned.html:
    //   <iframe id="hs-form-iframe-0" class="hs-form-iframe"> (line 755) — empty HubSpot embed
    //   <iframe> (line 820) — trailing empty iframe
    // The authorable form is handled separately via the `.hbspt-form` parser.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'noscript',
      'link',
      'source',
    ]);

    // Strip leftover WordPress/Divi tracking + interaction attributes so the
    // import contains only authorable markup. (Attributes observed throughout
    // the Divi modules in cleaned.html.)
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-slick-index');
      el.removeAttribute('aria-hidden');
      el.removeAttribute('tabindex');
      el.removeAttribute('role');
    });
  }
}
