<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    // validating the user
    $user_id = authenticate_user($mysql);

    if ($user_id === null) {
        echo json_encode(["success" => false, "message" => "Please log in before deleting a book"]);
        return;
    }

    // getting the required values from the js
    $folder_id = -1;
    $epub_id = -1;
    
    if(isset($_POST["folder_id"])){
        $folder_id = $_POST["folder_id"];
    }
    if(isset($_POST["epub_id"])){
        $epub_id = $_POST["epub_id"];
    }

    if($epub_id == -1 OR $folder_id == -1){
        echo json_encode(["success"=> false, "message"=> "make sure you are on the specific folder you want the delete the epub from"]);
        return;
    }

    // checking if the epub belongs to the folder
    $sql = "SELECT * FROM books WHERE id = ? AND folder_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $epub_id, $folder_id);
    $query->execute();

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if(!$data){
        echo json_encode(["success"=> false,"message"=> "failed to access the epub"]);
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
    $sql = "SELECT epub_file_path FROM books WHERE id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $epub_id);
    $query->execute();

    $result = $query->get_result();
    $epub_file_data = $result->fetch_assoc();

    if(!$epub_file_data){
        echo json_encode(["success"=> false,"message"=> "epub file path could not be found"]);
        return;
    }

    $epub_file_path = $epub_file_data["epub_file_path"];

    //Deleting the actual files stored in the computer
    $upload_directory = __DIR__ . "/../../uploads/epubs/";

    $stored_filename = basename($epub_file_path);
    $absolute_file_path = $upload_directory . $stored_filename;

    if (is_file($absolute_file_path)) {
        if (!unlink($absolute_file_path)) {
            echo json_encode(["success"=> false,"message"=> "could not remove epub file"]);
            return;
        }
    }

    //Delete query
    $sql = "DELETE FROM books WHERE id = ? AND folder_id = ? LIMIT 1";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $epub_id, $folder_id);

    if(!$query->execute()){
        echo json_encode(["success"=> false,"message"=> "epub could not be deleted"]);
        return;
    }

    echo json_encode(["success"=> true,"message"=> "epub successfully deleted"]);

?>
