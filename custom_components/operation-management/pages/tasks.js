import $ from "jquery";
import { APIClient } from "../utils/fetch";
import { getCurrentUser } from "../utils/userSession";
import { Toast, Alert } from "../utils/toastHelper";

class Tasks {
  constructor() { }

  async #services(payload = {}, url, type, message = "") {
    const token = localStorage.getItem("token");
    if (token) {
      Loader.show(message || "Please wait. Loading...");

      try {
        const data = await APIClient(url, payload, type, token);

        if (data.status_code === 200 && data.data) {
          return data;
        } else {
          console.error("API returned an unexpected response:", data);
        }

      } catch (err) {
        console.error("API error:", err);
      } finally {
        Loader.hide();
      }

    }
  }
  updateTaskVarification(taskIds, action) {
    // Check if taskIds is an array and not empty
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      alert("No tasks selected for verification.");
      return;
    }
    const payload = {
      task_ids: taskIds,
      action: action,
    };

    this.#services(payload, "tasks/manageTaskVerification", "POST", "Verifying Tasks...")
      .then((response) => {
        if (response && response.status_code === 200) {
          $("#previewTaskItemsModal").modal('show');
          Toast.fire({ icon: "success", title: response.message || "Saved successfully" });
        } else {
          Alert.warning("Failed");
        }
      })
      .catch((err) => {
        console.error("Error during verification:", err);
        alert("An error occurred while verifying tasks.");
      });
  }
  #template() {
    return `
      <div class="container py-4">
        <div class="card shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between">
            <h5 class="mb-0">Tasks List</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>TaskType</th>
                    <th>AssignedTo</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>IsVarified</th>
                    <th>IsCompleted</th>
                    <th>IsActive</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="tasks">
                  <tr class="text-center"><td colspan="10">No Data Found</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal fade" id="previewTaskItemsModal" tabindex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="editTaskModalLabel">Preview Task Items</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="" style="max-height: 400px; overflow-y: auto;">
                  <table class="table table-striped table-hover mb-0">
                    <thead class="table-light sticky-top">
                      <tr>
                        <th id="checkColumn"><input type="checkbox" id="selectAllTaskItems" /></th>
                        <th>#</th>
                        <th>batch_no</th>
                        <th>is_completed</th>
                        <th>is_varified</th>
                         <!--<th>client_id</th>
                        <th>varified_by</th>-->
                        <th>image_url</th>
                        <th id="itemActionColumn">Action</th>
                      </tr>
                    </thead>
                    <tbody id="tasksItems" style="max-height:400px; overflow:auto">
                      <tr class="text-center"><td colspan="8">No Data Found</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button class="btn btn-success" id="varifyAllTaskBtn">Approve Checked</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  async #bindEvents() {
    const self = this;
    var response = await self.#services({ skip: 0, limit: 20 }, "tasks/getTasks", "POST");

    let add_edit = false;
    const currentUser = getCurrentUser();
    let userType = currentUser?._ut ?? "";
    console.log("currentUser", currentUser);
    let verifyBtnTitle ="Click to View"
    let verifyBtnIcon ="bi bi-eye"
    if (userType == 0 || userType == 1 || userType == 2 ||  userType === 4) {
      add_edit = true;
      verifyBtnIcon ="bi bi-gear";
      verifyBtnTitle ="Click to perform Operation"
    }else{
      $("#itemActionColumn").text("Status");
      $("#varifyAllTaskBtn").hide();
    }
    // render table
    var tasksList = response.data
    let rows = "";
    if (tasksList && Array.isArray(tasksList)) {
      rows = tasksList
        .map(
          (t, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${t.client_name}</td>
            <td>${t.task_type}</td>
            <td>${t.assigned_to_name}</td>
            <td>${t.start_task}</td>
            <td>${t.end_task}</td>
            <td>${t.is_varified}</td>
            <td>${t.is_complete}</td>
            <td>${t.is_active}</td>
            <td>
              <button class="btn btn-sm btn-info btnTaskVerify" data-task="${t.id}" title="${verifyBtnTitle}"><i class="${verifyBtnIcon}"></i></button>
              ${add_edit ? '<a class="btn btn-sm btn-primary" data-task="' + t.id + '" href="#/edit_tasks?id=' + t.id + '"><i class="fas fa-edit"></i></a>' : ''}
            </td>
          </tr>`
        )
        .join("");
      //              ${add_edit ? '<a class="btn btn-sm btn-primary" data-task="'+t.id+'" href="#/edit_tasks?id='+t.id+'">Edit</a>':''}
    }
    $("#tasks").empty().append(rows || `<tr class="text-center"><td colspan="10">No Data Found</td></tr>`);

    $(document).on("click", ".btnTaskVerify", async function () {
      const t_id = $(this).data("task");
      var response = await self.#services({}, `tasks/getTaskWithItems/${t_id}`, "POST");
      // console.log("respose", response);
      var tasksItemsList = response.data.task_items ?? [];
      let rows = "";
      if (tasksItemsList && Array.isArray(tasksItemsList)) {
        rows = tasksItemsList
          .map(
            (ti, i) => `
          <tr>
            <td>${ti.is_varified == 0 && add_edit ? `<input type="checkbox" class="task-item-checkbox" data-taskitemid="${ti.id}" data-iscompleted="${ti.is_completed}" data-isvarified="${ti.is_varified}"/>` : ''}</td>
            <td>${i + 1}</td>
            <td>${ti.batch_no}</td>
            <td>${ti.is_completed == 0 ? '<span class="status-label status-danger">No</span>' : '<span class="status-label status-success">Yes</span>'}</td>
            <td>${ti.is_varified == 0 ? '<span class="status-label status-danger">No</span>' : '<span class="status-label status-success">Yes</span>'}</td>
             <!--<td>${ti.client_id}</td>
             <td>${ti.varified_by}</td>-->
            <td><img src="${ti.img_url}" alt="${ti.img_url}" style="height: 60px; width: 60px;"/></td>
            <td>
               ${ti.is_varified == 0 
                ? add_edit ? `<button class="btn btn-sm btn-success btnTaskItemVerify" data-taskitemid="${ti.id}" data-iscompleted="${ti.is_completed}" data-isvarified="${ti.id}" title="Click to Approve this Task">Approve</button>` : '<i class="bi bi-question-circle-fill text-warning is_approved" title="Approval Required"></i>'
                : `<i class="bi bi-check-circle text-success is_approved" title="Already Approved"></i>`
              }                           
            </td>
          </tr>`
          )
          .join("");
        //              ${add_edit ? '<a class="btn btn-sm btn-primary" data-task="'+t.id+'" href="#/edit_tasks?id='+t.id+'">Edit</a>':''}
      }
      $("#tasksItems").empty().append(rows || `<tr class="text-center"><td colspan="9">No Data Found</td></tr>`);


      $("#previewTaskItemsModal").modal('show');
    });


    $(document).on("change", "#selectAllTaskItems", function () {
      const isChecked = $(this).is(":checked");
      $(".task-item-checkbox").prop("checked", isChecked);
    });

    $(document).on("change", ".task-item-checkbox", function () {
      const allChecked = $(".task-item-checkbox").length === $(".task-item-checkbox:checked").length;
      $("#selectAllTaskItems").prop("checked", allChecked);
    });

    //================:: single approve :: ================
    $(document).on("click", ".btnTaskItemVerify", function () {
      const taskId = $(this).data("taskitemid");
      const isCompleted = $(this).data("iscompleted");
      if (!isCompleted || isCompleted == 0 || isCompleted == '0') {
        Toast.fire({ icon: "warning", title: "Task is not completed yet." });
        return;
      }
      var conf = confirm('Are you sure to approve?');
      if (conf === true) {
        self.updateTaskVarification([taskId], 'approve')
      }
    });

    //================:: multiple approve :: ================
    $(document).on("click", "#varifyAllTaskBtn", function () {
      let selectedTaskItemIds = [];
      let incompleteTaskFound = false;
      let incompleteTaskSL = null;

      $(".task-item-checkbox:checked").each(function () {
        const isCompleted = $(this).data("iscompleted");
        const slIndex = $(this).closest("tr").find("td:nth-child(2)").text().trim();

        if (!isCompleted || isCompleted == 0 || isCompleted == '0') {
          incompleteTaskFound = true;
          incompleteTaskSL = slIndex;
          return false; 
        }
        selectedTaskItemIds.push($(this).data("taskitemid"));
      });

      if (incompleteTaskFound) {
        Toast.fire({ icon: "warning", title: `Task is not completed yet at serial : <b>${incompleteTaskSL}</b>` });
        return; // stop further processing
      }
      if (!selectedTaskItemIds || selectedTaskItemIds.length == 0) {
        Toast.fire({ icon: "warning", title: "No check found. " });
        return;
      }
      self.updateTaskVarification(selectedTaskItemIds, 'approve');
    });
    //============:: toggle checkbox on row click ::==============
    $(document).on("click", "#tasksItems tr", function (e) {
      if ($(e.target).is("input[type='checkbox'], button, a")) return;
      const $checkbox = $(this).find(".task-item-checkbox");
      if ($checkbox.length) {
        $checkbox.prop("checked", !$checkbox.prop("checked"));
      }
    });


  }

  #resetForm() {
    $("#task-id").val("0");
    $("#task-title").val("");
    $("#task-desc").val("");
    $("#task-status").val("pending");
    $("#editTaskModalLabel").text("Add New Task");
    $("#saveTaskBtn").text("Save");
  }

  render() {
    return this.#template();
  }

  async afterRender() {
    await this.#bindEvents();
  }
}

export const tasksPage = new Tasks();
