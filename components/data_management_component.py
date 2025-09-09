import streamlit.components.v1 as components
import os
import componets_file_path_config as file_conf

#_COMPONENT_ROOT = os.path.join(os.path.dirname(__file__), "..", "custom_components", "data-management", "dist")
_component_func = components.declare_component(
    name= "data_management_component",
    #url="http://localhost:5173"   
    path=file_conf.data_management_component_path
)

def data_management_component(data=None, key=None):
    return _component_func(data=data, key=key, default=0,height=800)
