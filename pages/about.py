import streamlit as st
from components.sidebar import render_sidebar

page_placeholder = st.empty()
page_placeholder.empty()
with page_placeholder.container():
    def render_about():
        st.set_page_config(
        page_title="About Us",
        page_icon="📊",
        layout="wide",
        initial_sidebar_state="expanded"
    )
     # Render sidebar
    render_sidebar()    
    st.title(f"📊 Your are in About us!")
        

    if __name__ == "__main__":
        render_about()