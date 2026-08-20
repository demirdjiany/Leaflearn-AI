const add_book_button = document.getElementById("add-book-button");
const url_parameters = new URLSearchParams(window.location.search);
const folder_id = url_parameters.get("folder_id");

add_book_button.addEventListener("click", () => {
    if (document.querySelector(".book-form-overlay")) {
        return;
    }

    const div = document.createElement("div");
    const form = document.createElement("form");
    const form_title = document.createElement("h2");
    const information_div = document.createElement("div");
    const title_input = document.createElement("input");
    const file_label = document.createElement("label");
    const file_input = document.createElement("input");
    const submission_div = document.createElement("div");
    const submit_button = document.createElement("input");
    const cancel_button = document.createElement("button");

    div.classList.add("book-form-overlay");

    form.classList.add("new-book-form");
    form.id = "new-book-form";
    form.enctype = "multipart/form-data";

    form_title.textContent = "Add New Book";

    information_div.classList.add("book-form-fields");

    title_input.classList.add("book-form-input");
    title_input.id = "book-title";
    title_input.name = "title";
    title_input.type = "text";
    title_input.placeholder = "Book title";
    title_input.required = true;

    file_label.classList.add("book-file-label");
    file_label.htmlFor = "epub-file";
    file_label.textContent = "Choose an EPUB file";

    file_input.classList.add("book-file-input");
    file_input.id = "epub-file";
    file_input.name = "epub_file";
    file_input.type = "file";
    file_input.accept = ".epub,application/epub+zip";
    file_input.required = true;

    submission_div.classList.add("book-form-actions");

    submit_button.classList.add("book-form-submit");
    submit_button.type = "submit";
    submit_button.value = "Add Book";

    cancel_button.classList.add("book-form-cancel");
    cancel_button.id = "cancel-book-button";
    cancel_button.type = "button";
    cancel_button.textContent = "Cancel";

    information_div.append(title_input, file_label, file_input);
    submission_div.append(cancel_button, submit_button);
    form.append(form_title, information_div, submission_div);
    div.append(form);
    document.body.append(div);

    title_input.focus();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const auth_token = localStorage.getItem("auth_token");

        const request_data = new FormData();
        request_data.append("auth_token", auth_token);
        request_data.append("title", title_input.value);
        request_data.append("epub_file", file_input.files[0]);
        request_data.append("folder_id", folder_id);

        axios.post(BASE_URL + "epubs/add_epub.php", request_data)
            .then(res => {
                if(!res.data.success){
                    alert(res.data.message);
                    return;
                }

                div.remove();
                getEpubs();
            })
            .catch(err => {
                alert(err);
                console.error(err);
            })

    })

    cancel_button.addEventListener("click", () => {
        div.remove();
    });
});

function getEpubs(){
    const auth_token = localStorage.getItem("auth_token");

    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);
    request_data.append("folder_id", folder_id);

    axios.post(BASE_URL + "epubs/get_epubs.php", request_data)
        .then(res => {
            if (!Array.isArray(res.data)){
                alert(res.data.message);
                return;
            }
            
            renderBookCards(res.data);
        })
        .catch(err => {
            alert(err);
            console.error(err);
        });
}

function renderBookCards(data){
    const book_grid = document.querySelector(".book-grid");

    book_grid.querySelectorAll(".card-background").forEach((book_card) => {
        book_card.remove();
    });

    data.forEach((book_data) => {
        const book_card = document.createElement("article");
        const card_title = document.createElement("div");
        const book_title = document.createElement("h3");
        const card_information = document.createElement("div");
        const file_label = document.createElement("p");
        const original_filename = document.createElement("p");
        const link_to_book = document.createElement("a");

        book_card.classList.add("card-background");
        card_title.classList.add("card-title");
        card_information.classList.add("card-information");
        file_label.classList.add("book-author");
        original_filename.classList.add("book-description");

        book_title.textContent = book_data.title;
        file_label.textContent = "EPUB file";
        original_filename.textContent = book_data.original_filename;

        link_to_book.textContent = "Open Book";
        link_to_book.href = `book.html?folder_id=${encodeURIComponent(folder_id)}&epub_id=${encodeURIComponent(book_data.id)}`;

        card_title.append(book_title);
        card_information.append(file_label, original_filename, link_to_book);
        book_card.append(card_title, card_information);
        book_grid.append(book_card);
    });
}

getEpubs();
