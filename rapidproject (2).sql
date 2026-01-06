-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 06, 2026 at 10:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rapidproject`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `gender` enum('male','female') DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`, `phone`, `cnic`, `status`, `gender`, `isDeleted`, `created_at`) VALUES
(1, 'super super', 'sameer@admin.com', '$2b$10$R/XQqbMtaHK3.LRPQXvGQun9ShA8n7/XDBPlDrW28UrkV0tmrxjbu', '03463982797', '12345-6789012-3', 'active', 'male', 0, '2025-11-19 08:04:42');

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `teacherId` int(11) DEFAULT NULL,
  `credit_hours` int(11) DEFAULT 3,
  `isDeleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `name`, `teacherId`, `credit_hours`, `isDeleted`, `created_at`) VALUES
(1, 'Hazard Prevention Management', 1, 3, 0, '2025-11-19 12:47:44'),
(2, 'Big Data', 8, 3, 0, '2025-11-20 12:17:57'),
(3, 'Blockchain', 12, 2, 0, '2025-11-20 12:18:16'),
(4, 'Numerical Analysis', 8, 2, 1, '2025-11-24 09:08:04'),
(5, 'Web Development Basics 2', 20, 3, 0, '2025-11-24 09:46:07'),
(6, 'Linear Algebra', 11, 3, 0, '2025-11-25 09:54:18'),
(7, 'Programming 101', 11, 3, 0, '2025-11-27 10:29:00'),
(9, 'Fluid Dynamics', 12, 3, 0, '2025-11-27 07:54:46'),
(11, 'Calculus 1', 17, 3, 1, '2025-11-28 00:58:14'),
(15, 'Calculus 2', 18, 3, 0, '2025-12-03 06:59:20'),
(16, 'Calculus 3', 18, 3, 0, '2025-12-03 06:59:36'),
(17, 'OOP', 27, 3, 0, '2025-12-03 07:01:07'),
(18, 'Algorithm Design', 18, 2, 0, '2025-12-03 07:01:55'),
(25, 'Networking', 24, 3, 0, '2025-12-26 07:11:55'),
(26, 'Data Science', 25, 3, 0, '2025-12-26 07:12:13'),
(27, 'Differential Equations', 1, 2, 0, '2025-12-31 04:47:24');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollment`
--

