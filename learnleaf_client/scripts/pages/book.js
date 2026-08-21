const url_parameters = new URLSearchParams(window.location.search);
const folder_id = url_parameters.get("folder_id");
const epub_id = url_parameters.get("epub_id");
const book_title = document.getElementById("book-title");
const page_counter = document.getElementById("page-counter");
const render_area = document.getElementById("epub-render");

let rendition;

function getEpubPath(){
    const auth_token = localStorage.getItem("auth_token");

    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);
    request_data.append("folder_id", folder_id);
    request_data.append("epub_id", epub_id);

    axios.post(BASE_URL + "epubs/get_epub.php", request_data)
        .then(res => {
            if(!res.data.success){
                alert(res.data.message);
                return;
            }
            renderEpub(res.data.data);
        })
        .catch(err => {
            alert(err);
            console.error(err);
        })

}

function renderEpub(data){
    const path = `../../../learnleaf_server/${data.epub_file_path}`;
    const title = data.title;
    
    book_title.textContent = title;

    const book = ePub(path);
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
        const reading_progress = Math.round(location.start.percentage * 100);

        page_counter.textContent = `Reading progress: ${reading_progress}%`;
    });

    book.ready.then(() => {
        return book.locations.generate(1024);
    });

    rendition.display();
}

getEpubPath();
