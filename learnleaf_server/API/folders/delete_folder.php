<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    // validating the user
    $user_id = authenticate_user($mysql);

    if ($user_id === null) {
        echo json_encode(["success" => false, "message" => "Please log in before deleting a folder"]);
        return;
    }

    // getting the required values from the js
    if(isset($_POST["folder_id"])){
        $folder_id = (int) $_POST["folder_id"];
    }
    else{
        $folder_id = -1;
        echo json_encode(["success"=> false, "message"=> "folder not found"]);
        return;
    }

    // validating if the folder belongs to the user
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

    // Get the EPUB file paths before deleting the database records
    $sql = "SELECT epub_file_path FROM books WHERE folder_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $folder_id);
    $query->execute();

    $result = $query->get_result();
    $epub_file_paths = [];

    while ($book = $result->fetch_assoc()) {
        $epub_file_paths[] = $book["epub_file_path"];
    }

    //Deleting the actual files stored in the computer
    $upload_directory = __DIR__ . "/../../uploads/epubs/";

    foreach ($epub_file_paths as $epub_file_path) {
        $stored_filename = basename($epub_file_path);
        $absolute_file_path = $upload_directory . $stored_filename;

        if (is_file($absolute_file_path)) {
            if (!unlink($absolute_file_path)) {
                echo json_encode(["success"=> false,"message"=> "could not remove epub file"]);
                return;
            }
        }
    }

    //Delete epubs in the folder
    $sql = "DELETE FROM books WHERE folder_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $folder_id);
    
    if(!$query->execute()){
        echo json_encode(["success"=> false,"message"=> "failed to delete the books inside the folder"]);
        return;
    };

    //Delete folder query
    $sql = "DELETE FROM folders WHERE id = ? AND user_id = ? LIMIT 1";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $folder_id, $user_id);

    if(!$query->execute()){
        echo json_encode(["success"=> false,"message"=> "folder could not be deleted"]);
        return;
    }

    echo json_encode(["success"=> true,"message"=> "folder successfully deleted"]);

?>