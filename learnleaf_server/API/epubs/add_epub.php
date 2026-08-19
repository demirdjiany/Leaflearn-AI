<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    //checks if the user is logged in

    $user_id = authenticate_user($mysql);

    if($user_id === null){
        echo json_encode(["success"=> false,"message"=> "please log in before uploading a file"]);
        return;
    }

    if(isset($_POST["folder_id"])) {
        $folder_id = $_POST["folder_id"];
    }
    else {
        $folder_id = -1;
        echo json_encode(["success"=> false, "message"=> "folder not found"]);
        return;
    }

    // checks if the folder belongs to the current user
    $sql = "SELECT id FROM folders WHERE id = ? AND user_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $folder_id, $user_id);
    $query->execute();

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if (!$data){
        echo json_encode(["success"=> false,"message"=> "A folder like this does not exist in your account"]);
        return;
    }

    // initializes the variables for the epub
    $title = "";
    $epub_file = "";

    if (isset($_POST["title"])) {
        $title = $_POST["title"];
        $title = trim($title);
    }

    // uploads the file to php
    if (isset($_FILES["epub_file"])) {
        $epub_file = $_FILES["epub_file"];
    }

    if ($title == "" OR $epub_file == "") {
        echo json_encode(["success"=> false,"message"=> "file could not be uploaded"]);
        return;
    }

    if ($epub_file["error"] !== UPLOAD_ERR_OK) {
        echo json_encode(["success" => false, "message" => "The EPUB could not be uploaded"]);
        return;
    }

    // storing the original file name and a randomly generated file name for the path 
    $original_filename = basename($epub_file["name"]);
    $stored_filename = bin2hex(random_bytes(16)) . ".epub";

    $epub_file_path = "uploads/epubs/" . $stored_filename;

    $sql = "INSERT INTO books (folder_id, title, original_filename, epub_file_path) VALUES (?, ?, ?, ?)";
    $query = $mysql->prepare($sql);
    $query->bind_param("isss", $folder_id, $title, $original_filename, $epub_file_path);

    // checks if the uploaded file is epub
    $file_extension = strtolower(pathinfo($original_filename, PATHINFO_EXTENSION));

    if ($file_extension !== "epub"){
        echo json_encode(["success"=> false,"message"=> "only EPUB files are allowed"]);
        return;
    }

    $upload_directory = __DIR__ . "/../../uploads/epubs/";
    $upload_destination = $upload_directory . $stored_filename;

    $epub_file_path = "uploads/epubs/" . $stored_filename;

    if (!move_uploaded_file($epub_file["tmp_name"], $upload_destination)){
        echo json_encode(["success"=> false,"message"=> "EPUB could not be saved"]);
        return;
    }

    if ($query->execute()){
        echo json_encode(["success"=> true,"message"=> "Upload successful"]);
        return;
    }
    else{
        echo json_encode(["success"=> false,"message"=> "Upload has failed"]);
        return;
    }

?>