INSERT INTO `enrollment` (`id`, `studentId`, `courseId`, `created_at`) VALUES
(38, 17, 6, '2025-12-10 06:57:53'),
(39, 17, 9, '2025-12-10 06:57:53'),
(40, 17, 3, '2025-12-10 06:57:53'),
(41, 17, 17, '2025-12-10 06:57:53'),
(42, 18, 5, '2025-12-11 02:45:11'),
(43, 18, 6, '2025-12-11 02:45:11'),
(44, 18, 9, '2025-12-11 02:45:11'),
(56, 1, 1, '2025-12-16 00:51:29'),
(63, 2, 1, '2025-12-18 00:30:23'),
(64, 2, 2, '2025-12-18 00:30:23'),
(74, 1, 3, '2025-12-23 02:57:09'),
(75, 1, 5, '2025-12-23 06:09:19'),
(76, 22, 1, '2025-12-26 07:10:18'),
(77, 22, 2, '2025-12-26 07:10:18'),
(78, 22, 7, '2025-12-26 07:10:18'),
(79, 23, 26, '2025-12-26 07:12:50'),
(80, 23, 25, '2025-12-26 07:12:50'),
(81, 23, 6, '2025-12-26 07:12:50'),
(82, 23, 3, '2025-12-26 07:12:50'),
(83, 24, 2, '2025-12-26 07:13:45'),
(84, 24, 5, '2025-12-26 07:13:45'),
(85, 24, 7, '2025-12-26 07:13:45'),
(86, 24, 3, '2025-12-26 07:13:45'),
(92, 25, 3, '2025-12-26 07:16:42'),
(93, 25, 25, '2025-12-26 07:16:42'),
(94, 25, 9, '2025-12-26 07:16:42'),
(95, 25, 26, '2025-12-26 07:16:42'),
(96, 25, 6, '2025-12-26 07:16:42'),
(97, 26, 15, '2025-12-26 07:17:17'),
(98, 26, 25, '2025-12-26 07:17:17'),
(99, 26, 17, '2025-12-26 07:17:17'),
(100, 26, 1, '2025-12-26 07:17:17'),
(101, 26, 3, '2025-12-26 07:17:17'),
(102, 28, 2, '2025-12-26 07:17:50'),
(103, 28, 6, '2025-12-26 07:17:50'),
(104, 28, 25, '2025-12-26 07:17:50'),
(105, 28, 26, '2025-12-26 07:17:50'),
(106, 28, 18, '2025-12-26 07:17:50'),
(107, 1, 15, '2025-12-29 02:28:16'),
(108, 1, 7, '2025-12-29 02:28:16'),
(109, 29, 1, '2025-12-31 02:12:31'),
(110, 29, 2, '2025-12-31 02:12:31'),
(112, 29, 5, '2025-12-31 02:14:35'),
(113, 29, 6, '2025-12-31 02:14:35'),
(114, 29, 7, '2025-12-31 02:14:35'),
(115, 21, 27, '2025-12-31 04:53:30'),
(116, 21, 6, '2025-12-31 04:53:30'),
(117, 21, 3, '2025-12-31 04:53:30'),
(118, 21, 7, '2025-12-31 04:53:30');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `gender` enum('male','female') DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `name`, `email`, `password`, `phone`, `cnic`, `status`, `gender`, `isDeleted`, `created_at`) VALUES
(1, 'Alice Johnson', 'alice@example.com', '$2b$10$2hR0ZzCZT3GZ/pxa20Wlo.QQSvQeJQzVi/fLI/nxkjq15sACBLvDq', '03332856355', '20001-1111111-1', 'active', 'female', 0, '2025-11-19 10:43:49'),
(2, 'mick nick', 'mn@example.com', '$2b$10$wyJ0a.h9qvu2EcvG6WFmk.sN75oPJFztwbzX/6oM6KkORzZqimeg6', '03463987290', '21111-1111111-4', 'active', 'male', 0, '2025-11-19 10:55:44'),
(6, 'Alice John', 'aj@example.com', '$2b$10$aJzwF2/Ixqb2UTaPzhGR..Zh47YgeuXPGa.8C2RA3iKRxVH3sty.G', '03463987297', '20001-1111111-3', 'inactive', 'male', 1, '2025-11-20 07:34:29'),
(11, 'new student', 'new.stu@email.com', '$2b$10$yG9IlEDd5xt5Ze5rlr.jHe2t.fvlb1pqcUew0IhZdJQ.PuvqNH4fq', '03463987297', '30001-1111111-1', 'inactive', 'female', 1, '2025-11-24 07:22:48'),
(15, 'new student', 'new.stu45@example.com', '$2b$10$MGzlKszkjP35M40x4MR3JOX6u/O2RKnuMNU2ViDCbjQQP8X3WY4WW', '03464533333', '23232-1111111-1', 'inactive', 'female', 1, '2025-12-01 02:27:17'),
(16, 'another student', 'anos@example.com', '$2b$10$92efCSsaciYdZKtDgXpEU.tGVjUMqlwt5rxdpQJ0UC06Tn6QO3aDq', '', '23333-1111111-1', 'inactive', 'female', 1, '2025-12-01 02:52:01'),
(17, 'Naruto', 'ninetails@email.com', '$2b$10$cQjH1l9kyxm/Vw2wrLnctu7ZqppMfs707Zffm3Mv8zYYsIpBWXu2O', '03338769876', '24444-1111111-1', 'active', 'male', 0, '2025-12-04 02:41:07'),
(18, 'sanji', 'germa3@example.com', '$2b$10$.vuPC436reYBmr5CYONPXudTmvkUooGdQpM4uutKKn3MiZDCho7h.', '', '27677-1111111-1', 'active', 'male', 0, '2025-12-11 02:44:09'),
(19, 'niji', 'niji@germa.com', '$2b$10$cC2Zlh4cFfrK2cQPmcHJfuVmYRkJvsRwMHe6qVYZrflQXp6bywqLC', '', '44444-9911159-9', 'inactive', 'male', 0, '2025-12-11 04:52:45'),
(21, 'Dio', 'Dio@email.com', '$2b$10$8aLXqMj7i4M2gv5offnlS.tCB.p1hYQLQQS2q08T7XzgJ4gCkiasK', '', '22222-7671111-1', 'active', 'male', 0, '2025-12-18 02:08:47'),
(22, 'Ali Khan', 'ali.khan@example.com', '$2b$10$RwP3lK46MxV2IvqGj0e.tuEF/giRbUOX7j9jMBfgIZVW7qCwiJZkO', '03338769875', '51234-1234567-1', 'active', 'male', 0, '2025-12-26 05:00:11'),
(23, 'Sara Ahmed', 'sara.ahmed22@example.com', '$2b$10$ZaGqr0XSdT5P2q.qZxWZ9.y5ffngbXwUHZjiujF.mlkeVJWufJLyW', '03338769877', '52345-2345678-2', 'active', 'female', 0, '2025-12-26 05:04:31'),
(24, 'Bilal Raza', 'bilal.raza@example.com', '$2b$10$OK9dlZ94U7B.CfTYmYpVTeoyeDO02GpsbPqsGJgq6feyHj5KUlit6', '03338769880', '55678-5678901-5', 'active', 'male', 0, '2025-12-26 05:53:54'),
(25, 'Kamran Iqbal', 'kamran.iqbal@example.com', '$2b$10$bq2nAkx0pNILUVS.o0tA.efg.Jy/eIMeSqlxcQEKFwEh3EE/pmDCa', '03338769882', '57890-7890123-7', 'active', 'male', 0, '2025-12-26 05:59:06'),
(26, 'Fahad Javed', 'fahad.javed@example.com', '$2b$10$P4soP.5i49RFcUSirVh9Eua21zaWlMO7FF9B6L40vCwd5J6zUueOa', '03338769884', '59012-9012345-9', 'active', 'male', 0, '2025-12-26 06:53:14'),
(28, 'Mehwish Khan', 'mehwish.khan44@example.com', '$2b$10$AYGwKe5B4DJR7G7QrYTsVeIeNvyrxhyqbRfCvgdoNFPWr1FZupoQG', '03338769885', '50123-0123456-0', 'active', 'female', 0, '2025-12-26 07:08:13'),
(29, 'Kakashi Hatake', 'kakashi@example.com', '$2b$10$Vsf1YRQ960stLCaJb/3TEehFUoM3gkGtinZ.WjK95KwFiS2dHY0e.', '03338765926', '50123-0128888-0', 'active', 'male', 0, '2025-12-31 02:11:08'),
(31, 'Ino', 'ino@example.com', '$2b$10$jQUVmFxAH6bEo49S6tB73Ow8pj5SM9wA5kOGgJjF6QLDt5Eo2Vt5S', '03464533333', '23232-1111111-1', 'inactive', 'female', 1, '2026-01-01 07:49:12');

