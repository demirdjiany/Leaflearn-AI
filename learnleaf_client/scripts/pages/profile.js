const name = document.getElementById("profile-name");
const username = document.getElementById("profile-username");
const member_since = document.getElementById("member-since");
const account_username = document.getElementById("account-username");
const account_name = document.getElementById("account-name");
const account_email = document.getElementById("account-email");
const folder_count = document.getElementById("folder-count");
const book_count = document.getElementById("book-count");
const book_started_count = document.getElementById("books-in-progress-count");
const overall_progress = document.getElementById("overall-progress");
const current_book_title = document.getElementById("current-book-title");
const current_book_folder = document.getElementById("current-book-folder");
const current_book_reading_progress = document.getElementById("reading-progress-percentage");
const current_book_reading_progress_bar = document.getElementById("reading-progress-bar");
const current_book_button = document.getElementById("continue-reading-link");

const edit_profile_btn = document.getElementById("edit-profile-button");
const change_password_btn = document.getElementById("change-password-button");
const logout_btn = document.getElementById("logout-button");

change_password_btn.addEventListener("click", () => {
    if (document.querySelector(".change-password-overlay")) {
        return;
    }

    const overlay = document.createElement("div");
    const form = document.createElement("form");
    const form_title = document.createElement("h2");
    const form_fields = document.createElement("div");
    const email_input = document.createElement("input");
    const new_password_input = document.createElement("input");
    const confirm_password_input = document.createElement("input");
    const form_actions = document.createElement("div");
    const cancel_button = document.createElement("button");
    const submit_button = document.createElement("input");

    overlay.classList.add("change-password-overlay");
    form.classList.add("change-password-form");
    form.id = "change-password-form";
    form_title.textContent = "Change Password";
    form_fields.classList.add("change-password-fields");

    email_input.classList.add("change-password-input");
    email_input.id = "change-password-email";
    email_input.name = "email";
    email_input.type = "email";
    email_input.placeholder = "Email address";
    email_input.value = account_email.textContent;
    email_input.required = true;

    new_password_input.classList.add("change-password-input");
    new_password_input.id = "new-password";
    new_password_input.name = "new_password";
    new_password_input.type = "password";
    new_password_input.placeholder = "New password";
    new_password_input.autocomplete = "new-password";
    new_password_input.required = true;

    confirm_password_input.classList.add("change-password-input");
    confirm_password_input.id = "confirm-new-password";
    confirm_password_input.name = "confirm_password";
    confirm_password_input.type = "password";
    confirm_password_input.placeholder = "Confirm new password";
    confirm_password_input.autocomplete = "new-password";
    confirm_password_input.required = true;

    form_actions.classList.add("change-password-actions");

    cancel_button.classList.add("change-password-cancel");
    cancel_button.type = "button";
    cancel_button.textContent = "Cancel";

    submit_button.classList.add("change-password-submit");
    submit_button.type = "submit";
    submit_button.value = "Update Password";

    form_fields.append(email_input, new_password_input, confirm_password_input);
    form_actions.append(cancel_button, submit_button);
    form.append(form_title, form_fields, form_actions);
    overlay.append(form);
    document.body.append(overlay);
    document.body.classList.add("change-password-modal-open");

    email_input.focus();

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const auth_token =  localStorage.getItem("auth_token");

        const request_data = new URLSearchParams();
        request_data.append("auth_token", auth_token);
        request_data.append("email", email_input.value);
        request_data.append("password", new_password_input.value);
        request_data.append("confirm_password", confirm_password_input.value);

        axios.post(BASE_URL + "users/update_user_password.php", request_data)
            .then(res => {
                if(!res.data.success){
                    showMessage(res.data.message);
                    return;
                }

                showMessage(res.data.message);
                overlay.remove();
                document.body.classList.remove("change-password-modal-open");
            })
            .catch(err => {
                showMessage(err);
                console.error(err);
            })
    });

    cancel_button.addEventListener("click", () => {
        overlay.remove();
        document.body.classList.remove("change-password-modal-open");
    });
});

// profile summary + account info

