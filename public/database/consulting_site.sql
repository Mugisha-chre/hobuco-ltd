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
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultations`
--

LOCK TABLES `consultations` WRITE;
/*!40000 ALTER TABLE `consultations` DISABLE KEYS */;
INSERT INTO `consultations` VALUES (19,'Mugisha','Chretien','mugishatumusifuchretien@gmail.com','0796418405','IceWeii','Consultation','Research','Hello There!','2025-08-04 08:54:51','pending'),(20,'Patient','Tumusifu','mugishatumusifuchretien@gmail.com','0796418405','Ice Tech Solutions','Consultation','Business-Strategy','Okay There!\r\n','2025-08-04 09:01:49','pending'),(22,'Igiraneza','Naomi','igiranezanaomi@gmail.com','0796418405','IceWay','Proposal','Capacity-Building','My Operations\r\n','2025-08-04 11:40:00','pending'),(23,'Sanyu','Patient','sanyurebecca@gmail.com','0788888888','BK','Consultation','Policy-Formulation','Okay Okay','2025-08-04 11:40:41','approved'),(24,'Rebecca','Patient','sanyurebecca@gmail.com','0788888888','IceWay','Consultations','Business-Strategy','Muuu','2025-08-04 11:41:34','pending'),(25,'Mugisha','Tumusifu','mugishatumusifuchretien@gmail.com','0796418405','Ice Tech Solutions','Consultation','Business-Strategy','mm','2025-08-05 12:05:33','approved'),(28,'Weii','Patient','sanopatient@gmail.com','0788888888','BK','Proposal','Business-Strategy','nn','2025-08-05 12:41:58','dismissed'),(29,'Mugisha Chre','Tumusifu','mugi@gmail.com','0796418405','IceWay','Consultation','Policy-Formulation','Giiiii','2025-08-05 12:47:03','pending'),(30,'Igiraneza','Naomi','admin1111111111@gmail.com','9787','Company_2','Consultation','Policy-Formulation','gvfddf','2025-08-21 08:31:47','pending'),(31,'Caleb','Ishimwe','client@gmail.com','05905','Company_2','DevOps','Policy-Formulation','afasa','2025-08-21 08:48:46','approved'),(33,'Sanyu','Rebecca','sanyurebeccapatient@gmail.com','0796418405','Ice Tech Solutions','Consultation','Policy-Formulation','Heii','2025-08-21 13:08:11','dismissed'),(34,'Tumusifu','Mugisha','mugishatumusifuchretien@gmail.com','0796418405','Company_1','Help','Research','Hello There','2025-08-21 15:55:56','pending'),(36,'Mugisha','Chretien','mugishatumusifuchretien@gmail.com','0796418405','Ice Tech Solutions','Consultations','Business-Strategy','Heii','2025-08-21 16:15:15','approved'),(38,'Chret','):','chret40@gmail.com','0796418405','IceWeii','Help','Research','Hey There!','2025-08-22 11:24:32','pending'),(39,'Sanyu','Rumuri','sanyurebeccapatient@gmail.com','0796418405','BK','Consultation','Business-Strategy','Heiii There!','2025-08-22 11:25:36','pending'),(40,'Igiraneza','Naomi','mugishatumusifuchretien@gmail.com','0796418405','IceWeii','Proposal','Policy-Formulation','Okay','2025-08-22 11:27:12','pending'),(41,'Tumu','Mugi','chret40@gmail.com','0796418405','Ice Tech Solutions','DevOps','Business-Strategy','My Name is: Mugisha Chretien ','2025-08-22 11:57:29','pending');
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
INSERT INTO `users` VALUES (2,'mugisha','chret40@gmail.com','$2b$10$i3rfhPzqPl5.YspMSVpCP.VAII9EyQXFbcnIW4BliiJV3JHj9jwxe','client'),(4,'tumusifu','mugishatumusifuchretien@gmail.com','$2b$10$kVLZyYhjs3WgzcSRl9laaO6J48lUnTuP.PMEiOvR0PzPHmVS4Ngge','client'),(7,'Sanyu','sanyurebecca@gmail.com','$2b$10$j4mM9ywOJUye/dnXhJ80B.1u5TcP3GvCUQB39a8fr3U0nIjf96zFG','admin'),(10,'weii','weii@gmail.com','$2b$10$uvt4Izezxs3QYhSVDpS/eeZ5qdzKK0jR3/jL8J4ejWtYdyWFvQlT6','client'),(12,'caleb','icewaystudios@gmail.com','$2b$10$XWafZw1KEVjcr.HsJVPt/OFx82HjDkaz9Eh2a5Z.xnm3yUgi6KoQ.','client'),(13,'Afani','mugishaafani@gmail.com','$2b$10$WfW6EDOZjfKgSrRfNSHgVOqhIbp01P9EFf3/JsNXwDsbCy7tKSIPi','client'),(16,'Manager','manager@gmail.com','$2b$10$gdIotHeFqqxgMwOPSTlUruQ7InimjF5bYE9XPM0NHjrNJ3JHe78bK','manager'),(17,'client','client@gmail.com','$2b$10$iXlhVqZQQEDu9C47Y5EcfeHVAhnjx4MYmWh6i6Px8C14BY9HCceny','client'),(18,'Saano','sanoumugishantwariaimepatient@gmail.com','$2b$10$o1jM4/A32BSlIGQ.Esus1e1/omfhhnyBGDDiWW8h5oaoTGcDMplu2','client'),(19,'chre','chretienmugisha@gmail.com','$2b$10$iOhlNujcCSXOEuEYidNQLOooWvWeaB7yuHtBqaniG6oeIk3whIXOa','admin'),(23,'mugi','mugi@gmail.com','$2b$10$c9NHdTcguZtRUTiQNalkCux/IkctTlms8Pnx0ri5mJQ.zUOXKsyGG','client');
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

-- Dump completed on 2025-08-22 14:20:57
