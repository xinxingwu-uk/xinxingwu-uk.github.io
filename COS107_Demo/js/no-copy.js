/* no-copy.js
   Uses document-level event delegation so it also works when Reveal.js
   creates Markdown/code elements after the page has loaded.
*/

(function () {
  "use strict";

  const protectedSelector = ".no-copy";

  function asElement(node) {
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE
      ? node
      : node.parentElement;
  }

  function protectedContainer(node) {
    const element = asElement(node);
    return element ? element.closest(protectedSelector) : null;
  }

  function selectionIsProtected() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);

    return Boolean(
      protectedContainer(selection.anchorNode) ||
      protectedContainer(selection.focusNode) ||
      protectedContainer(range.commonAncestorContainer)
    );
  }

  function eventIsProtected(event) {
    return Boolean(
      protectedContainer(event.target) ||
      selectionIsProtected()
    );
  }

  function blockEvent(event) {
    if (!eventIsProtected(event)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    /* Avoid leaving protected code in the clipboard. */
    if (event.type === "copy" && event.clipboardData) {
      event.clipboardData.clearData();
      event.clipboardData.setData(
        "text/plain",
        "Copying is disabled for this code example."
      );
    }
  }

  /*
   * Capture phase is important because syntax-highlighting and Reveal.js
   * scripts may otherwise receive the event first.
   */
  [
    "copy",
    "cut",
    "contextmenu",
    "dragstart",
    "selectstart"
  ].forEach(function (eventName) {
    document.addEventListener(eventName, blockEvent, true);
  });

  document.addEventListener(
    "keydown",
    function (event) {
      const modifierPressed = event.ctrlKey || event.metaKey;
      const key = String(event.key || "").toLowerCase();

      if (
        modifierPressed &&
        ["c", "x", "a", "s", "u"].includes(key) &&
        eventIsProtected(event)
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    },
    true
  );
})();