function getCurrentUser(){
    const auth_token = localStorage.getItem("auth_token");

    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);

    if (!auth_token) {
        window.location.href = "login.html";
        return;
    }

    showPageLoading();

    axios.post(BASE_URL + "users/get_current_user.php", request_data)
        .then(res => {
            hidePageLoading();
            if (!res.data.success){
                localStorage.removeItem("auth_token");
                showMessage(res.data.message);
                window.location.href = "login.html";
                return;
            }
            renderProfileSummary(res.data.data.full_name, res.data.data.username, res.data.data.created_at);
            renderAccountInformation(res.data.data.full_name, res.data.data.username, res.data.data.email);
        })
        .catch(err => {
            hidePageLoading();
            showMessage("Error");
            console.error(err);
        });
}

edit_profile_btn.addEventListener("click", () => {
    if (document.querySelector(".edit-profile-overlay")) {
        return;
    }

    const overlay = document.createElement("div");
    const form = document.createElement("form");
    const form_title = document.createElement("h2");
    const form_fields = document.createElement("div");
    const full_name_label = document.createElement("label");
    const full_name_input = document.createElement("input");
    const username_label = document.createElement("label");
    const username_input = document.createElement("input");
    const form_actions = document.createElement("div");
    const cancel_button = document.createElement("button");
    const submit_button = document.createElement("input");

    overlay.classList.add("change-password-overlay", "edit-profile-overlay");
    form.classList.add("change-password-form", "edit-profile-form");
    form.id = "edit-profile-form";
    form_title.textContent = "Edit Profile";
    form_fields.classList.add("change-password-fields");

    full_name_label.classList.add("edit-profile-label");
    full_name_label.htmlFor = "edit-profile-full-name";
    full_name_label.textContent = "Full Name:";

    full_name_input.classList.add("change-password-input");
    full_name_input.id = "edit-profile-full-name";
    full_name_input.name = "full_name";
    full_name_input.type = "text";
    full_name_input.placeholder = "Full name";
    full_name_input.value = account_name.textContent;
    full_name_input.required = true;

    username_label.classList.add("edit-profile-label");
    username_label.htmlFor = "edit-profile-username";
    username_label.textContent = "Username:";

    username_input.classList.add("change-password-input");
    username_input.id = "edit-profile-username";
    username_input.name = "username";
    username_input.type = "text";
    username_input.placeholder = "Username";
    username_input.value = account_username.textContent;
    username_input.required = true;

    form_actions.classList.add("change-password-actions");

    cancel_button.classList.add("change-password-cancel");
    cancel_button.type = "button";
    cancel_button.textContent = "Cancel";

    submit_button.classList.add("change-password-submit");
    submit_button.type = "submit";
    submit_button.value = "Save Changes";

    form_fields.append(full_name_label, full_name_input, username_label, username_input);
    form_actions.append(cancel_button, submit_button);
    form.append(form_title, form_fields, form_actions);
    overlay.append(form);
    document.body.append(overlay);
    document.body.classList.add("change-password-modal-open");

    full_name_input.focus();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const auth_token = localStorage.getItem("auth_token");

        const request_data = new URLSearchParams();
        request_data.append("auth_token", auth_token);
        request_data.append("username", username_input.value);
        request_data.append("full_name", full_name_input.value);

        axios.post(BASE_URL + "users/update_user.php", request_data)
            .then(res => {
                if(!res.data.success){
                    showMessage(res.data.message);
                    return;
                }

                showMessage(res.data.message);
                getCurrentUser();
                overlay.remove();
                document.body.classList.remove("change-password-modal-open");
            })
            .catch(err => {
                showMessage(err);
                console.error(err);
            })
    });

    cancel_button.addEventListener("click", () => {
        overlay.remove();
        document.body.classList.remove("change-password-modal-open");
    });
})

logout_btn.addEventListener("click", () => {
    const auth_token = localStorage.getItem("auth_token");
    
    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);

    axios.post(BASE_URL + "users/logout_user.php", request_data)
        .then(res => {
            if (!res.data.success){
                showMessage(res.data.message);
                return;
            }

            localStorage.removeItem("auth_token");
            window.location.href = "login.html";
            showMessage(res.data.message);
        })
        .catch(err => {
            showMessage("Error");
            console.error(err);
        });
})

