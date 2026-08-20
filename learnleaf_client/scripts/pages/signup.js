const form = document.getElementById("signup-form");
const username = document.getElementById("username");
const full_name = document.getElementById("full-name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirm_password = document.getElementById("confirm-password");
const privacy_accepted = document.getElementById("privacy-accept");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const request_data = new URLSearchParams();

    request_data.append("username", username.value);
    request_data.append("full_name", full_name.value);
    request_data.append("email", email.value);
    request_data.append("password", password.value);
    request_data.append("confirm_password", confirm_password.value);

    if (privacy_accepted.checked){
        request_data.append("privacy_accepted", "1");
    }

    axios.post(BASE_URL + "users/add_user.php", request_data)
        .then(res => {
            alert(res.data.message);
            if (res.data.success){
                window.location.href  = "login.html";
            }
        })
        .catch(err => {
            alert("sign up has failed");
            console.error(err)});
        })