const name = document.getElementById("profile-name");
const username = document.getElementById("profile-username");
const member_since = document.getElementById("member-since");
const account_username = document.getElementById("account-username");
const account_name = document.getElementById("account-name");
const account_email = document.getElementById("account-email");

const logout_btn = document.getElementById("logout-button");

function getCurrentUser(){
    const auth_token = localStorage.getItem("auth_token");

    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);

    if (!auth_token) {
        window.location.href = "login.html";
        return;
    }

    axios.post(BASE_URL + "users/get_current_user.php", request_data)
        .then(res => {
            if (!res.data.success){
                localStorage.removeItem("auth_token");
                alert(res.data.message);
                window.location.href = "login.html";
                return;
            }
            renderProfileSummary(res.data.data.full_name, res.data.data.username, res.data.data.created_at);
            renderAccountInformation(res.data.data.full_name, res.data.data.username, res.data.data.email);
        })
        .catch(err => {
            alert("error");
            console.error(err);
        });
}

logout_btn.addEventListener("click", () => {
    const auth_token = localStorage.getItem("auth_token");
    
    const request_data = new URLSearchParams();
    request_data.append("auth_token", auth_token);

    axios.post(BASE_URL + "users/logout_user.php", request_data)
        .then(res => {
            if (!res.data.success){
                alert(res.data.message);
                return;
            }

            localStorage.removeItem("auth_token");
            window.location.href = "login.html";
            alert(res.data.message);
        })
        .catch(err => {
            alert("error");
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

getCurrentUser();