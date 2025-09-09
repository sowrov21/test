import streamlit as st,streamlit_local_storage
from auth.session_state import update_last_activity
from themes import get_theme_config
from utils import cookies_manager,local_storage_manager as lsm
import time


def render_sidebar():
    """Render the application sidebar"""
    update_last_activity()
    with st.sidebar:
        st.title("Navigation")
        
        if st.session_state.authenticated:
            # Dashboard
            st.page_link("pages/dashboard.py", label="Dashboard", icon="📊")
            if st.session_state.user_role == "sa" or st.session_state.user_role == "xpert" or st.session_state.user_role == "client" :
                # Data Management
                st.page_link("pages/data_management.py", label="Data Management", icon="⚙️")
                # Upload Management
                st.page_link("pages/upload_management.py", label="Upload Management", icon="📤")
            # Operatio Management
            if st.session_state.user_role == "sa" or st.session_state.user_role == "xpert" or st.session_state.user_role == "client" or st.session_state.user_role == "label_mgr" :
                st.page_link("pages/operation_management.py", label="Operation Management", icon="🛠️")
            else:
                st.page_link("pages/operation_management.py", label="My Tasks", icon="📝")
            # Label Management
            st.page_link("pages/label_management.py", label="Image Labelling", icon="🖼️")
            st.page_link("pages/about.py", label="About Us", icon="ℹ️")
            st.page_link("pages/contact.py", label="Contact Us", icon="📞")
            # Client Management
            #st.page_link("pages/client_management.py", label="Client Management", icon="👥")
            
            # User Management (only for admins)
            #if st.session_state.user_role == "admin":
            # if st.session_state.user_role == "sa" or st.session_state.user_role == "xpert" or st.session_state.user_role == "client" :
            #     st.page_link("pages/user_management.py", label="User Management", icon="👤")
            
            # Theme selector
            theme = st.selectbox(
                "Theme",
                ["light", "dark", "corporate"],
                index=["light", "dark", "corporate"].index(st.session_state.theme)
            )
            
            if theme != st.session_state.theme:
                st.session_state.theme = theme
                st.rerun()
            
            # Logout button
            if st.button("Logout", width='stretch'):
                st.session_state.authenticated = False
                st.session_state.username = None
                st.session_state.user_role = None
                st.success("Logged out successfully!")
                #cookies_manager.remove_all_cookies()
                st.session_state.logout_me = True
                del st.session_state["_local_storage_cache"]
                #lsm.eraseAllItems()
                #time.sleep(1)
                lsm.deleteAllItems()
                time.sleep(1)
                st.rerun()
        
        else:
            #st.page_link("pages/login.py", label="Login", icon="🔒")
            st.page_link("main.py", label="Login", icon="🔒")
        
        # Footer
        st.sidebar.divider()
        st.sidebar.markdown(
            f"<div style='text-align: center; color: {get_theme_config(st.session_state.theme)['textColor']}'>"
            "© 2025 Xpert Predict"
            "</div>",
            unsafe_allow_html=True
        )