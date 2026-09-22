-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: consulting_site
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `consultations`
--

DROP TABLE IF EXISTS `consultations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company_org` varchar(150) DEFAULT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `service` varchar(100) DEFAULT NULL,
  `message` text,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultations`
--

LOCK TABLES `consultations` WRITE;
/*!40000 ALTER TABLE `consultations` DISABLE KEYS */;
INSERT INTO `consultations` VALUES (19,'Mugisha','Chretien','mugishatumusifuchretien@gmail.com','0796418405','IceWeii','Consultation','Research','Hello There!','2025-08-04 08:54:51'),(20,'Patient','Tumusifu','mugishatumusifuchretien@gmail.com','0796418405','Ice Tech Solutions','Consultation','Business-Strategy','Okay There!\r\n','2025-08-04 09:01:49'),(21,'Weii','Tumusifu','mm@gmail.com','0796418405','Company_1','Consultation','Business-Strategy','Hiiii','2025-08-04 11:09:14'),(22,'Igiraneza','Naomi','igiranezanaomi@gmail.com','0796418405','IceWay','Proposal','Capacity-Building','My Operations\r\n','2025-08-04 11:40:00'),(23,'Sanyu','Patient','sanyurebecca@gmail.com','0788888888','BK','Consultation','Policy-Formulation','Okay Okay','2025-08-04 11:40:41'),(24,'Rebecca','Patient','sanyurebecca@gmail.com','0788888888','IceWay','Consultations','Business-Strategy','Muuu','2025-08-04 11:41:34'),(25,'Mugisha','Tumusifu','mugishatumusifuchretien@gmail.com','0796418405','Ice Tech Solutions','Consultation','Business-Strategy','mm','2025-08-05 12:05:33'),(26,'Caleb','Ashimwe','icewaystudios@gmail.com','0796418405','IceWay','Consultation','Business-Strategy','Hello','2025-08-05 12:37:06'),(28,'Weii','Patient','sanopatient@gmail.com','0788888888','BK','Proposal','Business-Strategy','nn','2025-08-05 12:41:58'),(29,'Mugisha Chre','Tumusifu','mugi@gmail.com','0796418405','IceWay','Consultation','Policy-Formulation','Giiiii','2025-08-05 12:47:03');
/*!40000 ALTER TABLE `consultations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'client',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'mugisha','chret40@gmail.com','$2b$10$i3rfhPzqPl5.YspMSVpCP.VAII9EyQXFbcnIW4BliiJV3JHj9jwxe','client'),(3,'NIYINDENGERA','fniyindengera@gmail.com','$2b$10$vVgSk400FNLmCSucb4PLYOo4y4Sm773HUymJfCVvUoi4/Q9UitMK6','client'),(4,'tumusifu','mugishatumusifuchretien@gmail.com','$2b$10$Ss84QRWZcPFUOo3Y2AnfXuME8kWooCt5ftkQ3xTx4q1v5Ev4KBSle','client'),(7,'Sanyu','sanyurebecca@gmail.com','$2b$10$B1oxv0Et4ElcxCRMUeBNyeYg9M3uPtYcg79nxer2sN82CPMjIgUue','admin'),(9,'mugisha_tumu','mugisha_tumu@gmail.com','$2b$10$JpFGi5f/GlQDWnYPzB1uhO3rMCkqqvtE2yevVIIFrCO6lII0iIj8u','client'),(10,'weii','weii@gmail.com','$2b$10$uvt4Izezxs3QYhSVDpS/eeZ5qdzKK0jR3/jL8J4ejWtYdyWFvQlT6','client'),(12,'caleb','icewaystudios@gmail.com','$2b$10$XWafZw1KEVjcr.HsJVPt/OFx82HjDkaz9Eh2a5Z.xnm3yUgi6KoQ.','client'),(13,'Afani','mugishaafani@gmail.com','$2b$10$WfW6EDOZjfKgSrRfNSHgVOqhIbp01P9EFf3/JsNXwDsbCy7tKSIPi','client'),(16,'Manager','manager@gmail.com','$2b$10$JaMKvm.U5wlzr4cWsrKxrO7dLwNF7V7TTaRU46lndvrVWzSuvhIFi','manager'),(17,'client','client@gmail.com','$2b$10$BRprTSu3BSl.0H/Rz33COOyW/hrDFL4fQcbZ4cRJhNLyckL1W2oni','client'),(18,'Saano','sanoumugishantwariaimepatient@gmail.com','$2b$10$o1jM4/A32BSlIGQ.Esus1e1/omfhhnyBGDDiWW8h5oaoTGcDMplu2','client'),(19,'chre','chretienmugisha@gmail.com','$2b$10$Qp1ZAElTs2JCB5myibtXgOMDYN5lLsOlF7Dq/w282TuqN8Q9BB.fK','admin'),(20,'SSS','sss@gmail.com','$2b$10$TX1BehaoN6lyQAym9ZTMnOPWbJtFQr6V.RnyUJ3Leb3Q0zJsZjkNy','client'),(21,'mmmm','mmmm@gmail.com','$2b$10$k5spdGlkyLyU5V8VguDRR.m9Fsc8CooberpNmxmPM69Y6qLJHXwC2','client'),(22,'Admin','admin1111111111@gmail.com','$2b$10$LjY9wt51z4s7ichFv0363ODDM1Wlhlk53qc3CsIRMyYwuGzudN6SC','admin'),(23,'mugi','mugi@gmail.com','$2b$10$c9NHdTcguZtRUTiQNalkCux/IkctTlms8Pnx0ri5mJQ.zUOXKsyGG','client');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-05 15:50:35
