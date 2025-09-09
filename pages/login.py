import streamlit as st
from auth.authentication import verify_credentials
from auth.session_check import auto_login_from_cookie
from auth.session_state import init_session_state, update_last_activity
from themes import get_theme_config
from utils import cookies_manager
from utils.api_client import APIClient


# st.set_page_config(
#     page_title="Login | Xpert Vision",
#     page_icon="🔒",
#     layout="centered"
# )

st.header("Login | Xpert Vision")

def render_login_page():
    
    """Render the login page"""
    init_session_state()
    # cookies_manager.init()
    update_last_activity()
    api_client = APIClient()


    # Apply theme
    theme_config = get_theme_config(st.session_state.theme)
    
    # Hide sidebar on login page
    st.markdown("""
        <style>
            section[data-testid="stSidebar"] {
                display: none !important;
            }
        </style>
    """, unsafe_allow_html=True)
    
    # Login form
    with st.container(border=True):
        st.title("🔒 Login")
        
        with st.form("login_form"):
            username = st.text_input("Username", placeholder="Enter your username")
            password = st.text_input("Password", placeholder="Enter your password", type="password")
            remember_me = st.checkbox("Remember me")
            
            if st.form_submit_button("Login", use_container_width=True):
                if not username or not password:
                    st.error("Please enter both username and password")
                else:
                    with st.spinner("Logging in..."):
                        if api_client.authenticate(username, password):
                            st.session_state.authenticated = True
                            st.session_state.username = username
                            st.session_state.user_id = username  #user["user_id"]
                            # You might want to get user role from API response
                            #st.session_state.user_role = "user"  # Default, update from API
                            st.session_state.logout_me = False
                            st.success("Login successful!")
                            st.rerun()
                        else:
                            st.error("Invalid username or password")
                    
                        # user = verify_credentials(username, password)
                        # if user:
                        #     st.session_state.authenticated = True
                        #     st.session_state.username = user["username"]
                        #     st.session_state.user_role = user["role"]
                        #     st.session_state.user_id = user["user_id"]
                        #     st.success("Login successful!")
                        #     st.rerun()
                        # else:
                        #     st.error("Invalid username or password")

if __name__ == "__main__":
    render_login_page()