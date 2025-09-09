const UploadProgressUI = (() => {
  let container = null;
  let bar = null;
  let messageBox = null;
  let style = null;

  function createStyles() {
    if (style) return;
    style = document.createElement('style');
    style.textContent = `
      .upload-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #323232;
        color: #fff;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 20px rgba(0,0,0,0.2);
        font-size: 14px;
        min-width: 220px;
        max-width: 300px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 9999;
      }

      .upload-toast.show {
        opacity: 1;
      }

      .upload-toast .message {
        margin-bottom: 8px;
      }

      .upload-toast .bar {
        height: 4px;
        width: 100%;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
      }

      .upload-toast .bar-fill {
        height: 100%;
        background: #4caf50;
        width: 0%;
        transition: width 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  function createContainer() {
    createStyles();

    container = document.createElement('div');
    container.className = 'upload-toast';

    messageBox = document.createElement('div');
    messageBox.className = 'message';
    container.appendChild(messageBox);

    bar = document.createElement('div');
    bar.className = 'bar';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    bar.appendChild(fill);

    container.appendChild(bar);

    document.body.appendChild(container);
  }

  function show(message) {
    if (!container) createContainer();

    messageBox.textContent = message;
    container.classList.add('show');
  }

  function hide(delay = 1000) {
    if (!container) return;
    setTimeout(() => {
      container.classList.remove('show');
    }, delay);
  }

  function update(current, total, type = 'data') {
    if (!container) createContainer();

    const label = type.charAt(0).toUpperCase() + type.slice(1);
    show(`Loading ${label} ${current} of ${total}...`);

    const percent = Math.round((current / total) * 100);
    const fill = container.querySelector('.bar-fill');
    fill.style.width = `${percent}%`;
  }

  function destroy() {
    if (container) {
      container.remove();
      container = null;
    }
    if (style) {
      style.remove();
      style = null;
    }
  }

  return {
    show,
    hide,
    update,
    destroy,
  };
})();

export default UploadProgressUI;