function renderProfileSummary(users_name, users_username, users_member_since){
    name.textContent = users_name;
    username.textContent = users_username;
    member_since.textContent = users_member_since;
}

function renderAccountInformation(users_name, users_username, users_email){
    account_name.textContent = users_name;
    account_username.textContent = users_username;
    account_email.textContent = users_email;
}

// Learning Overview rendering

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
            
            getEpubs(res.data.data);
            countFolders(res.data.data);
        })
        .catch(err => {
            hidePageLoading();
            showMessage(err);
            console.error(err);
        })
}

function getEpubs(folders_data){
    folders_data.forEach((folder_data) => {
        const auth_token = localStorage.getItem("auth_token");

        const request_data = new URLSearchParams();
        request_data.append("auth_token", auth_token);
        request_data.append("folder_id", folder_data.id);

        showPageLoading();

        axios.post(BASE_URL + "epubs/get_epubs.php", request_data)
            .then(res => {
                hidePageLoading();
                if (!res.data.success){
                    showMessage(res.data.message);
                    return;
                }

                countEpubs(res.data.data);
                calculateTotalProgress(res.data.data);
                findLastBookRead(res.data.data);
            })
            .catch(err => {
                hidePageLoading();
                showMessage(err);
                console.error(err);
            })
    })
}

let folder_num = 0;

function countFolders(folders_data){
    folders_data.forEach(() => {
        folder_num++;
    })

    renderFolderCount(folder_num);
}

let epub_num = 0;
let epub_in_progress = 0;

function countEpubs(epubs_data){
    epubs_data.forEach((epub_data) => {
        epub_num++;

        if(epub_data.progress_percentage > 0 && epub_data.progress_percentage < 100){
            epub_in_progress++;
        }
    })

    renderEpubCount(epub_num, epub_in_progress);
}

function renderFolderCount(folder_num){
    folder_count.textContent = folder_num;
}

function renderEpubCount(epub_num, epub_in_progress){
    book_count.textContent = epub_num;
    book_started_count.textContent = epub_in_progress;
}

let epub_nums = 0;
let total_num = 0;

function calculateTotalProgress(epubs_data){
    epubs_data.forEach((epub_data) => {
        epub_nums++;
        total_num += Number(epub_data.progress_percentage); 
    })

    if (epub_nums == 0){
        return;
    }

    const total_progress = total_num/epub_nums;
    renderOverallProgress(total_progress);
}

function renderOverallProgress(total_progress){
    overall_progress.textContent = `${total_progress}%`
}

// last book read
let last_book = null;

function findLastBookRead(epubs_data){
    epubs_data.forEach((epub_data) => {
        if(!epub_data){
            return;
        }

        if(last_book === null){
            last_book = epub_data;
            return;
        }

        if(new Date(last_book.last_read_at) < new Date(epub_data.last_read_at)){
            last_book = epub_data;
        }
    })

    renderLastRead(last_book);
    findLastBookFolder(last_book);
}

function findLastBookFolder(last_book){
    const auth_token = localStorage.getItem("auth_token");

    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);
    request_data.append("id", last_book.folder_id);

    showPageLoading();

    axios.post(BASE_URL + "folders/get_folder.php", request_data)
        .then(res => {
            hidePageLoading();
            if(!res.data.success){
                showMessage(res.data.message);
                return;
            }

            renderLastReadsFolder(res.data.data);
            continueReadingLinkUpdate(last_book, res.data.data)
        })
        .catch(err => {
            hidePageLoading();
            showMessage(err);
            console.error(err);
        })
}

function renderLastRead(last_book){
    current_book_title.textContent = last_book.title;
    current_book_reading_progress.textContent = `${Number(last_book.progress_percentage)}%`;
    current_book_reading_progress_bar.value = Number(last_book.progress_percentage);
}

function renderLastReadsFolder(folder){
    current_book_folder.textContent = folder.name;
}

function continueReadingLinkUpdate(last_book, folder){
    current_book_button.href = `../library/book.html?folder_id=${encodeURIComponent(folder.id)}&epub_id=${encodeURIComponent(last_book.id)}`; 
}

getCurrentUser();
getFolders();