-- --------------------------------------------------------

--
-- Table structure for table `teacher`
--

CREATE TABLE `teacher` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `gender` enum('male','female') DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher`
--

INSERT INTO `teacher` (`id`, `name`, `email`, `password`, `phone`, `cnic`, `status`, `gender`, `isDeleted`, `created_at`) VALUES
(1, 'oda', 'oda@example.com', '$2b$12$QZOiQQ2QvnN4.5aQ095hY.ANpc8Vr4EHGQpqM3hB/UEybm8V1kuhu', '03463987000', '20001-1111111-4', 'active', 'male', 0, '2025-11-19 12:36:01'),
(3, 'zoro', 'zoro@email.com', '$2b$12$vJK/I.lBULqkh//rTeJPHuH6b1z4z4zAK2FuF8OMGxTPTDYgDDS/C', '03463987299', '20001-1111111-6', 'inactive', 'male', 1, '2025-11-20 07:56:05'),
(6, 'new teacher', 'new.teacher@email.com', '$2b$10$LiQsKzLmHSssti./zSWHsulsc9OOhq8Rf15drbcyGpY.Jdojk9GOu', '', '20001-1111144-1', 'inactive', '', 1, '2025-11-20 10:27:52'),
(8, 'new teacher', 'new.teach@email.com', '$2b$10$ViRaQTsD6ULL8gJBEVJ6ye9..EdcxsAfW3XapPl3x.c2tE.ou0/wq', '03332856780', '20001-1111646-1', 'active', 'female', 0, '2025-11-20 10:42:39'),
(10, 'new teacher', 'new.teacher33@email.com', '$2b$10$qImXbBXWH4T25PguZdTHnuIxSM8LV1caHrsSl.Ls..C9o8uIgBcSu', '03463980000', '50001-1111111-1', 'inactive', 'male', 1, '2025-11-24 07:24:06'),
(11, 'Black Beard', 'bb@email.com', '$2b$10$8UNkmi7XaXj73QS4TuwCcuNrlRS9KMkwZgFBcNGVc/G/B1k5DVcqO', '', '22201-1111111-1', 'active', 'male', 0, '2025-11-25 09:53:14'),
(12, 'Doflamingo', 'doffy@email.com', '$2b$10$Gpkjl3JgIja6iHg9QTWyL.hNy9H0bmgDh.ZZ1Uef9XuCFFQL9hJOu', '', '23201-1111111-1', 'active', 'male', 0, '2025-11-27 11:19:37'),
(17, 'law', 'law@email.com', '$2b$10$Tx4nyjj2FEs2W9teHozChuAnSShL2qB8aTKGw5fAyXHZQeg1R5vge', '', '23345-1111111-1', 'active', 'male', 0, '2025-11-28 01:18:48'),
(18, 'teach teach', 'tt@example.com', '$2b$10$55HPgMQ0VscUNx31XtK9M.XWkk9VN6Jqpqpu6B86wKikPnN4EGEt2', '', '20001-1111222-1', 'inactive', 'male', 0, '2025-12-03 06:15:02'),
(20, 'silvers', 'silvers@email.com', '$2b$10$PIeGfXqHr.j7Z0kPlKAKxuA/0VwooTMKY0S9KBW.3dTlJDbgM1LEG', '03463987123', '20001-1111444-1', 'active', 'male', 0, '2025-12-17 02:35:34'),
(22, 'Gaban', 'gaban@email.com', '$2b$10$lsoGM/5AVgdf5nU57e6gCOIw.J91Nj3Ke6TG1UrAxfS8p0e0GRfBK', '03333333333', '44444-9970746-9', 'active', 'male', 0, '2025-12-18 01:59:40'),
(24, 'Usman Malik', 'usman.malik@example.com', '$2b$10$B5EX5bWnaVEl04MPVPObX.EJEHt6Efa5Y8VDlpjHAx7hfBFPqYftC', '', '53456-3456789-3', 'active', 'male', 0, '2025-12-26 05:16:45'),
(25, 'Hina Shah', 'hina.shah33@example.com', '$2b$10$yNhJSecQt40JOgIbX3lpLut2Oqa..SrmjkzE6lySZjXw3MszWpU4K', '03338769881', '56789-6789012-6', 'active', 'female', 0, '2025-12-26 05:58:11'),
(26, 'Nadia Siddiqui', 'nadia.siddiqui7@example.com', '$2b$10$NnjBIRcZsuqSJdBLWep/Seqzkbnn3xy9KGfbkMhZFOKmLA6nPHpW2', '03338763233', '58901-8901234-8', 'inactive', 'female', 0, '2025-12-26 06:16:00'),
(27, 'Sakura Haruno', 'sakura@example.com', '$2b$10$cGFltGAuksddXDRUZDjvM.KFiizcjUfLWP32neImn.j8O3Yf4hecq', '03338763254', '58901-8901777-8', 'active', 'female', 0, '2025-12-31 02:18:26');

-- --------------------------------------------------------

--
-- Table structure for table `tokens`
--

CREATE TABLE `tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` enum('student','teacher','admin') NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_course_teacher` (`teacherId`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_course` (`studentId`,`courseId`),
  ADD KEY `fk_enroll_course` (`courseId`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `teacher`
--
ALTER TABLE `teacher`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `teacher`
--
ALTER TABLE `teacher`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `tokens`
--
ALTER TABLE `tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=362;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacherId`) REFERENCES `teacher` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `fk_enroll_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enroll_student` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
