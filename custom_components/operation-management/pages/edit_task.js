
import { apiRoutes } from "../utils/endpoints";
import { APIClient } from "../utils/fetch";

class EditTasks {
	taskId = null;
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
	#template() {
		return `
      <div class="container py-4">
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Edit Task</h5>
          </div>
          <div class="card-body">
            <form id="taskForm">
			<div class="row">
				<div class="mb-3 col-4">
                <label class="form-label" for="task_type">Task Type</label>
				<select class="form-select" id="task_type">
					<option value="labeling">Labeling</option>
				</select>
    
              </div>
              <div class="mb-3 col-4">
                <label class="form-label">Start Time</label>
                <input type="text" id="start_task" class="form-control datepicker" readonly="readonly">
              </div>
              <div class="mb-3 col-4">
                <label class="form-label">End Time</label>
                <input type="text" id="end_task" class="form-control datepicker" readonly="readonly">
              </div>
			</div>
			<div class="row"> 
			  <div class="mb-3 col-6"">
                <label class="form-label">Client</label>
				<select class="form-select" id="client_id"></select>
              </div>
              <div class="mb-3 col-6"">
                <label class="form-label">Assigned To</label>
				<select class="form-select" id="assign_to"></select>
              </div>
			</div>
			<div class="row">
				<div class="mb-3 col-12"">
					<label class="form-label">Image Batches</label>
					<select class="form-select" id="batch" multiple></select>
				</div>
			</div>
        
              <div class="text-end">
			  	<a class="btn btn-info" href="#/tasks"> <i class="fas fa-arrow-left"></i> Back To List </a>
                <button type="button" class="btn btn-primary" id="saveTaskBtn">Update Task</button>
              </div>
            </form>
          </div>
        </div>

        
    `;
	}

	render(params = {}) {

		//console.log("found params",params)
		if (params) {
			this.taskId = params.id;
		}
		return this.#template();
	}

	async afterRender() {
		await this.#bindEvents();
	}

	async #bindEvents() {
		var self = this;
		if (this.taskId) {

		}

		flatpickr(".datepicker", {
			dateFormat: "Y-m-d H:i",//"d-m-Y H:i",
			enableTime: true,
			allowInput: true,
			defaultDate: new Date(),
			minDate: "today",
		});
		//================== Client Picker Option Start ====================
		var response = await this.#services({}, apiRoutes.clients.dropdown, "POST");

		const clientElm = document.getElementById('client_id');

		const clientChoices = new Choices(clientElm, {
			removeItemButton: true,
			searchEnabled: true,
			placeholder: true,
			placeholderValue: 'Select a client',
			shouldSort: false,
			//maxItemCount: 1,
			duplicateItemsAllowed: false
		});

		// Convert your user data to Choices format
		const clientChoicesData = response.data.map(user => ({
			value: user.id,
			label: user.name
		}));
		clientChoicesData.unshift({ value: "", label: "search a client" })
		// Add choices to the select dropdown
		clientChoices.setChoices(clientChoicesData, 'value', 'label', true);
		//clientChoices.setChoiceByValue(3);


		//================== Client Picker Option End ====================

		//================== Assign To Start ====================
		const userElement = document.getElementById('assign_to');

		const userChoices = new Choices(userElement, {
			removeItemButton: true,
			searchEnabled: true,
			placeholder: true,
			placeholderValue: 'Select a labeller user',
			shouldSort: false,
			searchResultLimit: 10,
			searchPlaceholderValue: 'Type to search user',
			//maxItemCount: 1,
			duplicateItemsAllowed: false
		});

		// Add event listener for dynamic search
		userElement.addEventListener('search', async function (event) {
			const searchTerm = event.detail.value;

			if (!searchTerm || searchTerm.length < 3) {
				userChoices.clearChoices();
				return;
			}

			//console.log('Searching users for:', searchTerm);

			try {

				let clientId = $("#client_id").val();
				if (!clientId || clientId == "" || clientId == null) {
					alert("Select a client");
					return;
				}
				const user_response = await self.#services({}, apiRoutes.users.dropdownWithSearch(searchTerm, clientId), "POST");

				const userList = user_response.data;
				//console.log('User response:', userList);

				if (Array.isArray(userList)) {
					const newChoices = userList.map(user => ({
						value: user.id,
						label: `${user.full_name}~${user.username}`
					}));

					userChoices.clearChoices();
					userChoices.setChoices(newChoices, 'value', 'label', true);
				}
			} catch (error) {
				console.error('Error fetching users:', error);
			}
		});

		//================== Assign To END ====================


		//================== Batch Picker Option Start ====================
		const batch_element = $('#batch')[0];

		const batch_choices = new Choices(batch_element, {
			removeItemButton: true,
			searchEnabled: true,
			placeholder: true,
			placeholderValue: 'Search for options',
			shouldSort: false,
			searchResultLimit: 10,
			searchPlaceholderValue: 'Type to search',
			maxItemCount: -1, // unlimited
			duplicateItemsAllowed: false
		});

		// Add event 
		batch_element.addEventListener('search', async function (event) {
			const searchTerm = event.detail.value;

			if (!searchTerm || searchTerm.length < 3) {
				batch_choices.clearChoices();
				return;
			}

			//console.log('Searching for:', searchTerm);

			try {
				let clientId = $("#client_id").val();
				if (!clientId || clientId == "" || clientId == null) {
					alert("Select a client");
					return;
				}
				const response = await self.#services({},  apiRoutes.image_batches.dropdown(searchTerm, clientId), "POST");

				const batchSelectList = response.data;
				//console.log(response);

				if (Array.isArray(batchSelectList)) {
					const newChoices = batchSelectList.map(item => ({
						value: item.id,
						label: item.batch_no
					}));

					batch_choices.clearChoices();
					batch_choices.setChoices(newChoices, 'value', 'label', true);
				}

			} catch (error) {
				console.error('Fetch error:', error);
			}
		});
		//================== Batch Picker Option End ====================

		//======== load DB Task to Edit Start ==========
		var res = await this.#services({}, apiRoutes.tasks.withItems(self.taskId), "POST");

		var taskObj = res.data;
		var taskItemObj = res.data.task_items;
		if (taskObj && taskItemObj) {
			//console.log("==========Enter to preload the form data=====")
			setTimeout(() => {
				clientChoices.setChoiceByValue(taskObj.client_id);
				userChoices.setChoices([{
					value: taskObj.assigned_to,
					label: `${taskObj.assigned_to_full_name}~${taskObj.assigned_to_username}`
				}], 'value', 'label', true);
				userChoices.setChoiceByValue(taskObj.assigned_to);

				let Items = [];
				let ItemsId = [];
				for (let index = 0; index < taskItemObj.length; index++) {
					Items.push({
						value: taskItemObj[index].batch_id,
						label: taskItemObj[index].batch_no
					})
					ItemsId.push(taskItemObj[index].batch_id)
				}
				batch_choices.setChoices(Items, 'value', 'label', true);
				batch_choices.setChoiceByValue(ItemsId);
			}, 100);
		}

		//======== load DB Task to Edit End ==========

		$("#saveTaskBtn").on("click", async () => {

			////console.log("selected", selectedBatches);
			let task_type = $("#task_type").val();
			let start_task = $("#start_task").val();
			let end_task = $("#end_task").val();
			let assign_to = $("#assign_to").val();
			let client_id = $("#client_id").val();

			if (!task_type || task_type == null) {
				alert("Select a Task Type");
				return;
			}
			if (!start_task || start_task == null) {
				alert("Enter task start time");
				return;
			}
			if (!end_task || end_task == null) {
				alert("Enter a tsk end time");
				return;
			}
			if (!client_id || client_id == null) {
				alert("Choose a Client");
				return;
			}
			if (!assign_to || assign_to == null) {
				alert("Choose an Assign To");
				return;
			}
			const selectedBatches = Array.isArray(batch_choices.getValue())
				? batch_choices.getValue()
					.filter(item => item && typeof item === 'object')
					.map(item => ({
						batch_id: item.value ?? null,
						batch_no: item.label ?? null
					}))
				: [];
			if (selectedBatches.length == 0) {
				alert("Choose Image Batches");
				return;
			}
			const payload = {
				task_type: task_type,
				start_task: start_task,
				end_task: end_task,
				assigned_to: parseInt(assign_to),
				client_id: parseInt(client_id),
				task_items: selectedBatches//batch no
			};
			//console.log("Save to DB",payload);
			const token = localStorage.getItem("token");
			if (token) {
				Loader.show("Saving task...");
				const response = await self.#services(payload, apiRoutes.tasks.update(self.taskId), "POST");
				if (response) {
					alert(response.message)
				}
			}
		});

		$('#client_id').on('change', function () {
			// Clear user select (assign_to)
			userChoices.clearStore();
			userChoices.clearInput();
			userChoices.setChoices([], 'value', 'label', true);

			// Clear batch select (batch_element)
			batch_choices.clearStore();
			batch_choices.clearInput();
			batch_choices.setChoices([], 'value', 'label', true);
		});

	}


	#resetItemModal() {

	}
}

const editTasksPage = new EditTasks();
export { editTasksPage };
