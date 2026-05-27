const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  user: 'quiz_admin_user',
  password: 'admin_secure_password',
  database: 'quiz_app_db'
});

const newCategories = [
    { name: 'Movies', description: 'Questions about popular movies, directors, and actors.' },
    { name: 'Music', description: 'Test your knowledge on bands, artists, and music history.' },
    { name: 'History', description: 'Historical events, figures, and dates.' }
];

const questionsData = {
    'Java Programming': [
        ['What is the size of an int variable?', '8 bit', '16 bit', '32 bit', '64 bit', 'C'],
        ['Which data type is used to create a variable that should store text?', 'String', 'myString', 'Txt', 'string', 'A'],
        ['How do you create a variable with the numeric value 5?', 'num x = 5', 'float x = 5;', 'int x = 5;', 'x = 5;', 'C'],
        ['Which method can be used to find the length of a string?', 'getSize()', 'length()', 'len()', 'size()', 'B'],
        ['Which operator is used to add together two values?', 'The & sign', 'The * sign', 'The + sign', 'The - sign', 'C'],
        ['The value of a string variable can be surrounded by single quotes.', 'True', 'False', 'Maybe', 'Sometimes', 'B'],
        ['Which operator can be used to compare two values?', '><', '=', '<>', '==', 'D'],
        ['To declare an array in Java, define the variable type with:', '{}', '()', '[]', '<>', 'C'],
        ['Array indexes start with:', '0', '1', '2', '-1', 'A'],
        ['How do you create a method in Java?', 'methodName()', 'methodName[]', '(methodName)', 'methodName.', 'A'],
        ['Which keyword is used to create a class in Java?', 'class()', 'class', 'MyClass', 'className', 'B'],
        ['What is the correct way to create an object called myObj of MyClass?', 'new myObj = MyClass();', 'class myObj = new MyClass();', 'MyClass myObj = new MyClass();', 'class MyClass = new myObj();', 'C'],
        ['Which statement is used to stop a loop?', 'return', 'stop', 'exit', 'break', 'D'],
        ['What is the output of Math.max(5, 10)?', '5', '10', '15', 'Error', 'B'],
        ['How do you start writing an if statement in Java?', 'if x > y then:', 'if (x > y)', 'if x > y', 'if (x > y) then', 'B']
    ],
    'Python Programming': [
        ['What is a correct syntax to output "Hello World" in Python?', 'echo "Hello World"', 'p("Hello World")', 'print("Hello World")', 'echo("Hello World");', 'C'],
        ['How do you insert COMMENTS in Python code?', '//This is a comment', '#This is a comment', '/*This is a comment*/', '<!--This is a comment-->', 'B'],
        ['Which one is NOT a legal variable name?', 'my_var', '_myvar', 'my-var', 'myvar', 'C'],
        ['How do you create a variable with the numeric value 5?', 'x = 5', 'x = int(5)', 'Both are correct', 'None of the above', 'C'],
        ['What is the correct file extension for Python files?', '.pyt', '.py', '.pt', '.pyth', 'B'],
        ['How do you create a variable with the floating number 2.8?', 'x = 2.8', 'x = float(2.8)', 'Both are correct', 'None of the above', 'C'],
        ['What is the correct syntax to output the type of a variable or object in Python?', 'print(typeOf(x))', 'print(type(x))', 'print(typeof(x))', 'print(typeof x)', 'B'],
        ['What is the correct way to create a function in Python?', 'function myfunction():', 'create myfunction():', 'def myfunction():', 'def myfunction:', 'C'],
        ['In Python, "Hello", is the same as \'Hello\'', 'True', 'False', 'Depends on version', 'Only in Python 2', 'A'],
        ['What is a correct syntax to return the first character in a string?', 'x = "Hello"[0]', 'x = sub("Hello", 0, 1)', 'x = "Hello".sub(0, 1)', 'x = "Hello"[1]', 'A'],
        ['Which method can be used to remove any whitespace from both the beginning and the end of a string?', 'len()', 'strip()', 'ptrim()', 'trim()', 'B'],
        ['Which method can be used to return a string in upper case letters?', 'toUpperCase()', 'upper()', 'uppercase()', 'upperCase()', 'B'],
        ['Which method can be used to replace parts of a string?', 'replace()', 'switch()', 'repl()', 'replaceString()', 'A'],
        ['Which operator is used to multiply numbers?', '%', '*', '#', 'x', 'B'],
        ['Which operator is used to check if two values are equal?', '=', '><', '==', '<>', 'C']
    ],
    'Web Development': [
        ['What does HTML stand for?', 'Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyper Text Makeup Language', 'A'],
        ['Who is making the Web standards?', 'Google', 'Mozilla', 'Microsoft', 'The World Wide Web Consortium', 'D'],
        ['Choose the correct HTML element for the largest heading:', '<h1>', '<h6>', '<heading>', '<head>', 'A'],
        ['What is the correct HTML element for inserting a line break?', '<break>', '<br>', '<lb>', '<newline>', 'B'],
        ['What is the correct HTML for adding a background color?', '<body bg="yellow">', '<background>yellow</background>', '<body style="background-color:yellow;">', '<body color="yellow">', 'C'],
        ['Choose the correct HTML element to define important text', '<strong>', '<important>', '<b>', '<i>', 'A'],
        ['Choose the correct HTML element to define emphasized text', '<italic>', '<i>', '<em>', '<emp>', 'C'],
        ['What is the correct HTML for creating a hyperlink?', '<a url="http://www.w3schools.com">W3Schools.com</a>', '<a href="http://www.w3schools.com">W3Schools</a>', '<a>http://www.w3schools.com</a>', '<a name="http://www.w3schools.com">W3Schools.com</a>', 'B'],
        ['Which character is used to indicate an end tag?', '/', '*', '^', '<', 'A'],
        ['How can you open a link in a new tab/browser window?', '<a href="url" target="new">', '<a href="url" target="_blank">', '<a href="url" new>', '<a href="url" target="_window">', 'B'],
        ['Which of these elements are all <table> elements?', '<table><head><tfoot>', '<table><tr><td>', '<table><tr><tt>', '<thead><body><tr>', 'B'],
        ['Inline elements are normally displayed without starting a new line.', 'True', 'False', 'Only in HTML5', 'Only if styled', 'A'],
        ['How can you make a numbered list?', '<ul>', '<dl>', '<ol>', '<list>', 'C'],
        ['How can you make a bulleted list?', '<ul>', '<dl>', '<ol>', '<list>', 'A'],
        ['What is the correct HTML for making a checkbox?', '<input type="check">', '<checkbox>', '<check>', '<input type="checkbox">', 'D']
    ],
    'Database Architecture': [
        ['What does SQL stand for?', 'Strong Question Language', 'Structured Query Language', 'Structured Question Language', 'Simple Query Language', 'B'],
        ['Which SQL statement is used to extract data from a database?', 'EXTRACT', 'GET', 'OPEN', 'SELECT', 'D'],
        ['Which SQL statement is used to update data in a database?', 'MODIFY', 'SAVE AS', 'UPDATE', 'SAVE', 'C'],
        ['Which SQL statement is used to delete data from a database?', 'REMOVE', 'DELETE', 'COLLAPSE', 'CLEAR', 'B'],
        ['Which SQL statement is used to insert new data in a database?', 'ADD NEW', 'INSERT NEW', 'INSERT INTO', 'ADD RECORD', 'C'],
        ['With SQL, how do you select a column named "FirstName" from a table named "Persons"?', 'EXTRACT FirstName FROM Persons', 'SELECT FirstName FROM Persons', 'SELECT Persons.FirstName', 'GET FirstName FROM Persons', 'B'],
        ['With SQL, how do you select all the columns from a table named "Persons"?', 'SELECT * FROM Persons', 'SELECT [all] FROM Persons', 'SELECT Persons', 'SELECT *.Persons', 'A'],
        ['With SQL, how do you select all the records from a table named "Persons" where the value of the column "FirstName" is "Peter"?', 'SELECT * FROM Persons WHERE FirstName=\'Peter\'', 'SELECT * FROM Persons WHERE FirstName<>\'Peter\'', 'SELECT [all] FROM Persons WHERE FirstName LIKE \'Peter\'', 'SELECT [all] FROM Persons WHERE FirstName=\'Peter\'', 'A'],
        ['With SQL, how do you select all the records from a table named "Persons" where the value of the column "FirstName" starts with an "a"?', 'SELECT * FROM Persons WHERE FirstName LIKE \'a%\'', 'SELECT * FROM Persons WHERE FirstName=\'a\'', 'SELECT * FROM Persons WHERE FirstName LIKE \'%a\'', 'SELECT * FROM Persons WHERE FirstName=\'%a%\'', 'A'],
        ['The OR operator displays a record if ANY conditions listed are true. The AND operator displays a record if ALL of the conditions listed are true', 'True', 'False', 'Depends on the database', 'Only in MySQL', 'A'],
        ['With SQL, how do you select all the records from a table named "Persons" where the "FirstName" is "Peter" and the "LastName" is "Jackson"?', 'SELECT * FROM Persons WHERE FirstName=\'Peter\' AND LastName=\'Jackson\'', 'SELECT FirstName=\'Peter\', LastName=\'Jackson\' FROM Persons', 'SELECT * FROM Persons WHERE FirstName<>\'Peter\' AND LastName<>\'Jackson\'', 'SELECT * FROM Persons WHERE FirstName=\'Peter\' OR LastName=\'Jackson\'', 'A'],
        ['With SQL, how do you select all the records from a table named "Persons" where the "LastName" is alphabetically between (and including) "Hansen" and "Pettersen"?', 'SELECT * FROM Persons WHERE LastName BETWEEN \'Hansen\' AND \'Pettersen\'', 'SELECT LastName>\'Hansen\' AND LastName<\'Pettersen\' FROM Persons', 'SELECT * FROM Persons WHERE LastName>\'Hansen\' AND LastName<\'Pettersen\'', 'SELECT * FROM Persons WHERE LastName=\'Hansen\' TO \'Pettersen\'', 'A'],
        ['Which SQL statement is used to return only different values?', 'SELECT UNIQUE', 'SELECT DIFFERENT', 'SELECT DISTINCT', 'SELECT VARIOUS', 'C'],
        ['Which SQL keyword is used to sort the result-set?', 'SORT', 'ORDER', 'SORT BY', 'ORDER BY', 'D'],
        ['With SQL, how can you return all the records from a table named "Persons" sorted descending by "FirstName"?', 'SELECT * FROM Persons ORDER BY FirstName DESC', 'SELECT * FROM Persons SORT BY \'FirstName\' DESC', 'SELECT * FROM Persons ORDER FirstName DESC', 'SELECT * FROM Persons SORT \'FirstName\' DESC', 'A']
    ],
    'General Knowledge': [
        ['What is the capital of France?', 'London', 'Berlin', 'Madrid', 'Paris', 'D'],
        ['Which planet is known as the Red Planet?', 'Venus', 'Jupiter', 'Mars', 'Saturn', 'C'],
        ['What is the largest ocean on Earth?', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean', 'D'],
        ['Who wrote "Romeo and Juliet"?', 'Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen', 'B'],
        ['What is the chemical symbol for Gold?', 'Au', 'Ag', 'Gd', 'Go', 'A'],
        ['In what year did the Titanic sink?', '1912', '1905', '1898', '1923', 'A'],
        ['What is the tallest mountain in the world?', 'K2', 'Mount Everest', 'Mount Kilimanjaro', 'Denali', 'B'],
        ['Who painted the Mona Lisa?', 'Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet', 'C'],
        ['What is the hardest natural substance on Earth?', 'Gold', 'Iron', 'Diamond', 'Platinum', 'C'],
        ['How many continents are there on Earth?', '5', '6', '7', '8', 'C'],
        ['Which country is the largest by land area?', 'Canada', 'China', 'United States', 'Russia', 'D'],
        ['What is the smallest country in the world?', 'Monaco', 'Nauru', 'Vatican City', 'San Marino', 'C'],
        ['Which element has the chemical symbol \'O\'?', 'Gold', 'Oxygen', 'Silver', 'Iron', 'B'],
        ['What is the longest river in the world?', 'Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River', 'B'],
        ['Who was the first President of the United States?', 'Abraham Lincoln', 'Thomas Jefferson', 'John Adams', 'George Washington', 'D']
    ],
    'Movies': [
        ['Who directed the movie "Inception"?', 'Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'James Cameron', 'B'],
        ['What year was the first "Star Wars" movie released?', '1975', '1977', '1980', '1983', 'B'],
        ['Which actor played the character "Jack Dawson" in Titanic?', 'Brad Pitt', 'Johnny Depp', 'Leonardo DiCaprio', 'Tom Cruise', 'C'],
        ['What is the highest-grossing film of all time?', 'Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars: The Force Awakens', 'A'],
        ['In "The Matrix", what pill does Neo take?', 'Red Pill', 'Blue Pill', 'Green Pill', 'Yellow Pill', 'A'],
        ['Which movie won the first Academy Award for Best Animated Feature?', 'Toy Story', 'Shrek', 'Finding Nemo', 'Monsters, Inc.', 'B'],
        ['Who played the Joker in "The Dark Knight"?', 'Jack Nicholson', 'Jared Leto', 'Joaquin Phoenix', 'Heath Ledger', 'D'],
        ['What is the name of the hobbit played by Elijah Wood in "The Lord of the Rings"?', 'Samwise Gamgee', 'Peregrin Took', 'Frodo Baggins', 'Bilbo Baggins', 'C'],
        ['Which movie features the quote, "I\'ll be back"?', 'Die Hard', 'The Terminator', 'Rambo', 'Rocky', 'B'],
        ['Who directed "Jurassic Park"?', 'George Lucas', 'Steven Spielberg', 'Ridley Scott', 'Peter Jackson', 'B'],
        ['What is the name of the fictional African country in "Black Panther"?', 'Genovia', 'Zamunda', 'Wakanda', 'Krakozhia', 'C'],
        ['Which Disney princess has a raccoon sidekick named Meeko?', 'Pocahontas', 'Mulan', 'Ariel', 'Jasmine', 'A'],
        ['In which movie does Tom Hanks say, "Houston, we have a problem"?', 'Cast Away', 'Saving Private Ryan', 'Apollo 13', 'Sleepless in Seattle', 'C'],
        ['What is the name of the wizarding school in Harry Potter?', 'Beauxbatons', 'Durmstrang', 'Ilvermorny', 'Hogwarts', 'D'],
        ['Who played Forrest Gump?', 'Tom Cruise', 'Tom Hanks', 'Brad Pitt', 'Harrison Ford', 'B']
    ],
    'Music': [
        ['Who is known as the "King of Pop"?', 'Elvis Presley', 'Michael Jackson', 'Prince', 'Madonna', 'B'],
        ['Which band performed the song "Bohemian Rhapsody"?', 'The Beatles', 'The Rolling Stones', 'Queen', 'Led Zeppelin', 'C'],
        ['What instrument does Carlos Santana play?', 'Drums', 'Bass', 'Piano', 'Guitar', 'D'],
        ['Who is the lead singer of Coldplay?', 'Chris Martin', 'Thom Yorke', 'Matt Bellamy', 'Bono', 'A'],
        ['Which artist released the album "Thriller"?', 'Prince', 'Michael Jackson', 'Lionel Richie', 'Stevie Wonder', 'B'],
        ['What is the best-selling album of all time?', 'The Dark Side of the Moon', 'Back in Black', 'Thriller', 'The Bodyguard', 'C'],
        ['Which band was John Lennon a member of?', 'The Rolling Stones', 'The Who', 'The Kinks', 'The Beatles', 'D'],
        ['Who sang "Rolling in the Deep"?', 'Beyonce', 'Adele', 'Taylor Swift', 'Rihanna', 'B'],
        ['What genre of music is Bob Marley famous for?', 'Reggae', 'Jazz', 'Rock', 'Hip Hop', 'A'],
        ['Which classical composer was deaf later in life?', 'Mozart', 'Bach', 'Beethoven', 'Chopin', 'C'],
        ['Who is known as the "Queen of Soul"?', 'Diana Ross', 'Aretha Franklin', 'Whitney Houston', 'Tina Turner', 'B'],
        ['Which artist holds the record for most Grammy wins?', 'Quincy Jones', 'Alison Krauss', 'Beyonce', 'Georg Solti', 'C'],
        ['What year did MTV launch?', '1979', '1981', '1983', '1985', 'B'],
        ['Who performed the Super Bowl halftime show in 2023?', 'The Weeknd', 'Dr. Dre', 'Rihanna', 'Jennifer Lopez', 'C'],
        ['Which pop star has "Little Monsters" as her fanbase?', 'Katy Perry', 'Lady Gaga', 'Ariana Grande', 'Miley Cyrus', 'B']
    ],
    'History': [
        ['Who was the first President of the United States?', 'George Washington', 'Thomas Jefferson', 'John Adams', 'James Madison', 'A'],
        ['In what year did World War II end?', '1941', '1943', '1945', '1947', 'C'],
        ['Who discovered America in 1492?', 'Leif Erikson', 'Christopher Columbus', 'Ferdinand Magellan', 'Marco Polo', 'B'],
        ['What was the name of the ship that brought the Pilgrims to America?', 'Santa Maria', 'Mayflower', 'Pinta', 'Nina', 'B'],
        ['Who was the British Prime Minister during most of World War II?', 'Neville Chamberlain', 'Winston Churchill', 'Clement Attlee', 'Anthony Eden', 'B'],
        ['Which ancient civilization built the pyramids at Giza?', 'Romans', 'Greeks', 'Mayans', 'Egyptians', 'D'],
        ['Who was the first emperor of Rome?', 'Julius Caesar', 'Augustus', 'Nero', 'Caligula', 'B'],
        ['In what year did the Berlin Wall fall?', '1987', '1989', '1991', '1993', 'B'],
        ['Who was the famous nurse during the Crimean War?', 'Clara Barton', 'Florence Nightingale', 'Mary Seacole', 'Edith Cavell', 'B'],
        ['What was the primary cause of the American Civil War?', 'Taxation', 'Slavery', 'Territorial Expansion', 'Trade Disputes', 'B'],
        ['Who painted the ceiling of the Sistine Chapel?', 'Leonardo da Vinci', 'Raphael', 'Michelangelo', 'Donatello', 'C'],
        ['What document was signed in 1215 limiting the power of the English king?', 'The Constitution', 'The Declaration of Independence', 'The Magna Carta', 'The Bill of Rights', 'C'],
        ['Who was the longest-reigning British monarch before Queen Elizabeth II?', 'King George III', 'Queen Victoria', 'King Henry VIII', 'Queen Mary', 'B'],
        ['Which war was fought between the North and South regions in the United States?', 'World War I', 'The Revolutionary War', 'The Civil War', 'The War of 1812', 'C'],
        ['Who was assassinated in Dallas, Texas on November 22, 1963?', 'Abraham Lincoln', 'Martin Luther King Jr.', 'John F. Kennedy', 'Robert F. Kennedy', 'C']
    ]
};

async function run() {
    try {
        console.log('Clearing existing categories and questions...');
        await pool.query('DELETE FROM questions;');
        await pool.query('DELETE FROM categories;');

        const existingCategories = Object.keys(questionsData).slice(0, 5); // Assuming first 5 are the ones in existing DB
        
        // Insert all 8 categories
        for (const catName of Object.keys(questionsData)) {
            let description = 'General knowledge questions.';
            // Find description if it's new
            const newCat = newCategories.find(c => c.name === catName);
            if (newCat) {
                description = newCat.description;
            } else if (catName === 'Java Programming') description = 'Test your knowledge of Java fundamentals and OOP.';
            else if (catName === 'Python Programming') description = 'Questions on Python syntax, data structures, and more.';
            else if (catName === 'Web Development') description = 'HTML, CSS, JavaScript, and general web concepts.';
            else if (catName === 'Database Architecture') description = 'SQL queries, normalization, and DB design.';
            else if (catName === 'General Knowledge') description = 'A mix of various interesting facts.';

            console.log(`Inserting category: ${catName}...`);
            const catRes = await pool.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id', [catName, description]);
            const categoryId = catRes.rows[0].id;

            console.log(`Inserting ${questionsData[catName].length} questions for ${catName}...`);
            for (const q of questionsData[catName]) {
                await pool.query(
                    'INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [categoryId, q[0], q[1], q[2], q[3], q[4], q[5]]
                );
            }
        }
        
        console.log('Successfully seeded database with expanded categories and questions!');

    } catch (err) {
        console.error('Error during seeding:', err);
    } finally {
        await pool.end();
    }
}

run();
