<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    // validates the users authentication
    $user_id = authenticate_user($mysql);

    if($user_id === null){
        echo json_encode(["success"=> false, "message"=> "user not found"]);
        return;
    }

    // logging out the user
    $sql = "UPDATE users SET auth_token_hash = NULL WHERE id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $user_id);

    if(!$query->execute()){
        echo json_encode(["success"=> false, "message"=> "logout failed"]);
        return;
    }

    echo json_encode(["success"=> true,"message"=> "logout successful"]);
?>