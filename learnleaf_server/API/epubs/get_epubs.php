<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    // validating the user
    $user_id = authenticate_user($mysql);

    if($user_id === null){
        echo json_encode(["success"=> false,"message"=> "You need to be logged in to view your files"]);
        return;
    }

    // validating if the folder belongs to the user

    if(isset($_POST["folder_id"])){
        $folder_id = $_POST["folder_id"];
    }
    else{
        $folder_id = -1;
        echo json_encode(["success"=> false,"message"=> "folder doesn't exist"]);
        return;
    }

    $sql = "SELECT id FROM folders WHERE id = ? AND user_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $folder_id, $user_id);
    $query->execute();

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if(!$data){
        echo json_encode(["success"=> false,"message"=> "A folder like this does not exist in your account"]);
        return;
    }

    // Retrieving all epubs in the folder
    $sql = "SELECT * FROM books WHERE folder_id = ? ORDER BY created_at DESC";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $folder_id);
    $query->execute();

    $result = $query->get_result();
    $data = [];

    while($res = $result->fetch_assoc()){
        $data[] = $res;
    }

    echo json_encode(["success" => true, "data" => $data]);
?>
