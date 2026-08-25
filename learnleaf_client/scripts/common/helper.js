function showMessage(message){
    const previous_message = document.querySelector(".site-message");

    if(previous_message){
        previous_message.remove();
    }

    const message_box = document.createElement("p");
    message_box.classList.add("site-message");
    message_box.textContent = message;

    document.body.append(message_box);

    setTimeout(function(){
        message_box.classList.add("is-hiding");
    }, 3500);

    setTimeout(function(){
        message_box.remove();
    }, 3800);
}

let active_loading_requests = 0;
let loader_removal_timeout;

function showPageLoading(){
    active_loading_requests++;
    clearTimeout(loader_removal_timeout);

    const loading_overlay = document.querySelector(".page-loading-overlay");

    if(loading_overlay){
        loading_overlay.classList.remove("is-hiding");
        return;
    }

    const overlay = document.createElement("div");
    const loading_box = document.createElement("div");
    const spinner = document.createElement("span");
    const loading_text = document.createElement("p");

    overlay.classList.add("page-loading-overlay");
    loading_box.classList.add("page-loading-box");
    spinner.classList.add("page-loading-spinner");
    loading_text.textContent = "Loading LearnLeaf...";

    loading_box.append(spinner, loading_text);
    overlay.append(loading_box);
    document.body.append(overlay);
}

function hidePageLoading(){
    if(active_loading_requests > 0){
        active_loading_requests--;
    }

    if(active_loading_requests > 0){
        return;
    }

    const loading_overlay = document.querySelector(".page-loading-overlay");

    if(!loading_overlay){
        return;
    }

    loading_overlay.classList.add("is-hiding");

    loader_removal_timeout = setTimeout(function(){
        if(active_loading_requests == 0){
            loading_overlay.remove();
        }
    }, 200);
}
