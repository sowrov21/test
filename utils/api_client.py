import requests
import streamlit as st
from config import API_BASE_URL, SESSION_EXPIRE_MINUTES
from utils import cookies_manager  # Add this to your config.py
from utils import local_storage_manager
import json

class APIClient:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {st.session_state.get('api_token')}"
        }

    def _handle_response(self, response):
        try:
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as err:
            st.error(f"API Error: {err}")
            return None
        except ValueError:
            st.error("Invalid JSON response")
            return None

    def post_data(self, endpoint, data):
        """Generic POST method for sending JSON data"""
        try:
            response = requests.post(
                f"{self.base_url}/{endpoint}",
                json=data,
                headers=self.headers
            )
            return self._handle_response(response)
        except requests.exceptions.RequestException as e:
            st.error(f"Connection error: {e}")
            return None

    # Specific API methods
    #====:: Tasks ::=======
    def get_tasks(self, filter_data):
        return self.post_data(f"tasks/getTasks", filter_data)    
    #====:: Clients ::=======
    def create_client(self, client_data):
        return self.post_data("clients/create", client_data)
    def get_clients(self, filter_data):
        return self.post_data("clients/getClients", filter_data)    
    def update_client(self, client_id, form_data):
        return self.post_data(f"clients/updateClient/{client_id}", form_data)
    #====:: Users ::=======
    def create_user(self, user_data):
        return self.post_data("users", user_data)

    def authenticate(self, username, password):
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        if response.status_code == 200:
            data = response.json()
            #st.session_state.api_token = data.get("access_token")
            st.session_state.api_token = data.get('data', {}).get('token', {}).get('access_token')#data.get("access_token")
            #new add sowrov on 02 July 2025
            #st.session_state.cu = data.get('data',{})
            response_data = data.get('data',{})
            # cu_obj = {
            #     "username": response_data.get("username"),
            #     "email": response_data.get("email"),
            #     "mobile": response_data.get("mobile"),
            #     "full_name": response_data.get("full_name"),
            #     "user_type": response_data.get("user_type"),
            #     "client_id": response_data.get("client_id"),
            # }
            #st.session_state.cu =  cu_obj 
            st.session_state.eml = response_data.get("email","")
            st.session_state.mob = response_data.get("mobile",0)
            st.session_state.fn = response_data.get("full_name","")
            st.session_state.ut = response_data.get("user_type",-1)
            st.session_state.rf_token = data.get('data', {}).get('token', {}).get('refresh_token')

            user_role = {
                0:"sa",#superadmin,
                1:"xpert",#xpertuser
                2:"client",
                3:"labeller",
                4:"label_mgr"#label_manager
            }
            #jwt_cookie = cookies_manager.getCookie("jwt")
            jwt_cookie = local_storage_manager.getItem("ls_jwt")
            st.session_state.user_role = user_role[response_data.get("user_type")]
            if jwt_cookie is None or jwt_cookie == {}:
                # from datetime import datetime, timedelta
                # expires_at = datetime.now() + timedelta(minutes=SESSION_EXPIRE_MINUTES)
                # cookies_manager.setCookie(key="un",value=username,expires=expires_at)
                # cookies_manager.setCookie(key="jwt",value=st.session_state.api_token,expires=expires_at)
                # cookies_manager.setCookie(key="cu", value= json.dumps(st.session_state.cu),expires=expires_at)
                # cookies_manager.setCookie(key="rf_t",value=st.session_state.rf_token,expires=expires_at)
                # cookies_manager.setCookie(key="ur",value=st.session_state.user_role,expires=expires_at)
                
                local_storage_manager.setItem(key="ls_un",value=username)
                local_storage_manager.setItem(key="ls_jwt",value=st.session_state.api_token)
                #local_storage_manager.setItem(key="cu", value= json.dumps(cu_obj))
                local_storage_manager.setItem(key="ls_eml",value=st.session_state.eml)
                local_storage_manager.setItem(key="ls_fn",value=st.session_state.fn)
                local_storage_manager.setItem(key="ls_mob",value=st.session_state.mob)
                local_storage_manager.setItem(key="ls_ut",value=str(st.session_state.ut))
                local_storage_manager.setItem(key="ls_rf_t",value=st.session_state.rf_token)
                local_storage_manager.setItem(key="ls_ur",value=st.session_state.user_role)
                #local_storage_manager.refreshItems()
            return True
        st.error("Authentication failed")
        return False
