<?php

    include(__DIR__. "/../../database/connection.php");
    include(__DIR__. "/../helpers/authenticate_user.php");

    $gemini_api_key = getenv("GEMINI_API_KEY");

    if(!$gemini_api_key){
        echo json_encode(["success"=> false,"message"=> "Gemini API key was not found"]);
        return;
    }

    // validating the user;
    $user_id = authenticate_user($mysql);

    if($user_id === null){
        echo json_encode(["success"=> false,"message"=> "make sure you are logged in"]);
        return;
    }

    // validating the sent information
    $folder_id = -1;
    $epub_id = -1;
    $book_context = "";

    if (isset($_POST["folder_id"])){
        $folder_id = intval($_POST["folder_id"]);
    }
    if (isset($_POST["epub_id"])){
        $epub_id = (int) $_POST["epub_id"];
    }
    if (isset($_POST["book_context"])){
        $book_context = trim($_POST["book_context"]);
    }

    if ($folder_id == -1 OR $epub_id == -1 OR $book_context == ""){
        echo json_encode(["success"=> false,"message"=> "please make sure to have an epub open with progression"]);
        return;
    }

    // makes sure the context is less than 30000 characters
    $context_limit = 30000;

    if(mb_strlen($book_context) > $context_limit){
        $book_context = mb_substr($book_context, 0, $context_limit);
    }

    // checking if the epub belongs to the folder and in proxy the user
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

    // validating the question to be sent
    $question = "";

    if (isset($_POST["question"])) {
        $question = trim($_POST["question"]);
    }

    if ($question == "") {
        echo json_encode(["success"=> false,"message"=> "please enter a question"]);
        return;
    }

    if (strlen($question) > 1000) {
        echo json_encode(["success" => false, "message" => "Please keep your question under 1,000 characters."]);
        return;
    }

    // the prompt and context for Gemini
    $prompt = "You are LearnLeaf's reading assistant. 
            Answer only using the book context below. 
            If the answer is not in the context, say that the reader has not reached that information yet.
            
            Book context: $book_context;
            Reader question: $question";

    // request to the AI
    $request_data = [
        "contents"=> [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ],
        "generationConfig"=> [
            "maxOutputTokens" => 1000,
            "temperature" => 0.3,
            "thinkingConfig" => [
                "thinkingLevel" => "low"
            ]
        ]
    ];

    // setting up the client url
    $curl = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent");

    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "x-goog-api-key: " . $gemini_api_key
    ]);
    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($request_data));

    // gets the response and echos it on success
    $response = curl_exec($curl);
    $status_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($curl);

    if($response === false){
        echo json_encode(["success"=> false,"message"=> $curl_error]);
        return;
    }

    $response_data = json_decode($response, true);

    if ($status_code >= 400){
        echo json_encode(["success"=> false,"message"=> "Gemini request failed", "status_code" => $status_code,"data" => $response_data]);
        return;
    }
    if (!isset($response_data["candidates"]["0"]["content"]["parts"][0]["text"])){
        echo json_encode(["success"=> false,"message"=> "Gemini did not return an answer"]);
        return;
    }

    $answer = $response_data["candidates"]["0"]["content"]["parts"][0]["text"];

    echo json_encode(["success"=> true,"answer"=> $answer]);
?>