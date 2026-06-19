/**
 * Moves nodes after a <br> into a styled span inside the heading.
 * @param {Element} heading
 * @param {string} spanClass
 * @returns {boolean}
 */
function wrapLineAfterBreak(heading, spanClass) {
  const br = heading.querySelector('br');
  if (!br) return false;

  const span = document.createElement('span');
  span.className = spanClass;
  let node = br.nextSibling;
  while (node) {
    const next = node.nextSibling;
    span.appendChild(node);
    node = next;
  }
  br.remove();
  if (span.childNodes.length) heading.append(span);
  return span.childNodes.length > 0;
}

/**
 * hero-intro block
 * Homepage: wraps the second headline line (after <br>) in h3 for display serif styling.
 * About Us: styles "About" / "Stagwell" h1 intro on /en/about-us.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const aboutHeading = block.querySelector('h1');
  if (aboutHeading) {
    const headingText = aboutHeading.textContent.replace(/\s+/g, ' ').trim();
    const isAboutIntro = aboutHeading.querySelector('br')
      || /^about\s+stagwell$/i.test(headingText);
    if (isAboutIntro) {
      block.classList.add('hero-intro-about');
      aboutHeading.classList.add('hero-intro-about-title');
      wrapLineAfterBreak(aboutHeading, 'hero-intro-about-brand');
      const intro = block.querySelector('p');
      if (intro) intro.classList.add('hero-intro-about-intro');
      return;
    }
  }

  const heading = block.querySelector('h3');
  if (!heading) return;

  wrapLineAfterBreak(heading, 'display-line');
}
