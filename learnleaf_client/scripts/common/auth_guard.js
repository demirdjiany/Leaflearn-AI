const auth_token = localStorage.getItem("auth_token");

if(!auth_token){
    window.location.replace("../account/login.html");
}