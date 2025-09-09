import streamlit as st
from auth.authentication import initialize_database
from auth.session_check import auto_login_from_cookie
from auth.session_state import init_session_state
from utils import cookies_manager,local_storage_manager
import time

with st.spinner("Loading data..."):
    local_storage_manager.initialize_local_storage_session()
    time.sleep(1)

st.set_page_config(
    page_title="Xpert Vision",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

def main():
    """Main application entry point"""
    # Initialize database and session state
    initialize_database()
    init_session_state()
    #cookies_manager.init()

    st.set_option('client.showSidebarNavigation', False)
    # Display the appropriate page based on authentication status
    if not st.session_state.authenticated:
        #jwt_cookie = cookies_manager.getCookie("jwt")
        jwt_cookie = local_storage_manager.getItem("ls_jwt")
        if jwt_cookie:
            auto_login_from_cookie(page_name="Dashboard")
            #return  # If auto-login succeeds, st.rerun() will be triggered
        else:
            from pages.login import render_login_page
            render_login_page()
    else:
        from pages.dashboard import render_dashboard
        render_dashboard()

if __name__ == "__main__":
    main()