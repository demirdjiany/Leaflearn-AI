<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    // validates the users authentication
    $user_id = authenticate_user($mysql);

    if($user_id === null){
        echo json_encode(["success"=> false, "message"=> "user not found"]);
        return;
    }

    // getting the profile change requirements
    $username = "";
    $full_name = "";

    if(isset($_POST["username"])){
        $username = trim($_POST["username"]);
    }
    if(isset($_POST["full_name"])){
        $full_name = trim($_POST["full_name"]);
    }

    if($username == "" OR $full_name == ""){
        echo json_encode(["success"=> false,"message"=> "please make sure the fields are not empty"]);
        return;
    }

    //Update the user info
    $sql = "UPDATE users SET username = ?, full_name = ? WHERE id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ssi",$username , $full_name, $user_id);

    if(!$query->execute()){
        echo json_encode(["success"=> false, "message"=> "profile edit failed"]);
        return;
    }

    echo json_encode(["success"=> true,"message"=> "profile has been edited successfully"]);
?>