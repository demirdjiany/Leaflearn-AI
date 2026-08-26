-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 26, 2026 at 03:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learnleaf`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_book_summaries`
--

CREATE TABLE `ai_book_summaries` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `summary` text NOT NULL,
  `summary_progress_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_book_summaries`
--

INSERT INTO `ai_book_summaries` (`id`, `book_id`, `summary`, `summary_progress_percentage`, `updated_at`) VALUES
(5, 7, 'Percy Jackson, a 12-year-old boy with dyslexia and ADD, attends Yancy Academy for troubled kids. During a school field trip to the Metropolitan Museum of Art, his math teacher, Mrs. Dodds, transforms into a monster and Percy accidentally vaporizes her. Later, while traveling with his mother and his best friend Grover, they are attacked by the Minotaur. Percy\'s mother vanishes in a flash of light, but Percy manages to break off one of the Minotaur\'s horns and defeat it.\n\nPercy drags an injured Grover to safety at Camp Half-Blood. Upon waking from his injuries, Percy discovers that Grover is actually a satyr, his Latin teacher Mr. Brunner is Chiron, and the Greek gods and monsters of ancient myth are real and active in the modern world. At the camp house, Percy meets the camp director Mr. D, camper Annabeth Chase, and learns he is in a sanctuary for half-bloods.', 18.00, '2026-08-26 16:09:26');

-- --------------------------------------------------------

--
-- Table structure for table `ai_conversations`
--

CREATE TABLE `ai_conversations` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `request_type` enum('question','summary','reading_brief') NOT NULL DEFAULT 'question',
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `progress_at_question` decimal(5,2) NOT NULL,
  `epub_location_at_question` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `folder_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `epub_file_path` varchar(255) NOT NULL,
  `epub_current_location` text DEFAULT NULL,
  `progress_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_read_at` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `folder_id`, `title`, `original_filename`, `epub_file_path`, `epub_current_location`, `progress_percentage`, `created_at`, `last_read_at`) VALUES
(7, 8, 'asfd', 'The Lightning Thief -- Rick Riordan -- 2010 --  Anna’s Archive.epub', 'uploads/epubs/fc4c60c334231517efcffc4e8c496da0.epub', 'epubcfi(/6/16[part6]!/4/4/344/1:366)', 19.00, '2026-08-26 16:08:05', '2026-08-26 16:09:36');

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE `folders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `folders`
--

INSERT INTO `folders` (`id`, `user_id`, `name`, `description`, `created_at`) VALUES
(8, 2, 'asd', '', '2026-08-26 16:07:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `auth_token_hash` varchar(255) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `auth_token_hash`, `username`, `full_name`, `email`, `password_hash`, `created_at`) VALUES
(2, NULL, 'testing username', 'testing full name', 'test@gmail.com', '$2y$10$Xxmaatp2mlhl2eKeELwcMOD.4gMCrjHTxYmdEHDOujsq.xop3Cg9G', '2026-08-20 10:55:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_book_summaries`
--
ALTER TABLE `ai_book_summaries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_book_summary` (`book_id`);

--
-- Indexes for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `foreign_ai_conversation_book` (`book_id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `foreign_books_folder` (`folder_id`);

--
-- Indexes for table `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_folder_name` (`user_id`,`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_users_username` (`username`),
  ADD UNIQUE KEY `unique_users_email` (`email`),
  ADD UNIQUE KEY `unique_users_auth_token_hash` (`auth_token_hash`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_book_summaries`
--
ALTER TABLE `ai_book_summaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_book_summaries`
--
ALTER TABLE `ai_book_summaries`
  ADD CONSTRAINT `fk_ai_book_summaries_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD CONSTRAINT `ai_conversations_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`folder_id`) REFERENCES `folders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `folders`
--
ALTER TABLE `folders`
  ADD CONSTRAINT `folders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
