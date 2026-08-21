<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__."/../helpers/authenticate_user.php");


    //validates the user
    $user_id = authenticate_user($mysql);

    if ($user_id === null) {
        echo json_encode(["success"=> false,"message"=> "please log in before accessing your folders"]);
        return;
    }

    //gets the folder id.
    if (isset($_POST["id"])) {
        $id = $_POST["id"];
    }
    else{
        $id = -1;
        return;
    }

    //query to get the folder
    $sql = "SELECT id, name, description FROM folders WHERE user_id = ? AND id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $user_id, $id);
    $query->execute();

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if(!$data){
        echo json_encode(["success"=> false,"message"=> "failed to find the folder"]);
        return;
    }

    echo json_encode(["success"=> true, "data"=> $data]);

?>