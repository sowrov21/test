import streamlit as st
from auth.session_check import auto_login_from_cookie
from auth.session_state import init_session_state, check_session_expiry
from components.sidebar import render_sidebar
from themes import get_theme_config
from utils import cookies_manager, local_storage_manager as lsm
import time;
from streamlit_autorefresh import st_autorefresh

 # cookies_manager.initialize_cookie_session()
 # Safe auto-refresh
# PAGE_KEY = "dashboard_page_loaded"
# if PAGE_KEY not in st.session_state:
#     if "data_management_page_loaded" in st.session_state:
#         del st.session_state["data_management_page_loaded"]
#     if "label_management_page_loaded" in st.session_state:
#         del st.session_state["label_management_page_loaded"]
#     if "operation_management_page_loaded" in st.session_state:
#         del st.session_state["operation_management_page_loaded"]
#     if "upload_management_page_loaded" in st.session_state:
#         del st.session_state["upload_management_page_loaded"]
#     st.session_state[PAGE_KEY] = True
#     st_autorefresh(interval=100, limit=1, key=f"{PAGE_KEY}_refresh")

# st.empty() 
# time.sleep(0.2)
page_placeholder = st.empty()
page_placeholder.empty()
with page_placeholder.container():
    def render_dashboard():
        st.set_page_config(
        page_title="Dashboard",
        page_icon="📊",
        layout="wide",
        initial_sidebar_state="expanded"
    )
        #"""Render the dashboard page"""
        init_session_state()
        # Render sidebar
        render_sidebar()
        if st.session_state.get("logout_me", False) == True:
            lsm.deleteAllItems()
            time.sleep(1)
            st.session_state.logout_me = False             

        st.header("Dashboard | Xpert Vision")
        # cookies_manager.init()
        # if cookies_manager._cookies is None:
        #     cookies_manager.init()

        if check_session_expiry():
            st.stop()
        if not st.session_state.authenticated:
            auto_login_from_cookie(page_name="dashboard")
        
        #st.write(cookies_manager.getAllCookies())
        # Apply theme
        theme_config = get_theme_config(st.session_state.theme)
        
        
        
        # Main content
        st.title(f"📊 Welcome, {st.session_state.username}!")
        st.markdown("This is your dashboard. Here you can see an overview of your clients and activities.")
        
        # Dashboard metrics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Clients", "125", "12%")
        with col2:
            st.metric("Active Projects", "24", "-3%")
        with col3:
            st.metric("Upcoming Meetings", "5", "1")
        
        # Recent activity
        st.subheader("Recent Activity")
        st.dataframe(
            [
                {"Date": "2023-11-01", "Activity": "Client meeting", "Client": "Acme Corp"},
                {"Date": "2023-10-30", "Activity": "Proposal sent", "Client": "Globex"},
                {"Date": "2023-10-28", "Activity": "Contract signed", "Client": "Initech"},
            ],
            use_container_width=True,
            hide_index=True
        )

    if __name__ == "__main__":
        render_dashboard()