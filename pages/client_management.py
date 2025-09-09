import streamlit as st
from st_aggrid import AgGrid, GridOptionsBuilder, JsCode, GridUpdateMode
import pandas as pd
from auth.session_state import init_session_state, check_session_expiry
from components.sidebar import render_sidebar
from themes import get_theme_config
from utils.db import execute_query, get_db_connection
from utils.api_client import APIClient

st.header("Client Management | Xpert Vision")
def render_client_form(form_title="Add New Client",form_type="add",on_submit_clear=True,data ={}):
        api_client = APIClient()
        st.subheader(form_title)

        # Handle values if data is not provided
        #data = data or {}
        field_name = data.get('Name', '') if data else ''
        field_short_name = data.get('ShortName', '') if data else ''
        field_contact_no = data.get('ContactNo', '') if data else ''
        field_address = data.get('Address', '') if data else ''
        field_status = "active" if not data else (
            "inactive" if data.get('Status') == "Inactive" else
            "active" if data.get('Status') == "Active" else
            "prospect"
        )
        status_map = {
        "inactive": 0,
        "active": 1,
        "prospect": 2
        }
        with st.form(f"{form_type}_client_form", clear_on_submit=on_submit_clear):
            col1, col2 = st.columns(2)
            with col1:
                name = st.text_input("Name*",value= field_name, placeholder="Client name")
                #status = st.selectbox("Status*", ["active", "inactive", "prospect"])
                status_label = st.selectbox("Status*", list(status_map.keys()), index=list(status_map.keys()).index(field_status))
            with col2:
                short_name = st.text_input("Short Name",value=field_short_name, placeholder="Short name")
                contact_no = st.text_input("Contact No.*",value=field_contact_no, placeholder="01972002233")
            address = st.text_area("Address:",value=field_address, height=150, placeholder="1/A,Mirpur, Dhaka 2016")

            if st.form_submit_button(f"{form_type.capitalize()} Client", use_container_width=True):
                if not name or not contact_no:
                    st.error("Please fill all required fields (marked with *)")
                else:
                    try:
                        #Save by API
                        is_active = status_map[status_label]
                        id = data.get('ID','')
                        form_data = {
                        "name": name,
                        "contact_no": contact_no,
                        "address": address,
                        "is_active": is_active
                        }

                        message = "Added"
                        
                        if form_type == "add":
                            api_client.create_client(form_data)
                        else: 
                            res = api_client.update_client(client_id=id,form_data=form_data)
                            message = "Updated"
                        st.success(f"Client {message} successfully!")

                    except Exception as e:
                        st.error(f"Error adding client: {e}")
                    # finally:
                    #     if conn:
                    #         conn.close()

def render_client_management():
    """Render the client management page"""
    init_session_state()
    api_client = APIClient()
    if check_session_expiry():
        st.stop()
    
    if not st.session_state.authenticated:
        st.warning("Please log in to access this page.")
        st.stop()
    
    # Apply theme
    theme_config = get_theme_config(st.session_state.theme)
    
    # Render sidebar
    render_sidebar()
    
    st.session_state.show_modal = False
    # Main content
    # st.title("👥 Client Management")
    
    # Tab layout
    tab1, tab2 = st.tabs(["Client List", "Add Client"])
    
    with tab1:
        st.subheader("All Clients")
        with st.spinner("Loading clients..."):
            filter_data = {
                "skip": 0,
                "limit": 20,
                "is_active": 1,
                "contact_no": "" 
            }
            response = api_client.get_clients(filter_data)
            clients =[]
            if response and response.get('status_code') == 200:
                clients = response.get('data',[])
            else:
                st.error("Someting went wrong. Unable to get client data")
            # clients = execute_query("""
            #     SELECT c.client_id, c.name, c.email, c.phone, c.company, c.status, u.username, c.created_at 
            #     FROM clients c
            #     LEFT JOIN users u ON c.created_by = u.user_id
            #     ORDER BY c.created_at DESC
            # """)
            
            if clients:
                #old dataframe way
                # st.dataframe(
                #     [
                #         {
                #             "ID": client[0],
                #             "Name": client[1],
                #             "Email": client[2] or "-",
                #             "Phone": client[3] or "-",
                #             "Company": client[4] or "-",
                #             "Status": client[5],
                #             "Created By": client[6],
                #             "Created At": client[7]
                #         }
                #         for client in clients
                #     ],
                #     use_container_width=True,
                #     hide_index=True
                # )

                # cols = ["ID","Name","ShortName","ContactNo","Status",
                # "Created By","Created At"]

                # df = pd.DataFrame(
                #     [{c:v or "-" for c, v in zip(cols, client)} for client in clients]
                # )
                normalized_clients = []
                for c in clients:
                    normalized_clients.append({
                        "ID": c.get("id", "-"),
                        "Name": c.get("name", "-"),
                        "ShortName": c.get("short_name", "-"),
                        "ContactNo": c.get("contact_no", "-"),
                        "Status": "Active" if c.get("is_active") == 1 else "Inactive",
                        "Address": c.get("address", "-"),
                        #"Created By": c.get("created_by", "-"),
                        #"Created At": c.get("created_at", "-")
                    })

                df = pd.DataFrame(normalized_clients)
                # ──────────  JS cell renderer ──────────  
                cell_renderer = JsCode("""
                class ActionRenderer {
                init(p) {
                    const { id } = p.data;

                    this.eGui = document.createElement('span');
                    this.eGui.innerHTML = `
                    <button data-act="edit"   data-row="${id}">✏️</button>
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
                    width=30,              # stays 30 px even when grid resizes :contentReference[oaicite:1]{index=1}
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
                st.write("👀 raw event:", ev)           # dbg: inspect live payload

                if ev and ev.get("type") == "buttonClicked":
                    action  = ev["value"]              # 'edit' | 'delete'
                    row     = ev["data"]               # full row object

                    if action == "edit":
                        st.success(f"🛠️ Selected to Edit → {row}")
                        st.session_state.show_modal = True
                    else:
                        st.error  (f"🗑️ Selectted to Delete → {row}")
                    # Conditionally render dialog
                    if st.session_state.show_modal:
                        @st.dialog(title="Edit Client", width="large")
                        def clientModal(item): #dialog function
                                print(row['Name'])
                                print(st.session_state.username)
                                client_id = row["ID"]
                                render_client_form(form_title="",form_type="edit",on_submit_clear=True,data=row)
                        clientModal(row)

            # call DELETE logic here
            else:
                st.info("No clients found in the database.")
    
    with tab2:
        render_client_form(form_title="Add New Client",form_type="add",on_submit_clear=True)

if __name__ == "__main__":
    render_client_management()