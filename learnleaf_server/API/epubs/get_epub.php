<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    // validating the user
    $user_id = authenticate_user($mysql);

    if($user_id === null){
        echo json_encode(["success"=> false,"message"=> "You need to be logged in to read your epub"]);
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

    //getting the chosen epub
    if(isset($_POST["epub_id"])){
        $epub_id = $_POST["epub_id"];
    }
    else{
        $epub_id = -1;
        echo json_encode(["success"=> false,"message"=> "epub not found"]);
        return;
    }

    $sql = "SELECT books.*, COALESCE(ai_book_summaries.summary_progress_percentage, 0) AS summary_progress_percentage FROM books LEFT JOIN ai_book_summaries ON books.id = ai_book_summaries.book_id WHERE books.id = ? AND books.folder_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $epub_id, $folder_id);
    $query->execute();

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if(!$data){
        echo json_encode(["success"=> false,"message"=> "failed to access the epub"]);
        return;
    }

    echo json_encode(["success"=> true,"data"=> $data]);
?>