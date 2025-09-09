import { Streamlit } from 'streamlit-component-lib';

class StreamlitUtil {
  constructor() {
    this.props = {};
    this.listeners = {
      onData: null,
      onReady: null,
    };

    // Listen to updates from Python
    Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, (event) => {
      const args = (event.detail && event.detail.args) ? event.detail.args : {};
      this.props = args;

      if (typeof this.listeners.onData === 'function') {
        this.listeners.onData(args);
      }

      Streamlit.setFrameHeight();
    });
  }

  /**
   * Initialize communication with Streamlit
   * @param {Object} options
   * @param {Function} options.onData — called with args when Python renders
   * @param {Function} options.onReady — called immediately after init
   */
  init({ onData, onReady } = {}) {
    if (typeof onData === 'function') {
      this.listeners.onData = onData;
    }
    if (typeof onReady === 'function') {
      this.listeners.onReady = onReady;
    }

    Streamlit.setComponentReady();
    Streamlit.setFrameHeight();

    if (this.listeners.onReady) {
      this.listeners.onReady();
    }
  }

  /**
   * Send value/data back to Python
   * @param {*} data
   */
  send(data) {
    Streamlit.setComponentValue(data);
  }

  /**
   * Get most recent props received from Python
   */
  getProps() {
    return this.props;
  }
}

// Attach to window for global access (optional)
if (typeof window !== 'undefined') {
  window.StreamlitUtil = new StreamlitUtil();
}

export default new StreamlitUtil();
