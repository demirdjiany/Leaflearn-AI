<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    // validates the users authentication
    $user_id = authenticate_user($mysql);

    if($user_id === null){
        echo json_encode(["success"=> false, "message"=> "user not found"]);
        return;
    }

    // getting the password change requirements
    $email = "";
    $password = "";
    $confirm_password = "";

    if(isset($_POST["email"])){
        $email = $_POST["email"];
    }
    if(isset($_POST["password"])){
        $password = $_POST["password"];
    }
    if(isset($_POST["confirm_password"])){
        $confirm_password = $_POST["confirm_password"];
    }

    if($email == "" OR $password == "" OR $confirm_password == ""){
        echo json_encode(["success"=> false,"message"=> "please make sure to enter all required credentials"]);
        return;
    }

    // Verifying password and confirm password match
    if($confirm_password !== $password ){
        echo json_encode(["success"=> false,"message"=> "make sure to input the same password in both fields"]);
        return;
    }

    //Update the password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $sql = "UPDATE users SET password_hash = ? WHERE id = ? AND email = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("sis",$password_hash ,$user_id, $email);

    if(!$query->execute()){
        echo json_encode(["success"=> false, "message"=> "password change failed"]);
        return;
    }

    echo json_encode(["success"=> true,"message"=> "password change successful"]);
?>