# utils/cookies_manager.py

from streamlit_cookies_controller import CookieController
import streamlit as st

def initialize_cookie_session():
    # Always create the component so the browser can respond
    controller = CookieController(key="auth_cookies")
    cookies = controller.getAll()

  # Define the expected keys we care about
    expected_keys = {"un", "jwt", "cu", "rf_t", "ur"}

    # On first load, getAll might return nothing
    if cookies:
        # Filter cookies to only those we're expecting
        filtered_cookies = {k: v for k, v in cookies.items() if k in expected_keys}
        st.session_state["_cookie_cache"] = filtered_cookies
        st.session_state["_cookie_ready"] = True

def getCookie(key: str):
    initialize_cookie_session()
    return st.session_state.get("_cookie_cache", {}).get(key)

def getAllCookies():
    initialize_cookie_session()
    return st.session_state.get("_cookie_cache", {})

def setCookie(name, value, **kwargs):
    controller = CookieController(key="auth_cookies")
    controller.set(name=name, value=value, **kwargs)

def deleteCookie(name):
    controller = CookieController(key="auth_cookies")
    controller.remove(name)

def remove_all_cookies():
    for key in list(st.session_state.get("_cookie_cache", {}).keys()):
        deleteCookie(key)
