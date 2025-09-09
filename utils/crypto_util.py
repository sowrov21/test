# utils/crypto_util.py
import streamlit as st
from cryptography.fernet import Fernet
from config import ST_COOKIE_KEY

# --- Load encryption key securely from environment variable ---
_ENCRYPTION_KEY_RAW = ST_COOKIE_KEY

if not _ENCRYPTION_KEY_RAW:
    st.error("ST_COOKIE_KEY environment variable not found. Please set it securely.")
    st.stop()

_cipher = Fernet(_ENCRYPTION_KEY_RAW.encode())

def encrypt_data(data: str) -> str:
    """Encrypts a string and returns base64-encoded encrypted string."""
    encrypted_bytes = _cipher.encrypt(data.encode())
    return encrypted_bytes.decode()

def decrypt_data(encrypted_data: str) -> str | None:
    """Decrypts encrypted base64-encoded string to plain text."""
    try:
        decrypted_bytes = _cipher.decrypt(encrypted_data.encode())
        return decrypted_bytes.decode()
    except Exception as e:
        st.warning(f"Decryption failed: {e}")
        return None
