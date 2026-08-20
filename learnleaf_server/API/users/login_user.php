<?php

    include(__DIR__. "/../../database/connection.php");

    $email = "";
    $password = "";
    $auth_token = bin2hex(random_bytes(32));
    $auth_token_hash = hash("sha256", $auth_token);


    if(isset($_POST["email"])){
        $email = $_POST["email"];
    }
    if(isset($_POST["password"])){
        $password = $_POST["password"];
    }

    if($email == "" OR $password == ""){
        echo json_encode(["success"=> false,"message"=> "Incorrect email or password"]);
        return;
    }

    $sql = "SELECT * FROM users WHERE email = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("s", $email);
    $query->execute();

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if(!$data){
        echo json_encode(["success"=> false,"message"=> "user not found"]);
        return;
    }

    if(!password_verify($password, $data["password_hash"])){
        echo json_encode(["success"=> false,"message"=> "Incorrect email or password"]);
        return;
    }

    $token_sql = "UPDATE users SET auth_token_hash = ? WHERE id = ?";
    $token_query = $mysql->prepare($token_sql);
    $token_query->bind_param("si", $auth_token_hash, $data["id"]);

    if (!$token_query->execute()){
        echo json_encode(["success"=> false,"message"=> "login failed"]);
        return;
    }

    unset($data["password_hash"], $data["auth_token_hash"]);
    echo json_encode(["success"=> true, "auth_token"=> $auth_token,"data"=> $data]);
?>