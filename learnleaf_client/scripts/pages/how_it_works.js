const step_cards = Array.from(document.querySelectorAll(".content-card"));

function updateStepProgress() {
    step_cards.forEach((card, index) => {
        const checkbox = card.querySelector(".step-checkbox");

        let is_available;

        if (index === 0) {
            is_available = true;
        } else {
            const previous_card = step_cards[index - 1];
            const previous_checkbox = previous_card.querySelector(".step-checkbox");

            is_available = previous_checkbox.checked;
        }

        card.classList.toggle("is-active", is_available);
        card.classList.toggle("is-complete", checkbox.checked);
        checkbox.disabled = !is_available;

        if (!is_available) {
            checkbox.checked = false;
            card.classList.remove("is-complete");
        }

        const step_progress = [];

        stepCards.forEach((step_card) => {
            const step_checkbox = step_card.querySelector(".step_checkbox");

            step_progress.push(step_progress.checked);
        });

        localStorage.setItem("how_it_works_progress", JSON.stringify(step_progress));
    });
}

step_cards.forEach((card, index) => {
    const checkbox = card.querySelector(".step-checkbox");

    checkbox.addEventListener("change", () => {
        if (!checkbox.checked) {
            step_cards.slice(index + 1).forEach((later_card) => {
                later_card.querySelector(".step-checkbox").checked = false;
            });
        }

        updateStepProgress();
    });
});

function loadStepProgress(){
    const saved_step_progress = localStorage.getItem("how_it_works_progress");

    if(!saved_step_progress){
        return;
    }

    const step_progress = JSON.parse(saved_step_progress);

    stepCards.forEach((step_card, index) => {
        const step_checkbox = step_card.querySelector(".step-checkbox");

        step_checkbox.checked = step_progress[index];
    })
}

loadStepProgress();
updateStepProgress();
