<?php

    include(__DIR__. "/../../database/connection.php");

    $username = "";
    $full_name = "";
    $email = "";
    $password = "";
    $confirm_password = "";
    $privacy_accepted = false;

    if(isset($_POST["username"])){
        $username = $_POST["username"];
    }
    if(isset($_POST["full_name"])){
        $full_name = $_POST["full_name"];
    }
    if(isset($_POST["email"])){
        $email = $_POST["email"];
    }
    if(isset($_POST["password"])){
        $password = $_POST["password"];
    }
    if(isset($_POST["confirm_password"])){
        $confirm_password = $_POST["confirm_password"];
    }
    if(isset($_POST["privacy_accepted"])){
        $privacy_accepted = $_POST["privacy_accepted"];
    }

    if($username == "" OR $full_name == "" OR $email == "" OR $password == "" OR $confirm_password == ""){
        echo json_encode(["success"=> false,"message"=> "a credential is missing"]);
        return;
    }

    if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
        echo json_encode(["success"=> false,"message"=> "email is not valid"]);
        return;
    }

    if($password != $confirm_password){
        echo json_encode(["success"=> false,"message"=> "The passwords do not match"]);
        return;
    }

    if(!$privacy_accepted){
        echo json_encode(["success"=> false, "message"=> "You must accept the privacy policy"]);
        return;
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, full_name, email, password_hash) VALUES (?, ?, ?, ?)";
    $query = $mysql->prepare($sql);
    $query->bind_param("ssss", $username, $full_name, $email, $password_hash);

    if($query->execute()){
        echo json_encode(["success"=> true,"message"=> "Account has been successfully created"]);
    }
    else{
        echo json_encode(["success"=> false,"message"=> "The account could not be created"]);
    }

?>