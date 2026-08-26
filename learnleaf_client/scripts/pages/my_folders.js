const new_folder_button = document.getElementById("new-folder-button");

new_folder_button.addEventListener("click", () => {
    if (document.querySelector(".folder-form-overlay")) {
        return;
    }

    const div = document.createElement("div");
    const form = document.createElement("form");
    const form_title = document.createElement("h2");
    const information_div = document.createElement("div");
    const name_input = document.createElement("input");
    const description_input = document.createElement("input");
    const submission_div = document.createElement("div");
    const submit_button = document.createElement("input");
    const cancel_button = document.createElement("button");

    div.classList.add("folder-form-overlay");
    form.classList.add("new-folder-form");
    form.id = "new-folder-form";

    form_title.textContent = "Create New Folder";

    information_div.classList.add("folder-form-fields");

    name_input.classList.add("folder-form-input");
    name_input.id = "folder-name";
    name_input.name = "name";
    name_input.type = "text";
    name_input.placeholder = "Folder name";
    name_input.maxLength = 100;
    name_input.required = true;

    description_input.classList.add("folder-form-input");
    description_input.id = "folder-description";
    description_input.name = "description";
    description_input.type = "text";
    description_input.placeholder = "Description (optional)";

    submission_div.classList.add("folder-form-actions");

    submit_button.classList.add("folder-form-submit");
    submit_button.type = "submit";
    submit_button.value = "Create Folder";

    cancel_button.classList.add("folder-form-cancel");
    cancel_button.id = "cancel-folder-button";
    cancel_button.type = "button";
    cancel_button.textContent = "Cancel";

    information_div.append(name_input, description_input);
    submission_div.append(cancel_button, submit_button);
    form.append(form_title, information_div, submission_div);
    div.append(form);
    document.body.append(div);
    document.body.classList.add("folder-modal-open");

    name_input.focus();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const auth_token = localStorage.getItem("auth_token");

        const request_data = new URLSearchParams();
        request_data.append("auth_token", auth_token);
        request_data.append("name", name_input.value);
        request_data.append("description", description_input.value);

        div.remove();
        document.body.classList.remove("folder-modal-open");

        axios.post(BASE_URL + "folders/add_folder.php", request_data)
            .then(res => {
                if (!res.data.success){
                    showMessage(res.data.message);
                    return;
                }

                showMessage(res.data.message);
                getFolders();
            })
            .catch(err => {
                showMessage(err);
                console.error(err);
            });
    })

    cancel_button.addEventListener("click", () => {
        div.remove();
        document.body.classList.remove("folder-modal-open");
    });
});

function getFolders(){
    const auth_token = localStorage.getItem("auth_token");

    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);

    showPageLoading();

    axios.post(BASE_URL + "folders/get_folders.php", request_data)
        .then(res => {
            hidePageLoading();
            if (!res.data.success){
                showMessage(res.data.message);
                return;
            }
            
            renderCards(res.data.data);
        })
        .catch(err => {
            hidePageLoading();
            showMessage(err);
            console.error(err);
        })
}

function renderCards(data){
    const card_section = document.querySelector(".folders-section");
    const new_folder_card = document.querySelector(".new-folder-card");

    card_section.querySelectorAll(".folder-card").forEach((folder_card) => {
        folder_card.remove();
    });

    data.forEach((folder_data) => {
        const folder = document.createElement("article");
        const folder_title = document.createElement("h2");
        const folder_description = document.createElement("p");
        const book_contained = document.createElement("span");
        const folder_actions = document.createElement("div");
        const link_to_folder = document.createElement("a");
        const delete_button = document.createElement("button");

        folder.classList.add("folder-card");
        folder_title.classList.add("folder-title");
        folder_description.classList.add("folder-description");
        book_contained.classList.add("books-contained");
        folder_actions.classList.add("folder-card-actions");
        delete_button.classList.add("delete-folder-button");

        folder_title.textContent = folder_data.name;

        if (folder_data.description) {
            folder_description.textContent = folder_data.description;
        }
        else {
            folder_description.textContent = "No description provided.";
        }

        if (folder_data.book_count !== undefined) {
            let book_word = "books";

            if (folder_data.book_count == 1) {
                book_word = "book";
            }

            book_contained.textContent = `${folder_data.book_count} ${book_word}`;
        }
        else {
            book_contained.textContent = "Open to view books";
        }

        link_to_folder.textContent = "Open Folder";
        link_to_folder.href = `folder.html?folder_id=${encodeURIComponent(folder_data.id)}`;
        delete_button.type = "button";
        delete_button.textContent = "Delete Folder";
        delete_button.title = `Delete ${folder_data.name}`;
        delete_button.setAttribute("aria-label", `Delete ${folder_data.name}`);

        delete_button.addEventListener("click", () => {
            openFolderDeletionConfirmation(folder_data);
        });

        folder_actions.append(link_to_folder, delete_button);
        folder.append(folder_title, folder_description, book_contained, folder_actions);
        card_section.insertBefore(folder, new_folder_card);
    });
}

function openFolderDeletionConfirmation(folder_data){
    if (document.querySelector(".folder-delete-overlay")) {
        return;
    }

    const delete_overlay = document.createElement("div");
    const delete_dialog = document.createElement("section");
    const dialog_title = document.createElement("h2");
    const warning_message = document.createElement("p");
    const dialog_actions = document.createElement("div");
    const cancel_button = document.createElement("button");
    const confirm_button = document.createElement("button");
    const dialog_title_id = `delete-folder-title-${folder_data.id}`;

    delete_overlay.classList.add("folder-delete-overlay");
    delete_dialog.classList.add("folder-delete-dialog");
    dialog_actions.classList.add("folder-delete-actions");
    cancel_button.classList.add("folder-delete-cancel");
    confirm_button.classList.add("folder-delete-confirm");

    delete_dialog.setAttribute("role", "alertdialog");
    delete_dialog.setAttribute("aria-modal", "true");
    delete_dialog.setAttribute("aria-labelledby", dialog_title_id);

    dialog_title.id = dialog_title_id;
    dialog_title.textContent = "Delete this folder?";
    warning_message.textContent = `Are you sure you want to delete “${folder_data.name}”? The folder and every book inside it will be permanently removed.`;

    cancel_button.type = "button";
    cancel_button.textContent = "Cancel";
    confirm_button.type = "button";
    confirm_button.textContent = "Delete Folder";

    dialog_actions.append(cancel_button, confirm_button);
    delete_dialog.append(dialog_title, warning_message, dialog_actions);
    delete_overlay.append(delete_dialog);
    document.body.append(delete_overlay);

    cancel_button.focus();

    cancel_button.addEventListener("click", () => {
        delete_overlay.remove();
    })

    confirm_button.addEventListener("click", () => {
        const auth_token = localStorage.getItem("auth_token");

        const request_data = new URLSearchParams();
        request_data.append("auth_token", auth_token);
        request_data.append("folder_id", folder_data.id);

        axios.post(BASE_URL + "folders/delete_folder.php", request_data)
            .then(res => {
                if(!res.data.success){
                    delete_overlay.remove();
                    showMessage(res.data.message);
                    return;
                }

                delete_overlay.remove();
                showMessage(res.data.message);
                getFolders();
            })
            .catch(err => {
                showMessage(err);
                console.error(err);
            })
    })
}

getFolders();
