<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__."/../helpers/authenticate_user.php");

    $user_id = authenticate_user($mysql);

    if ($user_id === null) {
        echo json_encode(["success"=> false,"message"=> "please log in before accessing your folders"]);
        return;
    }

    $sql = "SELECT * FROM folders WHERE user_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $user_id);
    $query->execute();

    $result = $query->get_result();
    $data = [];
    
    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }

    echo json_encode(["success"=> true,"data"=> $data]);
?>