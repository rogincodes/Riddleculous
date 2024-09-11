import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
var riddleAnswer = "";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.render("index.ejs");
});

app.post("/submitName", async (req, res) => {
	try {
		res.render("index.ejs", { name: req.body.name });
	} catch (error) {
		console.error(error.message);
		res.sendStatus(500);
	}
});

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

app.get("/goodbye.ejs", (req, res) => {
  res.render("goodbye.ejs");
});

app.post("/submitAnswer", async (req, res) => {
	try {
		const result = await axios.get("https://evilinsult.com/generate_insult.php?lang=en&type=json");
		let userAnswer = req.body.answer.toUpperCase();
		const upperCasedAnswer = riddleAnswer.toUpperCase();
		if (upperCasedAnswer.includes(userAnswer)) {
			res.render("riddle.ejs", { answer: `The correct answer is "${riddleAnswer}".`, verdict: "Congratulations on not getting insulted!"});
		} else {
			res.render("riddle.ejs", { answer: `The correct answer is "${riddleAnswer}".`, verdict: result.data.insult })
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