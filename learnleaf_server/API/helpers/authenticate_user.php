<?php

    function authenticate_user(mysqli $mysql){
        if(isset($_POST["auth_token"])){
            $auth_token = $_POST["auth_token"];
        }
        else{
            $auth_token = 0;
            return null;
        }

        $auth_token_hash = hash("sha256", $auth_token);

        $sql = "SELECT id FROM users WHERE auth_token_hash = ?";
        $query = $mysql->prepare($sql);
        $query->bind_param("s", $auth_token_hash);
        $query->execute();

        $result = $query->get_result();
        $data = $result->fetch_assoc();

        if (!$data) {
            return null;
        }

        return (int) $data["id"];
    }

?>