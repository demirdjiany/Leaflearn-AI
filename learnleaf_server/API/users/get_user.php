<?php

    include(__DIR__. "/../../database/connection.php");

    $email = "";
    $password = "";

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

    unset($data["password_hash"]);
    echo json_encode(["success"=> true,"data"=> $data]);

?>