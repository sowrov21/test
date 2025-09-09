
// blockUI.vanilla.js
// A Vanilla JS version replicating jQuery BlockUI plugin (v2.70)
// Author: ChatGPT - OpenAI

(function(global) {
  'use strict';

  const defaults = {
    message: '<h1>Please wait...</h1>',
    css: {
      position: 'fixed',
      top: '40%',
      left: '35%',
      width: '30%',
      textAlign: 'center',
      color: '#000',
      border: '3px solid #aaa',
      backgroundColor: '#fff',
      cursor: 'wait',
      zIndex: 1001,
      padding: '20px'
    },
    overlayCSS: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      opacity: 0.6,
      cursor: 'wait',
      zIndex: 1000
    },
    showOverlay: true,
    fadeIn: 200,
    fadeOut: 400,
    timeout: 0,
    onBlock: null,
    onUnblock: null,
    blockMsgClass: 'blockMsg'
  };

  const blockMap = new WeakMap();

  function createEl(tag, styles, html) {
    const el = document.createElement(tag);
    Object.assign(el.style, styles);
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  function fadeIn(el, duration, callback) {
    el.style.opacity = 0;
    el.style.display = 'block';
    let last = +new Date();
    const tick = function() {
      el.style.opacity = +el.style.opacity + (new Date() - last) / duration;
      last = +new Date();

      if (+el.style.opacity < 1) {
        requestAnimationFrame(tick);
      } else {
        if (callback) callback();
      }
    };
    tick();
  }

  function fadeOut(el, duration, callback) {
    el.style.opacity = 1;
    let last = +new Date();
    const tick = function() {
      el.style.opacity = +el.style.opacity - (new Date() - last) / duration;
      last = +new Date();

      if (+el.style.opacity > 0) {
        requestAnimationFrame(tick);
      } else {
        el.style.display = 'none';
        if (callback) callback();
      }
    };
    tick();
  }

  function block(target, options = {}) {
    const opts = { ...defaults, ...options };
    const overlay = createEl('div', opts.overlayCSS);
    const msgBox = createEl('div', opts.css, opts.message);
    msgBox.classList.add(opts.blockMsgClass);

    if (opts.showOverlay && target === document.body) {
      document.body.appendChild(overlay);
    }
    target.appendChild(msgBox);

    blockMap.set(target, { overlay, msgBox });

    if (opts.fadeIn) {
      if (opts.showOverlay && target === document.body) fadeIn(overlay, opts.fadeIn);
      fadeIn(msgBox, opts.fadeIn, () => opts.onBlock && opts.onBlock(target, opts));
    } else {
      if (opts.showOverlay && target === document.body) overlay.style.display = 'block';
      msgBox.style.display = 'block';
      opts.onBlock && opts.onBlock(target, opts);
    }

    if (opts.timeout) {
      setTimeout(() => unblock(target, opts), opts.timeout);
    }
  }

  function unblock(target, options = {}) {
    const opts = { ...defaults, ...options };
    const data = blockMap.get(target);
    if (!data) return;

    const { overlay, msgBox } = data;

    function cleanup() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (msgBox && msgBox.parentNode) msgBox.parentNode.removeChild(msgBox);
      blockMap.delete(target);
      opts.onUnblock && opts.onUnblock(target, opts);
    }

    if (opts.fadeOut) {
      if (overlay && overlay.parentNode) fadeOut(overlay, opts.fadeOut);
      if (msgBox && msgBox.parentNode) fadeOut(msgBox, opts.fadeOut, cleanup);
    } else {
      cleanup();
    }
  }

  function growl(title, message, timeout = 3000, onClose) {
    const growlBox = createEl('div', {
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#000',
      color: '#fff',
      padding: '10px',
      borderRadius: '10px',
      opacity: 0.6,
      zIndex: 2000,
      maxWidth: '300px',
      cursor: 'default'
    });

    if (title) growlBox.innerHTML += `<h1 style="margin:0 0 5px;font-size:16px">${title}</h1>`;
    if (message) growlBox.innerHTML += `<p style="margin:0;font-size:14px">${message}</p>`;

    document.body.appendChild(growlBox);

    fadeIn(growlBox, 300);

    growlBox.addEventListener('mouseover', () => {
      growlBox.style.opacity = 1;
    });
    growlBox.addEventListener('mouseout', () => {
      growlBox.style.opacity = 0.6;
    });

    setTimeout(() => {
      fadeOut(growlBox, 500, () => {
        if (growlBox.parentNode) growlBox.parentNode.removeChild(growlBox);
        if (onClose) onClose();
      });
    }, timeout);
  }

  global.BlockUI = { block, unblock, growl };
})(typeof window !== 'undefined' ? window : this);
