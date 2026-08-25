const form = document.getElementById("login-form");
const email = document.getElementById("login-email");
const password = document.getElementById("login-password");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const request_data = new URLSearchParams();

    request_data.append("email", email.value);
    request_data.append("password", password.value);

    axios.post(BASE_URL + "users/login_user.php", request_data)
        .then(res => {
            if (!res.data.success){
                showMessage(res.data.message);
                return;
            }
            showMessage(res.data.message);
            localStorage.setItem("auth_token", res.data.auth_token);
            window.location.href = "../library/my_folders.html";
        })
        .catch(err => {
            showMessage("Failed to log in.")
            console.error(err)}
        );
})
