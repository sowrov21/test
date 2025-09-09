import streamlit as st
from auth.authentication import create_user
from auth.session_state import init_session_state, check_session_expiry
from components.sidebar import render_sidebar
from themes import get_theme_config
from utils.db import execute_query


st.header("User Management | Xpert Vision")

def render_user_management():
    """Render the user management page"""
    init_session_state()
    if check_session_expiry():
        st.stop()
    
    if not st.session_state.authenticated or st.session_state.user_role != "sa":
        st.warning("You don't have permission to access this page.")
        st.stop()
    
    # Apply theme
    theme_config = get_theme_config(st.session_state.theme)
    
    # Render sidebar
    render_sidebar()
    
    # Main content
    # st.title("👤 User Management")
    
    # Tab layout
    tab1, tab2 = st.tabs(["User List", "Create User"])
    
    with tab1:
        st.subheader("All Users")
        users = execute_query("SELECT user_id, username, role, email, created_at FROM users ORDER BY created_at DESC")
        
        if users:
            st.dataframe(
                    [
                        {
                            "ID": user[0],
                            "Username": user[1],
                            "Role": user[2],
                            "Email": user[3] or "-",
                            "Created At": user[4]
                        }
                        for user in users
                    ],
                    width='stretch',
                    hide_index=True
                )
        else:
            st.info("No users found in the database.")
    
    with tab2:
        st.subheader("Create New User")
        with st.form("create_user_form", clear_on_submit=True):
            col1, col2 = st.columns(2)
            with col1:
                username = st.text_input("Username*", placeholder="Enter username")
                password = st.text_input("Password*", placeholder="Enter password", type="password")
                confirm_password = st.text_input("Confirm Password*", placeholder="Confirm password", type="password")
            with col2:
                role = st.selectbox("Role*", ["user", "admin", "manager"])
                email = st.text_input("Email", placeholder="Enter email")
            
            if st.form_submit_button("Create User",width='stretch'):
                if not username or not password or not confirm_password or not role:
                    st.error("Please fill all required fields (marked with *)")
                elif password != confirm_password:
                    st.error("Passwords do not match")
                else:
                    success, message = create_user(username, password, role, email)
                    if success:
                        st.success(message)
                    else:
                        st.error(message)

if __name__ == "__main__":
    render_user_management()