
import jwt
import time
import streamlit as st
from typing import Optional
from auth.session_state import update_last_activity
from utils import local_storage_manager #cookies_manager
import json

def is_jwt_expired(token: str) -> Optional[bool]:
    """
    Returns:
        bool: True if expired, False if not expired.
        None: If 'exp' claim is missing or token is malformed.
    """
    try:
        # Decode token without verifying signature
        decoded = jwt.decode(token, options={"verify_signature": False})
        exp = decoded.get("exp")
        
        if exp is None:
            print("No 'exp' claim found in token.")
            return None
        
        # Compare with current time
        current_time = int(time.time())
        return current_time > exp

    except jwt.DecodeError:
        print("Invalid JWT format.")
        return None

def show_error_prompt(page_name: str, message: str):
    """Helper to show login message."""
    st.markdown(f"""
    <div style="background-color:#fff3cd; padding:10px; border-left:6px solid #ffeeba;">
        {message} <a href="/" target="_self" style="font-weight:bold; color:#856404;">Log in</a>.
    </div>
    """, unsafe_allow_html=True)
    st.stop()

def auto_login_from_cookie(page_name: str = None):
    #jwt_cookie = cookies_manager.getCookie("jwt")
    jwt_cookie = local_storage_manager.getItem("ls_jwt")

    if not jwt_cookie:
        show_error_prompt(page_name, "Not authenticated.")
        return
    # if st.session_state.get("logout_me", False):
    #     return
        #show_error_prompt(page_name, "Not authenticated.")
        #st.stop()
    try:
        if is_jwt_expired(jwt_cookie):
            #cookies_manager.deleteCookie("jwt")
            #local_storage_manager.deleteItem('jwt')
            local_storage_manager.deleteAllItems()
            time.sleep(1)
            show_error_prompt(page_name, "Session expired. Please log in.")
            return

        # Valid JWT: set session state
        st.session_state.authenticated = True
        st.session_state.api_token = jwt_cookie

        # st.session_state.username = cookies_manager.getCookie("un")
        # st.session_state.user_id = st.session_state.username
        # st.session_state.rf_token = cookies_manager.getCookie("rf_t")
        # st.session_state.user_role = cookies_manager.getCookie("ur")

        # cu_cookie = cookies_manager.getCookie("cu")
        # try:
        #     cu_data = json.loads(cu_cookie) if isinstance(cu_cookie, str) else cu_cookie
        #     st.session_state.cu = cu_data
        # except Exception:
        #     cookies_manager.deleteCookie("jwt")
        #     st.warning("Corrupted session data. Please log in again.")
        #     st.stop()
        st.session_state.username = local_storage_manager.getItem("ls_un")
        st.session_state.user_id = st.session_state.username
        st.session_state.rf_token = local_storage_manager.getItem("ls_rf_t")
        st.session_state.user_role = local_storage_manager.getItem("ls_ur")
        st.session_state.eml = local_storage_manager.getItem("ls_eml")
        st.session_state.fn = local_storage_manager.getItem("ls_fn")
        st.session_state.mob = local_storage_manager.getItem("ls_mob")
        st.session_state.ut = int(local_storage_manager.getItem("ls_ut"))
        # cu = local_storage_manager.getItem("cu")
        # try:
        #     cu_data = json.loads(cu) if isinstance(cu, str) else cu
        #     st.session_state.cu = cu_data
        # except Exception:
        #     #cookies_manager.deleteCookie("jwt")
        #     local_storage_manager.deleteItem('jwt')
        #     st.warning("Corrupted session data. Please log in again.")
        #     st.stop()
        update_last_activity()
        st.rerun()
    except Exception as e:
        #cookies_manager.deleteCookie("jwt")
        local_storage_manager.deleteItem('jwt')
        st.warning("An error occurred while validating your session.")
        st.error(f"Debug info: {str(e)}")  # Consider hiding this in production
        st.stop()