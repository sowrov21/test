import streamlit as st
from datetime import datetime, timedelta
from config import SESSION_EXPIRE_MINUTES

def init_session_state():
    """Initialize session state variables"""
    if 'authenticated' not in st.session_state:
        st.session_state.authenticated = False
    if 'username' not in st.session_state:
        st.session_state.username = None
    if 'user_role' not in st.session_state:
        st.session_state.user_role = None
    if 'last_activity' not in st.session_state:
        st.session_state.last_activity = datetime.now()
    if 'theme' not in st.session_state:
        from config import DEFAULT_THEME
        st.session_state.theme = DEFAULT_THEME
    if 'bpi_token' not in st.session_state:
        st.session_state.bpi_token = None

def check_session_expiry():
    """Check if session has expired due to inactivity"""
    if st.session_state.authenticated:
        elapsed = datetime.now() - st.session_state.last_activity
        if elapsed > timedelta(minutes=SESSION_EXPIRE_MINUTES):
            st.session_state.authenticated = False
            st.warning("Session expired due to inactivity. Please log in again.")
            return True
    return False

def update_last_activity():
    """Update the last activity timestamp"""
    st.session_state.last_activity = datetime.now()