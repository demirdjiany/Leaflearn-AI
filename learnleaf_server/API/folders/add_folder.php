<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__ . "/../helpers/authenticate_user.php");

    $name = "";
    $description = "";
    $user_id = authenticate_user($mysql);

    if ($user_id === null) {
        echo json_encode(["success"=> false,"message"=> "please log in before accessing your folders"]);
        return;
    }

    if (isset($_POST["name"])) {
        $name = $_POST["name"];
    }
    if (isset($_POST["description"])) {
        $description = $_POST["description"];
    }

    if ($name == "") {
        echo json_encode(["success"=> false,"message"=> "Missing folder name"]);
        return;
    }

    $name = trim($name);
    $description = trim($description);

    $sql = "INSERT INTO folders (user_id, name, description) VALUES (?, ?, ?)";
    $query = $mysql->prepare($sql);
    $query->bind_param("iss", $user_id, $name, $description);

    if ($query->execute()) {
        echo json_encode(["success"=> true,"message"=> "folder has been created"]);
    }
    else {
        echo json_encode(["success"=> false,"message"=> "folder was unable to be created"]);
    }
?>