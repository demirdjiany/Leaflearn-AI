<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    // authenticating the user
    $user_id = authenticate_user($mysql);

    if($user_id === null) {
        echo json_encode(["success"=> false,"message"=> "please login before viewing this page"]);
        return;
    }

    // getting the correct user from the database
    $sql = "SELECT id, username, full_name, email, created_at FROM users WHERE id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $user_id);
    
    if (!$query->execute()) {
        echo json_encode(["success"=> false,"message"=> "unable to retrieve user"]);
        return;
    }

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if(!$data) {
        echo json_encode(["success"=> false,"message"=> "user not found"]);
        return;
    }

    echo json_encode(["success"=> true,"message"=> "user found","data"=> $data]);
?>