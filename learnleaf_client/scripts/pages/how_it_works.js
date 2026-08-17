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

updateStepProgress();
