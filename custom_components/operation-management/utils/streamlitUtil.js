// streamlitUtil.js
import { Streamlit } from "streamlit-component-lib";

const StreamlitUtil = (function () {
  let props = {};

  const listeners = {
    onData: null,   // function(args) — called with Streamlit args
    onReady: null   // optional: runs after init
  };

  // Init Streamlit component communication
  function init({ onData, onReady } = {}) {
    if (typeof onData === "function") listeners.onData = onData;
    if (typeof onReady === "function") listeners.onReady = onReady;

    // Set ready + frame height for Streamlit
    Streamlit.setComponentReady();
    Streamlit.setFrameHeight();

    // Listen to render events (i.e., receiving data from Python)
    Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, (event) => {
      const args = event.detail?.args || {};
      props = args;

      if (listeners.onData) listeners.onData(args);

      Streamlit.setFrameHeight();
    });

    if (listeners.onReady) listeners.onReady();
  }

  // Send data back to Streamlit Python backend
  function send(data) {
    Streamlit.setComponentValue(data);
  }

  // Get last received props from Streamlit
  function getProps() {
    return props;
  }

  return {
    init,
    send,
    getProps,
  };
})();

export default StreamlitUtil;
