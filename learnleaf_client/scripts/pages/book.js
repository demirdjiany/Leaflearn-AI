const url_parameters = new URLSearchParams(window.location.search);
const folder_id = url_parameters.get("folder_id");
const epub_id = url_parameters.get("epub_id");
const book_title = document.getElementById("book-title");
const page_counter = document.getElementById("page-counter");
const render_area = document.getElementById("epub-render");
const ask_ai_btn = document.getElementById("ask-ai-button");

let rendition;
let reading_progress;
let current_location;
let save_timeout;
let book;
let summary_progress_percentage = 0;

function getEpubPath(){
    const auth_token = localStorage.getItem("auth_token");

    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);
    request_data.append("folder_id", folder_id);
    request_data.append("epub_id", epub_id);

    showPageLoading();

    axios.post(BASE_URL + "epubs/get_epub.php", request_data)
        .then(res => {
            if(!res.data.success){
                hidePageLoading();
                showMessage(res.data.message);
                return;
            }
            renderEpub(res.data.data);
        })
        .catch(err => {
            hidePageLoading();
            showMessage(err);
            console.error(err);
        })

}

function renderEpub(data){
    summary_progress_percentage = Number(data.summary_progress_percentage);
    const saved_location = data.epub_current_location;
    const path = `../../../learnleaf_server/${data.epub_file_path}`;
    const title = data.title;

    book_title.textContent = title;

    book = ePub(path);
    rendition = book.renderTo(render_area, {width: "100%", height: "100%", manager: "continuous", flow: "scrolled-doc", spread: "none"});

    rendition.hooks.content.register((contents) => {
        contents.addStylesheetRules({
            "h1[class]": {
                "margin-top": "0 !important",
                "margin-bottom": "0 !important",
                "padding-top": "0.67em !important",
                "padding-bottom": "0.67em !important"
            },
            "body.calibre h1": {
                "text-align": "center !important"
            }
        });
    });

    rendition.on("relocated", (location) => {
        reading_progress = Math.round(location.start.percentage * 100);

        page_counter.textContent = `Reading progress: ${reading_progress}%`;
        current_location = location.start.cfi;
        
        clearTimeout(save_timeout);

        save_timeout = setTimeout(() => {
            saveReadingProgress();
        }, 1000);
    });

    book.ready.then(() => {
        return book.locations.generate(1024);
    }).then(() => {
        if(saved_location){
            return rendition.display(saved_location);
        }
        else{
            return rendition.display();
        }
    }).then(() => {
        hidePageLoading();
    }).catch(err => {
        hidePageLoading();
        showMessage("The EPUB could not be displayed.");
        console.error(err);
    });
}

function getBookContext(){
    const section_promises = [];

    book.spine.each((section) => {
        const section_promise = section.load(book.load.bind(book))
            .then((section_content) => {
                if(!section_content){
                    return "";
                }

                const section_text = section_content.textContent
                    .replace(/\s+/g, " ")
                    .trim();

                return section_text;
            })
        
        section_promises.push(section_promise);
    })

    return Promise.all(section_promises)
        .then((section_texts) => {
            const full_book_text = section_texts.join("\n\n");

            const characters_read = Math.floor(
                full_book_text.length * (reading_progress/100)
            );

            const summary_characters = Math.floor(
                full_book_text.length * (summary_progress_percentage/100)
            );

            const new_text = full_book_text.slice(summary_characters, characters_read);

            const context_limit = 30000;

            if(new_text.length <= context_limit){
                return new_text;
            }

            const beginning_text = new_text.slice(0, 10000);
            const recent_text = new_text.slice(-20000);

            return `${beginning_text}\n\n[Later text the reader has reached]\n\n${recent_text}`;
        });
}

function saveReadingProgress(){
    const auth_token = localStorage.getItem("auth_token");

    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);
    request_data.append("folder_id", folder_id);
    request_data.append("epub_id", epub_id);
    request_data.append("epub_current_location", current_location);
    request_data.append("progress_percentage", reading_progress);

    axios.post(BASE_URL + "epubs/save_reading_progress.php", request_data)
        .then(res => {
            if(!res.data.success){
                showMessage(res.data.message);
                return;
            }

        })
        .catch(err => {
            showMessage(err);
            console.error(err);
        })
}

