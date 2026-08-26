this project is the final project of the seai-01-bootcamp done by maaloumatia academy, with Charbel Daoud as the instructor.

The goal of this project is to develop a full stack project, the usage of AI is allowed as one of the goals of the bootcamp
was to teach us proper use of AI without having it overwrite our thinking.

---------

This Website is a epub reader with a built in AI (Gemini free API cuz I'm poor) that will help answer question the user has up to the point he/she has read.

You will be able to create folders for each topic you want to tackle, and upload epubs in those folders.

1. In order to use it, you will need to have xampp installed, run apache and mysql.
2. add the folder named seai-01-bootcamp-finalProject into xampp htdocs.
3. Open phpmyadmin
4. create a database called learnleaf and import the learnleaf.sql inside of database_used.
5. then you will need to add your Gemini API key inside of your user environment variable.
    -launch edit environment variables for your account.
    -add a new one for the user.
    -call it GEMINI_API_KEY and paste the API key there and save. (don't forget to restart Apache)
6. Open: http://localhost/seai-01-bootcamp-finalProject/learnleaf_client/
    if the folder is not named seai-01-bootcamp-finalProject you will have to change it in the url as well.

Documentation of what AI, in my case Codex did in this project:
- All CSS was written by Codex.
- HTML manipulation to work with the CSS.
- Proposed the auth_token and helped implement the logic (for the first few php files).
- Guided through the process of uploading a file with php.
- JS dynamic rendering for the forms (html elements creation done by me for the first few times), the class and ids needed filled in by Codex.
- At the start I asked if my code was functioning or if there was a bug, but during the later half I took to debugging myself.
- Help with rendering the epub in the select area.
- Guided me on how to connect the Gemini API to my project.
- Implemented the getBookContext() in the book.js which sends the context needed to the Gemini.

