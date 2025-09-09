# utils/local_storage_manager.py

import streamlit as st
from streamlit_local_storage import LocalStorage
from utils.crypto_util import encrypt_data, decrypt_data
import time

_STORAGE_KEY = "localSt"

def get_controller():
    """Ensure only one LocalStorage instance per session."""
    if "_local_storage_controller" not in st.session_state:
        st.session_state["_local_storage_controller"] = LocalStorage(key=_STORAGE_KEY)
    return st.session_state["_local_storage_controller"]

def initialize_local_storage_session():
    """Cache raw (encrypted) values from browser local storage."""
    if "_local_storage_cache" not in st.session_state:
        #controller = LocalStorage(key=_STORAGE_KEY)
        controller = get_controller()
        encrypted_items = controller.getAll()
        # Define the expected keys
        expected_keys = {"ls_un", "ls_jwt","ls_eml","ls_fn","ls_mob","ls_ut", "ls_rf_t", "ls_ur"}
        if encrypted_items:
            filtered_cookies = {k: v for k, v in encrypted_items.items() if k in expected_keys}
            st.session_state["_local_storage_cache"] = filtered_cookies or {}
            st.session_state["_local_storage_ready"] = bool(encrypted_items)

def getItem(key: str):
    initialize_local_storage_session()
    encrypted_value = st.session_state["_local_storage_cache"].get(key)
    if encrypted_value is None:
        return None
    return decrypt_data(encrypted_value)

def getAllItems():
    initialize_local_storage_session()
    encrypted_data = st.session_state.get("_local_storage_cache", {})
    return {
        k: decrypt_data(v) for k, v in encrypted_data.items()
        if v is not None
    }

def setItem(key: str, value: any):
    encrypted_value = encrypt_data(value)
    # controller = LocalStorage(key=_STORAGE_KEY)
    controller = get_controller()
    controller.setItem(itemKey=key, itemValue=encrypted_value, key=key)
    # Optional: Update local cache
    st.session_state["_local_storage_cache"][key] = encrypted_value

def deleteItem(key: str):
    # controller = LocalStorage(key=_STORAGE_KEY)
    controller = get_controller()
    controller.deleteItem(itemKey=key)
    st.session_state["_local_storage_cache"].pop(key, None)

def eraseItem(key: str):
    # controller = LocalStorage(key=_STORAGE_KEY)
    controller = get_controller()
    controller.eraseItem(itemKey=key)
    st.session_state["_local_storage_cache"].pop(key, None)

def eraseAllItems():
    # controller = LocalStorage(key=_STORAGE_KEY)
    controller = get_controller()
    encrypted_items = controller.getAll()
    
    if encrypted_items:
        for key in encrypted_items:
            controller.eraseItem(itemKey=key,key=key)
    
    st.session_state["_local_storage_cache"] = {}

def deleteAllItems():
    # controller = LocalStorage(key=_STORAGE_KEY)
    controller = get_controller()
    controller.deleteAll()
    st.session_state["_local_storage_cache"] = {}


def refreshItems():
    # controller = LocalStorage(key=_STORAGE_KEY)
    controller = get_controller()
    new_data = controller.getAll()
    st.session_state["_local_storage_cache"] = new_data or {}
    st.session_state["_local_storage_ready"] = bool(new_data)

def is_ready() -> bool:
    return st.session_state.get("_local_storage_ready", False)
