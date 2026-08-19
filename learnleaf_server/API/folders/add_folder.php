<?php

    include(__DIR__. "/../../database/connection.php");

    $user_id = -1;
    $name = "";
    $description = "";

    if (isset($_POST["user_id"])) {
        $user_id = $_POST["user_id"];
    }
    if (isset($_POST["name"])) {
        $name = $_POST["name"];
    }
    if (isset($_POST["description"])) {
        $description = $_POST["description"];
    }

    if ($user_id < 0 OR $name == "" OR $description == "") {
        echo json_encode(["success"=> false,"message"=> "Missing information or not logged in"]);
        return;
    }

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