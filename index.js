import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 4000;
var riddleAnswer = "";

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let insultsCounter = 0;
let complimentsCounter = 0;

// GET index.ejs
app.get("/", (req, res) => {
	insultsCounter = 0;
	complimentsCounter = 0;
	res.render("index.ejs");
});

// POST submit name
app.post("/submitName", async (req, res) => {
	try {
		res.render("index.ejs", { name: req.body.name });
	} catch (error) {
		console.error(error.message);
		res.sendStatus(500);
	}
});

// GET random riddle
app.get("/riddle.ejs", async (req, res) => {
	try {
		const result = await axios.get("https://riddles-api.vercel.app/random");
		res.render("riddle.ejs", { riddle: result.data.riddle });
		riddleAnswer = result.data.answer;
		console.log(result.data);
	} catch (error) {
		console.error("Failed to make request:", error.message);
		res.render("index.ejs", { riddle: error.message});
		res.sendStatus(500);
	}
});

// GET goodbye.ejs
app.get("/goodbye.ejs", (req, res) => {
  res.render("goodbye.ejs", { insCounter: insultsCounter, compCounter: complimentsCounter });
});

// POST submit answer
app.post("/submitAnswer", async (req, res) => {
	try {
		const insultAPI = await axios.get("https://evilinsult.com/generate_insult.php?lang=en&type=json");
		const complimentAPI = await axios.get("https://compliments-api.vercel.app/random")
		let userAnswer = req.body.answer.toLowerCase();
		const correctAnswer = riddleAnswer.toLowerCase();
		let commonWords = ["i", "he", "she", "a", "the", "is", "it", "its", "it's", "will", "not", "in", "on", "to"];
		let filteredAnswer = userAnswer.split(" ").filter(word => !commonWords.includes(word)).join(" ");
		let finalAnswer = filteredAnswer.split(" ");
		let found = finalAnswer.some(word => correctAnswer.includes(word));
		
		// check answer		
		if (userAnswer === "") {
			insultsCounter++;
			res.render("riddle.ejs", { answer: `The correct answer is "${riddleAnswer}".`, verdict: insultAPI.data.insult, textColor: "red-Text", insCounter: insultsCounter, compCounter: complimentsCounter })
		} else {
			if (found) {
				complimentsCounter++;
				res.render("riddle.ejs", { answer: `The correct answer is "${riddleAnswer}".`, verdict: complimentAPI.data.compliment, textColor: "green-Text", insCounter: insultsCounter, compCounter: complimentsCounter });
			} else {
				insultsCounter++;
				res.render("riddle.ejs", { answer: `The correct answer is "${riddleAnswer}".`, verdict: insultAPI.data.insult, textColor: "red-Text", insCounter: insultsCounter, compCounter: complimentsCounter });
			}
		}	
	} catch (error) {
		console.error("Failed to make request:", error.message);
		res.render("index.ejs", { riddle: error.message});
		res.status(500);
	}
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});