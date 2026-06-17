/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-intro.js
  function parse(element, { document }) {
    const logoImg = element.querySelector(".et_pb_image_0 img, .et_pb_image img");
    const announcement = element.querySelector(".et_pb_text_0 .et_pb_text_inner, .et_pb_text_0 p");
    const headingNodes = Array.from(
      element.querySelectorAll(".et_pb_text_1 h1, .et_pb_text_1 h2, .et_pb_text_1 h3, .et_pb_text_2 h1, .et_pb_text_2 h2, .et_pb_text_2 h3")
    );
    const cells = [];
    if (logoImg) {
      cells.push([logoImg]);
    }
    const contentCell = document.createElement("div");
    if (announcement) {
      contentCell.append(announcement);
    }
    if (headingNodes.length) {
      const level = headingNodes[0].tagName.toLowerCase();
      const heading = document.createElement(level);
      const lines = headingNodes.map((h) => (h.textContent || "").trim()).filter((t) => t.length);
      heading.innerHTML = lines.join("<br>");
      contentCell.append(heading);
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-brand.js
  function parse2(element, { document }) {
    const videoSource = element.querySelector("video source[src], video[src], source[src]");
    const videoUrl = videoSource ? videoSource.getAttribute("src") || videoSource.getAttribute("href") : "";
    let posterImg = null;
    const overlay = element.querySelector(".et_pb_video_overlay");
    let posterUrl = "";
    if (overlay) {
      const style = overlay.getAttribute("style") || "";
      const match = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (match) posterUrl = match[1];
    }
    if (posterUrl) {
      posterImg = document.createElement("img");
      posterImg.src = posterUrl;
      posterImg.alt = "";
    } else {
      posterImg = element.querySelector(".et_pb_video_overlay img, .et_pb_video_box img, img");
    }
    const cellContent = document.createElement("div");
    if (posterImg) {
      const posterPara = document.createElement("p");
      posterPara.append(posterImg);
      cellContent.append(posterPara);
    }
    if (videoUrl) {
      const linkPara = document.createElement("p");
      const link = document.createElement("a");
      link.href = videoUrl;
      link.textContent = videoUrl;
      linkPara.append(link);
      cellContent.append(linkPara);
    }
    const cells = [[cellContent]];
    const block = WebImporter.Blocks.createBlock(document, { name: "video-brand", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-positioning.js
  function parse3(element, { document }) {
    const columns = Array.from(element.querySelectorAll(":scope > .et_pb_column"));
    const rowCells = columns.map((column) => {
      const cellContent = [];
      const textNodes = Array.from(
        column.querySelectorAll(".et_pb_text_inner > *, .et_pb_text_inner")
      ).filter((node) => node.matches("h1, h2, h3, h4, h5, h6, p"));
      if (textNodes.length) {
        cellContent.push(...textNodes);
      } else {
        const inner = column.querySelector(".et_pb_text_inner");
        if (inner) cellContent.push(inner);
      }
      const ctaLinks = Array.from(
        column.querySelectorAll(".stw_inline_button a, a.sw-btn__link, a[href]")
      );
      const seen = /* @__PURE__ */ new Set();
      ctaLinks.forEach((link) => {
        if (!seen.has(link)) {
          seen.add(link);
          cellContent.push(link);
        }
      });
      return cellContent.length ? cellContent : "";
    });
    const cells = [rowCells];
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns-positioning",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse4(element, { document }) {
    const columns = Array.from(element.querySelectorAll(":scope > .et_pb_column"));
    const cells = [];
    columns.forEach((column) => {
      const image = column.querySelector(".et_pb_image img, img");
      const heading = column.querySelector("h1, h2, h3, h4, h5, h6");
      const paragraph = column.querySelector(".et_pb_text .et_pb_text_inner p, .et_pb_text_inner p, p");
      const body = [];
      if (heading) body.push(heading);
      if (paragraph) body.push(paragraph);
      if (image || body.length) {
        cells.push([image || "", body.length ? body : ""]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-capabilities.js
  function parse5(element, { document }) {
    const slideItems = Array.from(
      element.querySelectorAll(".et_pb_dp_dmb_module_820_item")
    ).filter((item) => !item.closest(".slick-cloned"));
    const cells = [["Carousel (capabilities)"]];
    const seenIndexes = /* @__PURE__ */ new Set();
    slideItems.forEach((item) => {
      const indexEl = item.querySelector(".stagwell-main-slider__index");
      const nameEl = item.querySelector(".stagwell-main-slider__name");
      const textEl = item.querySelector(".stagwell-main-slider__text");
      const imageEl = item.querySelector("img.stagwell-main-slider__image, .stagwell-main-slider__image-wrap img");
      const indexKey = indexEl ? indexEl.textContent.trim() : "";
      if (!indexKey || seenIndexes.has(indexKey)) return;
      seenIndexes.add(indexKey);
      const imageCell = imageEl || "";
      const contentCell = [];
      if (indexEl) contentCell.push(indexEl);
      if (nameEl) contentCell.push(nameEl);
      if (textEl) contentCell.push(textEl);
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "carousel-capabilities",
      cells
    });
    const fragment = document.createDocumentFragment();
    const titleEl = element.querySelector(".stagwell-main-slider__title");
    if (titleEl) {
      const heading = document.createElement("h2");
      heading.innerHTML = titleEl.innerHTML;
      fragment.append(heading);
    }
    const introTextEl = element.querySelector(".stagwell-main-slider__static .stagwell-main-slider__text");
    if (introTextEl) {
      introTextEl.querySelectorAll("p").forEach((p) => {
        const text = p.textContent.trim();
        if (text) {
          const para = document.createElement("p");
          para.textContent = text;
          fragment.append(para);
        }
      });
      const list = introTextEl.querySelector("ul");
      if (list) {
        const ul = document.createElement("ul");
        list.querySelectorAll("li").forEach((li) => {
          const item = document.createElement("li");
          item.textContent = li.textContent.trim();
          ul.append(item);
        });
        fragment.append(ul);
      }
    }
    fragment.append(block);
    element.replaceWith(fragment);
  }

  // tools/importer/parsers/cards-stats.js
  function parse6(element, { document }) {
    const statModules = Array.from(
      element.querySelectorAll(":scope > .et_pb_text, :scope .et_pb_text")
    );
    const cells = [];
    statModules.forEach((module) => {
      const inner = module.querySelector(".et_pb_text_inner") || module;
      const number = inner.querySelector("h1, h2, h3, h4, h5, h6");
      const label = number ? inner.querySelector(
        "h1, h2, h3, h4, h5, h6 ~ h1, h2, h3, h4, h5, h6"
      ) : null;
      const headings = Array.from(inner.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      const body = headings.length ? headings : [];
      if (body.length) {
        cells.push([body]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function parse7(element, { document }) {
    const formContainer = element.matches(".hbspt-form") ? element : element.querySelector(".hbspt-form");
    const containerId = formContainer ? formContainer.getAttribute("id") || "" : "";
    const iframe = element.querySelector('iframe.hs-form-iframe, iframe[id^="hs-form-iframe"], iframe');
    const iframeSrc = iframe ? iframe.getAttribute("src") || iframe.getAttribute("data-src") || "" : "";
    const formRef = iframeSrc || containerId;
    const cellContent = document.createElement("div");
    if (formRef) {
      const refPara = document.createElement("p");
      if (iframeSrc) {
        const link = document.createElement("a");
        link.href = iframeSrc;
        link.textContent = iframeSrc;
        refPara.append(link);
      } else {
        refPara.textContent = formRef;
      }
      cellContent.append(refPara);
    }
    const cells = [[cellContent]];
    const block = WebImporter.Blocks.createBlock(document, { name: "form", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/stagwell-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".slick-cloned"]);
      WebImporter.DOMUtils.remove(element, [
        ".stagwell-main-slider__arrow",
        ".stagwell-main-slider__numbering",
        ".stagwell-main-slider__details"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#header",
        "nav.nav-header",
        "footer#footer",
        "nav.nav-footer",
        "#react-portal"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "noscript",
        "link",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-slick-index");
        el.removeAttribute("aria-hidden");
        el.removeAttribute("tabindex");
        el.removeAttribute("role");
      });
    }
  }

  // tools/importer/transformers/stagwell-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const el = element.querySelector(section.selector);
      if (!el) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (el.nextSibling) {
          el.parentNode.insertBefore(metaBlock, el.nextSibling);
        } else {
          el.parentNode.appendChild(metaBlock);
        }
      }
      if (i > 0) {
        el.parentNode.insertBefore(doc.createElement("hr"), el);
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-intro": parse,
    "video-brand": parse2,
    "columns-positioning": parse3,
    "cards-feature": parse4,
    "carousel-capabilities": parse5,
    "cards-stats": parse6,
    form: parse7
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Stagwell Global homepage with hero, content sections, and key brand messaging",
    urls: ["https://www.stagwellglobal.com/"],
    blocks: [
      { name: "hero-intro", instances: [".et_pb_section_0"] },
      { name: "video-brand", instances: [".et_pb_section_1 .et_pb_video"] },
      { name: "columns-positioning", instances: [".et_pb_section_2 .et_pb_row_2"] },
      { name: "cards-feature", instances: [".et_pb_section_3 .et_pb_row_3"] },
      { name: "carousel-capabilities", instances: [".et_pb_section_4 .stagwell-main-slider"] },
      {
        name: "cards-stats",
        instances: [".et_pb_section_5 .et_pb_column_10", ".et_pb_section_8 .et_pb_column_13"]
      },
      { name: "form", instances: [".hbspt-form"] },
      { name: "section-capabilities", instances: [".et_pb_section_4"], section: "dark" },
      { name: "section-challenger", instances: [".et_pb_section_5"], section: "grey" },
      { name: "section-investing", instances: [".et_pb_section_8"], section: "dark" },
      { name: "section-newsletter", instances: [".et_pb_section_9"], section: "accent" }
    ],
    sections: [
      { id: "section-1", name: "Intro Hero", selector: ".et_pb_section_0", style: "light", blocks: ["hero-intro"], defaultContent: [] },
      { id: "section-1-video", name: "Brand Video", selector: ".et_pb_section_1", style: "light", blocks: ["video-brand"], defaultContent: [] },
      { id: "section-2", name: "Positioning Statement", selector: ".et_pb_section_2", style: "light", blocks: ["columns-positioning"], defaultContent: [] },
      { id: "section-3", name: "Feature Columns", selector: ".et_pb_section_3", style: "light", blocks: ["cards-feature"], defaultContent: [] },
      { id: "section-4", name: "Our Capabilities", selector: ".et_pb_section_4", style: "dark", blocks: ["carousel-capabilities"], defaultContent: [".stagwell-main-slider__title", ".stagwell-main-slider__text"] },
      { id: "section-5", name: "Challenger Marketing Network", selector: ".et_pb_section_5", style: "grey", blocks: ["cards-stats"], defaultContent: [".et_pb_text_12", ".et_pb_text_13", ".et_pb_text_14", ".stw_inline_button_1"] },
      { id: "section-6", name: "Latest News", selector: ".et_pb_section_7", style: "light", blocks: [], defaultContent: [".et_pb_text_19", ".et_pb_text_20"] },
      { id: "section-7", name: "Investing in Stagwell", selector: ".et_pb_section_8", style: "dark", blocks: ["cards-stats"], defaultContent: [".et_pb_text_21", ".et_pb_text_22", ".et_pb_text_23", ".stw_inline_button_2"] },
      { id: "section-8", name: "Newsletter Sign Up", selector: ".et_pb_section_9", style: "accent", blocks: ["form"], defaultContent: [".et_pb_text_28", ".et_pb_text_29"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.filter((blockDef) => !blockDef.name.startsWith("section-")).forEach((blockDef) => {
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const pathname = new URL(params.originalURL).pathname.replace(/\.html$/, "").replace(/\/$/, "");
      const path = WebImporter.FileUtils.sanitizePath(pathname || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
