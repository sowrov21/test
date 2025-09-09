import streamlit as st
from auth.session_check import auto_login_from_cookie
from auth.session_state import init_session_state, check_session_expiry
from components.sidebar import render_sidebar
from themes import get_theme_config
from utils import local_storage_manager as lsm #cookies_manager
import json
#from utils.api_client import APIClient
from components.data_management_component import data_management_component
import time
from streamlit_autorefresh import st_autorefresh

 # cookies_manager.initialize_cookie_session()

  # Safe auto-refresh logic
# PAGE_KEY = "data_management_page_loaded"
# if PAGE_KEY not in st.session_state:
#     if "dashboard_page_loaded" in st.session_state:
#         del st.session_state["dashboard_page_loaded"]
#     if "label_management_page_loaded" in st.session_state:
#         del st.session_state["label_management_page_loaded"]
#     if "operation_management_page_loaded" in st.session_state:
#         del st.session_state["operation_management_page_loaded"]
#     if "upload_management_page_loaded" in st.session_state:
#         del st.session_state["upload_management_page_loaded"]

#     st.session_state[PAGE_KEY] = True
#     st_autorefresh(interval=100, limit=1, key=f"{PAGE_KEY}_refresh")

# st.empty() #
# time.sleep(0.2)

page_placeholder = st.empty()
page_placeholder.empty()
with page_placeholder.container():

    st.set_page_config(
        page_title="Data Management",
        page_icon="⚙️",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    def render_componet(): 
        # Inject custom CSS here
        st.markdown("""
            <style>
                .stMainBlockContainer {
                    padding: 1rem !important;
                }
            /* Example: make iframe full width */
            iframe[title="components.data_management_component.data_management_component"] {
                height: 100vh !important;
                border: none;
            }
            </style>
        """, unsafe_allow_html=True)

        token = st.session_state.get('api_token') or ""
        rf_token = st.session_state.get('rf_token') or ""
        un = st.session_state.get('username') or ""
        eml = st.session_state.get('eml') or ""
        fn = st.session_state.get('fn') or ""
        mob = st.session_state.get('mob')
        ut = st.session_state.get('ut')
        #cu = st.session_state.get('cu') or {}
        if token:
            auth_data = {
                "token": token,
                #"cu": json.dumps(cu),
                "rf_token":rf_token,
                "un":un,
                "eml":eml,
                "fn":fn,
                "mob":mob,
                "ut":ut
            }
            response = data_management_component(data=auth_data, key="data-mgnt-compt")
            time.sleep(1)

            #if response:
                #st.success("Component response:")
                #st.json(response)
        else:
            st.warning("Token not found.")

    def render_data_management():
        
        init_session_state()
        #api_client = APIClient()
        # cookies_manager.init()
        # time.sleep(0.1)

        if not st.session_state.authenticated:
            # st.warning("Please log in to access this page.")
            # st.stop()
            auto_login_from_cookie(page_name="data_management")

        if check_session_expiry():
            st.stop()


        theme_config = get_theme_config(st.session_state.theme)
        render_sidebar()
        render_componet()


    if __name__ == "__main__":
        render_data_management()

