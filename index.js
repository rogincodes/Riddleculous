import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 4000;
var riddleAnswer = "";

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// GET index.ejs
app.get("/", (req, res) => {
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
  res.render("goodbye.ejs");
});

// POST submit answer
app.post("/submitAnswer", async (req, res) => {
	try {
		const insultAPI = await axios.get("https://evilinsult.com/generate_insult.php?lang=en&type=json");
		const complimentAPI = await axios.get("https://compliments-api.onrender.com/random")
		let userAnswer = req.body.answer.toUpperCase();
		const upperCasedAnswer = riddleAnswer.toUpperCase();
		let words = userAnswer.split(" ");
		let found = words.some(word => upperCasedAnswer.includes(word));
		
		// check answer		
		if (userAnswer === "") {
			res.render("riddle.ejs", { answer: `The correct answer is "${riddleAnswer}".`, verdict: result.data.insult })
		} else {
			if (found) {
				res.render("riddle.ejs", { answer: `The correct answer is "${riddleAnswer}".`, verdict: complimentAPI.data.compliment, textColor: "green-Text" });
			} else {
				res.render("riddle.ejs", { answer: `The correct answer is "${riddleAnswer}".`, verdict: insultAPI.data.insult, textColor: "red-Text" });
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