ask_ai_btn.addEventListener("click", () => {
    if (document.querySelector(".ask-ai-overlay")) {
        return;
    }

    const overlay = document.createElement("div");
    const form = document.createElement("form");
    const form_title = document.createElement("h2");
    const form_description = document.createElement("p");
    const loading_state = document.createElement("div");
    const loading_spinner = document.createElement("span");
    const loading_text = document.createElement("span");
    const question_input = document.createElement("textarea");
    const form_actions = document.createElement("div");
    const cancel_button = document.createElement("button");
    const submit_button = document.createElement("input");

    overlay.classList.add("ask-ai-overlay");
    form.classList.add("ask-ai-form");
    form.id = "ask-ai-form";
    form_title.textContent = "Ask LearnLeaf AI";
    form_description.textContent = "Ask a question about what you have read so far.";
    form_description.classList.add("ask-ai-description");

    loading_state.classList.add("ask-ai-loading-state");
    loading_spinner.classList.add("ask-ai-spinner");
    loading_text.textContent = "LearnLeaf AI is thinking...";

    loading_state.append(loading_spinner, loading_text);

    question_input.classList.add("ask-ai-input");
    question_input.id = "ai-question";
    question_input.name = "question";
    question_input.placeholder = "Write your question here...";
    question_input.maxLength = 1000;
    question_input.required = true;
    question_input.rows = 5;

    form_actions.classList.add("ask-ai-actions");

    cancel_button.classList.add("ask-ai-cancel");
    cancel_button.type = "button";
    cancel_button.textContent = "Cancel";

    submit_button.classList.add("ask-ai-submit");
    submit_button.type = "submit";
    submit_button.value = "Ask AI";

    form_actions.append(cancel_button, submit_button);
    form.append(form_title, form_description, loading_state, question_input, form_actions);
    overlay.append(form);
    document.body.append(overlay);
    document.body.classList.add("ask-ai-modal-open");

    question_input.focus();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const auth_token = localStorage.getItem("auth_token");

        if(!Number.isFinite(reading_progress)){
            showMessage("Your reading position is still loading. Please try again in a moment.");
            return;
        }

        setAILoadingState(form, question_input, cancel_button, submit_button, true);

        getBookContext()
            .then((book_context) => {
                const request_data = new URLSearchParams();
                request_data.append("auth_token", auth_token);
                request_data.append("question", question_input.value);
                request_data.append("folder_id", folder_id);
                request_data.append("epub_id", epub_id);
                request_data.append("book_context", book_context);
                request_data.append("reading_progress", reading_progress);

                return axios.post(BASE_URL + "ai/ask_ai.php", request_data);
            })
            .then(res => {
                if(!res.data.success){
                    setAILoadingState(form, question_input, cancel_button, submit_button, false);
                    showMessage(res.data.message);
                    return;
                }

                summary_progress_percentage = reading_progress;
                overlay.remove();
                renderAIResponse(res.data.answer);
            })
            .catch(err => {
                setAILoadingState(form, question_input, cancel_button, submit_button, false);
                showMessage(err);
                console.error(err);
            })
    });

    cancel_button.addEventListener("click", () => {
        overlay.remove();
        document.body.classList.remove("ask-ai-modal-open");
    });
})

function setAILoadingState(form, question_input, cancel_button, submit_button, is_loading){
    if(is_loading){
        form.classList.add("is-loading");
        question_input.readOnly = true;
        cancel_button.disabled = true;
        submit_button.disabled = true;
        submit_button.value = "Thinking...";
    }
    else{
        form.classList.remove("is-loading");
        question_input.readOnly = false;
        cancel_button.disabled = false;
        submit_button.disabled = false;
        submit_button.value = "Ask AI";
    }
}

function renderAIResponse(answer){
    const overlay = document.createElement("div");
    const response_box = document.createElement("section");
    const response_title = document.createElement("h2");
    const response_text = document.createElement("p");
    const response_actions = document.createElement("div");
    const close_button = document.createElement("button");

    overlay.classList.add("ask-ai-overlay");
    response_box.classList.add("ask-ai-form");
    response_title.textContent = "LearnLeaf AI";
    response_text.classList.add("ask-ai-response");
    response_text.textContent = answer;

    response_actions.classList.add("ask-ai-actions");
    close_button.classList.add("ask-ai-submit");
    close_button.type = "button";
    close_button.textContent = "Close";

    response_actions.append(close_button);
    response_box.append(response_title, response_text, response_actions);
    overlay.append(response_box);
    document.body.append(overlay);

    close_button.addEventListener("click", () => {
        overlay.remove();
        document.body.classList.remove("ask-ai-modal-open");
    });
}

getEpubPath();
