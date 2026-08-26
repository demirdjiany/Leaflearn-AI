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
    $reading_progress = -1;

    if (isset($_POST["folder_id"])){
        $folder_id = intval($_POST["folder_id"]);
    }
    if (isset($_POST["epub_id"])){
        $epub_id = (int) $_POST["epub_id"];
    }
    if (isset($_POST["book_context"])){
        $book_context = trim($_POST["book_context"]);
    }
    if(isset($_POST["reading_progress"])){
        $reading_progress = (float) $_POST["reading_progress"];
    }

    if($folder_id == -1 OR $epub_id == -1 OR $reading_progress < 0 OR $reading_progress > 100){
        echo json_encode(["success"=> false,"message"=> "Please make sure to have an EPUB open with progression"]);
        return;
    }

    // makes sure the context is less than 30000 characters
    $context_limit = 30000;

    if(mb_strlen($book_context) > $context_limit){
        $book_context = mb_substr($book_context, 0, $context_limit);
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

    // checking if the folder belongs to the user
    $sql = "SELECT id FROM folders WHERE id = ? AND user_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $folder_id, $user_id);
    $query->execute();

    $result = $query->get_result();
    $data = $result->fetch_assoc();

    if(!$data){
        echo json_encode(["success"=> false,"message"=> "this folder does not belong to the user"]);
        return;
    }

    // getting the AI already saved summary
    $book_summary = "";
    $summary_progress_percentage = 0;

    $sql = "SELECT summary, summary_progress_percentage FROM ai_book_summaries WHERE book_id = ?";

    $query = $mysql->prepare($sql);
    $query->bind_param("i", $epub_id);
    $query->execute();

    $result = $query->get_result();
    $summary_data = $result->fetch_assoc();

    if($summary_data){
        $book_summary = $summary_data["summary"];
        $summary_progress_percentage = $summary_data["summary_progress_percentage"];
    }

    if($book_context == "" AND $book_summary == ""){
        echo json_encode(["success" => false, "message" => "No readable book context is available yet"]);
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
            
            Saved summary, covering up to $summary_progress_percentage%: $book_summary;
            New book content the reader reached after the summary: $book_context;
            Reader question: $question;
            Return a JSON object with exactly these two properties:
            - answer: the answer to the reader's question
            - summary: a concise factual summary of everything in the saved summary and new book context

            The summary must not include information outside the provided context. Keep it under 1,500 characters.";

            

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
            ],
            "responseFormat" => [
                "text" => [
                    "mimeType" => "APPLICATION_JSON",
                    "schema" => [
                        "type" => "object",
                        "properties" => [
                            "answer" => [
                                "type" => "string"
                            ],
                            "summary" => [
                                "type" => "string"
                            ]
                        ],
                        "required" => [
                            "answer",
                            "summary"
                        ]
                    ]
                ]
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

    $gemini_text = $response_data["candidates"]["0"]["content"]["parts"][0]["text"];
    
    $gemini_data = json_decode($gemini_text, true);

    if(!$gemini_data OR !isset($gemini_data["answer"]) OR !isset($gemini_data["summary"])){
        echo json_encode(["success"=> false,"message"=> "Gemini did not return a valid answer or summary"]);
        return;
    }

    $answer = $gemini_data["answer"];
    $updated_summary = $gemini_data["summary"];

    // Saving the AI summary
    $summary_limit = 1500;

    if(mb_strlen($updated_summary) > $summary_limit){
        $updated_summary = mb_substr($updated_summary, 0, $summary_limit);
    }

    $sql = "INSERT INTO ai_book_summaries (book_id, summary, summary_progress_percentage) VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE summary = VALUES(summary), summary_progress_percentage = VALUES(summary_progress_percentage), updated_at = NOW()";
    $query = $mysql->prepare($sql);
    $query->bind_param("isd", $epub_id, $updated_summary, $reading_progress);

    if(!$query->execute()){
        echo json_encode(["success" => false, "message" => "Failed to save the AI summary"]);
        return;
    }

    echo json_encode(["success"=> true,"answer"=> $answer]);
?>
