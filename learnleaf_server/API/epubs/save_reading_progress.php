<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__."/../helpers/authenticate_user.php");

    // validate user
    $user_id = authenticate_user($mysql);

    if($user_id === null){
        echo json_encode(["success"=> false,"message"=> "Please log in before saving progress"]);
        return;
    }

    //getting the parameters
    $folder_id = -1;
    $epub_id = -1;
    $epub_current_location = "";
    $progress_percentage = -1;

    if(isset($_POST["folder_id"])){
        $folder_id = (int) $_POST["folder_id"];
    }
    if(isset($_POST["epub_id"])){
        $epub_id = (int) $_POST["epub_id"];
    }
    if(isset($_POST["epub_current_location"])){
        $epub_current_location = $_POST["epub_current_location"];
    }
    if(isset($_POST["progress_percentage"])){
        $progress_percentage = (float) $_POST["progress_percentage"];
    }

    if($folder_id == -1 OR $epub_id == -1 OR $epub_current_location == "" OR $progress_percentage == -1){
        echo json_encode(array("success"=> false,"message"=> "incorrect folder or epub"));
        return;
    }

    //checking if the epub belongs to this specific folder
    $sql = "SELECT id FROM books WHERE id = ? AND folder_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $epub_id, $folder_id);
    $query->execute();

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if(!$data){
        echo json_encode(["success"=> false,"message"=> "A book like this does not exist in this folder"]);
        return;
    }

    //checking if the folder belongs to the user
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

    // query
    $sql = "UPDATE books SET epub_current_location = ?, progress_percentage = ?, last_read_at = NOW() WHERE id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("sdi", $epub_current_location, $progress_percentage, $epub_id);
    
    if (!$query->execute()){
        echo json_encode(["success"=> false,"message"=> "failed to save latest reading progress"]);
        return;
    }

    echo json_encode(["success"=> true,"message"=> "Reading progress saved"]);
    return;
?>
