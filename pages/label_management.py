import time
import streamlit as st
from st_aggrid import AgGrid, GridOptionsBuilder, JsCode, GridUpdateMode
import pandas as pd
from auth.session_check import auto_login_from_cookie
from auth.session_state import init_session_state, check_session_expiry
#from components import label_management_component
from components.label_management_component import label_management_component
from components.sidebar import render_sidebar
from themes import get_theme_config
from utils import local_storage_manager as lsm #cookies_manager
from utils.api_client import APIClient
import json
from streamlit_autorefresh import st_autorefresh

 # cookies_manager.initialize_cookie_session()
 # Safe auto-refresh logic
# PAGE_KEY = "label_management_page_loaded"
# if PAGE_KEY not in st.session_state:
#     if "dashboard_page_loaded" in st.session_state:
#         del st.session_state["dashboard_page_loaded"]
#     if "data_management_page_loaded" in st.session_state:
#         del st.session_state["data_management_page_loaded"]
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
        page_title="Label Management",
        page_icon="🖼️",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    if "showTaskList" not in st.session_state:
        st.session_state.showTaskList = True

    #st.header("Image Label Management")
    def render_component(taskId = None): 
        #hide the sidebar and header
        st.markdown(""" <style> [data-testid="stSidebar"][aria-expanded="true"] { display: none; } header[data-testid="stHeader"] { display: none; } [data-testid="stVerticalBlock"] { gap: 0 !important; }</style> """, unsafe_allow_html=True)
        # Inject custom CSS here
        st.markdown("""
            <style>
                .stMainBlockContainer {
                    padding: 1rem !important;
                }
            /* Example: make iframe full width */
            iframe[title="components.label_management_component.label_management_component_c"] {
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
                "ut":ut,
                "taskId":taskId
            }
            response = label_management_component(data=auth_data, key="data-mgnt-compt")
            time.sleep(1)

            if response:
                if response.get("message") == "go_to_tasks_list":
                    data = response.get("data", {})
                    st.session_state.showTaskList = True
                    st.rerun() 
                # elif response.get("message") == "Token_Refreshed":
                #     data = response.get("data", {})
                #     st.session_state.api_token = data.get("access_token", "")
                #     st.session_state.rf_token = data.get("refresh_token", "")
                #     st.session_state.cu = data.get("current_user", "")
                #st.success("Component response:")
                #st.json(response)
        else:
            st.warning("Token not found.")

    #check return if editing
    if not st.session_state.showTaskList:
        init_session_state()
        api_client = APIClient()
        if check_session_expiry():
            st.stop()

        # cookies_manager.init()
        # time.sleep(0.1)
        
        #if not st.session_state.authenticated:
            # st.warning("Please log in to access this page.")
            # st.stop()

        
        # Apply theme
        theme_config = get_theme_config(st.session_state.theme)
        
        # Render sidebar
        render_sidebar()
        render_component(st.session_state.get("selected_task_id"))
        st.stop()

    def render_label_management():
        """Render the labelling management page"""
        init_session_state()
        api_client = APIClient()

        if check_session_expiry():
            st.stop()
        
        if not st.session_state.authenticated:
            # st.warning("Please log in to access this page.")
            # st.stop()
            auto_login_from_cookie(page_name="label_management")
        
        # Apply theme
        theme_config = get_theme_config(st.session_state.theme)
        
        # Render sidebar
        render_sidebar()

        if st.session_state.showTaskList:

            st.subheader("All Tasks")
            with st.spinner("Loading tasks..."):
                    filter_data = {
                        "skip": 0,
                        "limit": 20,
                        "is_active": 1,
                        "contact_no": "" 
                    }
                    response = api_client.get_tasks(filter_data)
                    clients =[]
                    if response and response.get('status_code') == 200:
                        clients = response.get('data',[])
                    else:
                        st.error("Someting went wrong. Unable to get tasks data")           
                    if clients:

                        normalized_tasks = []
                        for c in clients:
                            normalized_tasks.append({
                                "ID": c.get("id", "-"),
                                "TaskType": c.get("task_type", "-"),
                                #"assigned_to": c.get("assigned_to", "-"),
                                "AssignedTo": c.get("assigned_to_name", "-"),
                                #"ClientId": c.get("client_id", "-"),
                                "Client": c.get("client_name", "-"),
                                "Start": c.get("start_task", "-"),
                                "End": c.get("end_task", "-"),
                                "Status": "Active" if c.get("is_active") == 1 else "Inactive"
                            })

                        df = pd.DataFrame(normalized_tasks)
                        # ──────────  JS cell renderer ──────────  
                        cell_renderer = JsCode("""
                        class ActionRenderer {
                        init(p) {
                            const { id } = p.data;

                            this.eGui = document.createElement('span');
                            this.eGui.innerHTML = `
                            <button data-act="edit"   data-row="${id}">🛠️</button>
                            <button data-act="delete" data-row="${id}" style="color:red">🗑️</button>`;

                            // attach one listener for both buttons
                            this.eGui.addEventListener('click', e => {
                            if (e.target.tagName !== 'BUTTON') return;   // ignore cell clicks
                            e.stopPropagation();                         // don’t trigger onCellClicked

                            p.api.dispatchEvent({
                                // ▸ event name you will subscribe to from Python
                                type:        'buttonClicked',

                                // ▸ AG-Grid-whitelisted fields ─ they survive the bridge
                                value:       e.target.dataset.act,      // 'edit' | 'delete'
                                data:        p.data,                    // whole row record
                                rowIndex:    p.rowIndex,
                                columnId:    'action',
                            });
                            });
                        }
                        getGui() { return this.eGui; }
                        }
                        """)

                        # ──────────  GridOptions ──────────
                        gb = GridOptionsBuilder.from_dataframe(df.assign(action=""))
                        # ➊  default columns: flex → share leftover space equally
                        gb.configure_default_column(
                            flex=1,                # fills available width :contentReference[oaicite:0]{index=0}
                            minWidth=90,
                            resizable=True
                        )

                        # ➋  override the Action column: hard-coded 30 px, exclude from “sizeToFit”
                        gb.configure_column(
                            "action",
                            header_name="action",
                            width=30,             
                            suppressSizeToFit=True, # don’t let ‘sizeToFit’ stretch/shrink it :contentReference[oaicite:2]{index=2}
                            filter=False,
                            sortable=False,
                            pinned="right",         # optional: keep buttons visible on scroll
                            cellRenderer=cell_renderer,
                        )
                        go = gb.build()
                        # ──────────  render & listen event ──────────  
                        grid_return = AgGrid(
                            df.assign(action=""),
                            gridOptions=go,
                            allow_unsafe_jscode=True,          # needed for custom JS
                            update_mode=GridUpdateMode.NO_UPDATE,
                            update_on=["buttonClicked"],       # <── subscribe to *custom* event
                            fit_columns_on_grid_load=True
                        )

                        ev = grid_return.event_data
                        #st.write("👀 raw event:", ev)           # dbg: inspect live payload

                        if ev and ev.get("type") == "buttonClicked":
                            action  = ev["value"]              # 'edit' | 'delete'
                            row     = ev["data"]               # full row object

                            if action == "edit":
                                #render_component(row['ID'])
                                #st.success(f"🛠️ Selected to Edit → {row}")
                                st.session_state.selected_task_id = row['ID']
                                st.session_state.showTaskList = False
                                st.rerun()
                            else:
                                st.error  (f"🗑️ Selectted to Delete → {row}")

                    # call DELETE logic here
                    else:
                        st.info("No tasks found in the database.")


    if __name__ == "__main__":
        render_label_management()