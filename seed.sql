-- Note: Run this script while connected to the correct PostgreSQL database

-- Clear existing data
TRUNCATE TABLE questions, categories CASCADE;

-- Insert New Categories
INSERT INTO categories (id, name, description) VALUES 
(1, 'Java Programming', 'Test your knowledge of Java fundamentals and OOP.'),
(2, 'Python Programming', 'Questions on Python syntax, data structures, and more.'),
(3, 'Web Development', 'HTML, CSS, JavaScript, and general web concepts.'),
(4, 'Database Architecture', 'SQL queries, normalization, and DB design.'),
(5, 'General Knowledge', 'A mix of various interesting facts.');

-- Reset sequence for categories
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Insert Questions for Java (Category 1)
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES 
(1, 'What is the default value of a local variable in Java?', 'null', '0', 'Depends on data type', 'No default value', 'D'),
(1, 'Which keyword is used to prevent a class from being subclassed?', 'final', 'static', 'private', 'abstract', 'A'),
(1, 'Which of these is not a feature of Java?', 'Object-oriented', 'Use of pointers', 'Portable', 'Dynamic', 'B'),
(1, 'What does JVM stand for?', 'Java Variable Machine', 'Java Virtual Machine', 'Java Virtual Memory', 'Java Variable Memory', 'B'),
(1, 'Which package contains the Random class?', 'java.util', 'java.lang', 'java.io', 'java.net', 'A');

-- Insert Questions for Python (Category 2)
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES 
(2, 'Who created Python?', 'Guido van Rossum', 'Elon Musk', 'Bill Gates', 'Dennis Ritchie', 'A'),
(2, 'Which of the following is the correct extension of the Python file?', '.python', '.pl', '.py', '.p', 'C'),
(2, 'What do we use to define a block of code in Python?', 'Key', 'Brackets', 'Indentation', 'None of these', 'C'),
(2, 'Which keyword is used for function?', 'Fun', 'Define', 'Def', 'Function', 'C'),
(2, 'Which of the following is built-in function in Python?', 'seed()', 'sqrt()', 'factorial()', 'print()', 'D');

-- Insert Questions for Web Dev (Category 3)
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES 
(3, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Text Markup Language', 'Hyper Tabular Markup Language', 'None of these', 'A'),
(3, 'Which HTML tag is used to define an internal style sheet?', '<css>', '<style>', '<script>', '<link>', 'B'),
(3, 'Which is the correct CSS syntax?', 'body:color=black;', '{body:color=black;}', 'body {color: black;}', '{body;color:black;}', 'C'),
(3, 'Inside which HTML element do we put the JavaScript?', '<js>', '<scripting>', '<javascript>', '<script>', 'D'),
(3, 'What does CSS stand for?', 'Cascading Style Sheets', 'Creative Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets', 'A');

-- Insert Questions for Database (Category 4)
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES 
(4, 'What does SQL stand for?', 'Structured Question Language', 'Strong Question Language', 'Structured Query Language', 'Standard Query Language', 'C'),
(4, 'Which SQL statement is used to update data in a database?', 'MODIFY', 'SAVE', 'UPDATE', 'CHANGE', 'C'),
(4, 'Which SQL statement is used to insert new data in a database?', 'ADD NEW', 'INSERT NEW', 'INSERT INTO', 'ADD RECORD', 'C'),
(4, 'How do you select a column named "FirstName" from a table named "Persons"?', 'SELECT FirstName FROM Persons', 'EXTRACT FirstName FROM Persons', 'SELECT Persons.FirstName', 'None', 'A'),
(4, 'What does ACID stand for in databases?', 'Atomicity, Consistency, Isolation, Durability', 'Accuracy, Consistency, Isolation, Durability', 'Atomicity, Concurrency, Isolation, Durability', 'None', 'A');

-- Insert Questions for General Knowledge (Category 5)
INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES 
(5, 'What is the capital of France?', 'London', 'Berlin', 'Madrid', 'Paris', 'D'),
(5, 'Which planet is known as the Red Planet?', 'Venus', 'Jupiter', 'Mars', 'Saturn', 'C'),
(5, 'What is the largest ocean on Earth?', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean', 'D'),
(5, 'Who wrote "Romeo and Juliet"?', 'Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen', 'B'),
(5, 'What is the chemical symbol for Gold?', 'Au', 'Ag', 'Gd', 'Go', 'A');
