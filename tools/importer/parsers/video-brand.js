/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video-brand.
 * Base block: video
 * Source URL: https://www.stagwellglobal.com/
 * Selector: .et_pb_section_1 .et_pb_video
 * Generated: 2026-06-16
 *
 * Target structure (from block library): 1 column, 2 rows.
 *   Row 1: block name ("video-brand")
 *   Row 2: single cell containing the optional poster image and the video source as a link.
 *
 * Source HTML (validated against the live DOM):
 *   <div class="et_pb_video"> ... <video><source src="...Stagwell-2026.mp4"></video> ...
 *     <div class="et_pb_video_overlay" style="background-image:url(...poster.png)">...</div></div>
 *
 * Note: on the live page the poster is a CSS background-image on
 * .et_pb_video_overlay (not an <img>). A scraper may rewrite it to an <img>,
 * so we read the inline background-image first and fall back to an <img>.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against the live DOM) --------------------------

  // Self-hosted mp4 source URL: <source> inside the <video> element.
  const videoSource = element.querySelector('video source[src], video[src], source[src]');
  const videoUrl = videoSource
    ? (videoSource.getAttribute('src') || videoSource.getAttribute('href'))
    : '';

  // Poster / overlay image (optional).
  // Primary: inline background-image on the overlay container.
  // Fallback: an <img> (e.g. when the source was rewritten by a scraper).
  let posterImg = null;
  const overlay = element.querySelector('.et_pb_video_overlay');
  let posterUrl = '';
  if (overlay) {
    const style = overlay.getAttribute('style') || '';
    const match = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (match) posterUrl = match[1];
  }
  if (posterUrl) {
    posterImg = document.createElement('img');
    posterImg.src = posterUrl;
    posterImg.alt = '';
  } else {
    // Fallback: poster provided as an actual <img> element.
    posterImg = element.querySelector('.et_pb_video_overlay img, .et_pb_video_box img, img');
  }

  // OUTPUT CONSTRUCTION (matches block library: single column, poster + video
  // link stacked in one cell). Both nodes go inside one container element so the
  // row stays a single cell rather than being split into multiple columns.
  const cellContent = document.createElement('div');

  if (posterImg) {
    const posterPara = document.createElement('p');
    posterPara.append(posterImg);
    cellContent.append(posterPara);
  }

  if (videoUrl) {
    const linkPara = document.createElement('p');
    const link = document.createElement('a');
    link.href = videoUrl;
    link.textContent = videoUrl;
    linkPara.append(link);
    cellContent.append(linkPara);
  }

  const cells = [[cellContent]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-brand', cells });
  element.replaceWith(block);
}
