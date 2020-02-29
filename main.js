/* *************************************
 *			   GLOBALS			   *
 ***************************************/

"using strict";

/* Questions will be loaded from an external json file */
let QUESTIONS = [];

let MESSAGES = {};
/* The file that contains the listing of available quizzes */
const QUIZ_FILE = 'quizzes.json';
/* The quiz objects of available quizzes. Will be loaded from the external QUIZ_FILE json file */
let QUIZZES = [];
/* The question which you are currently displaying */
let currentQuestion = 0;
/* Your current number of correct questions */
let score = 0;
/* The numbers of the questions that have been asked in the order they were asked */
const asked = [];
/* The numbers of the questions that have not yet been asked */
const unasked = [];
/* The answers you gave to the questions in the order they were asked */
const answers = [];
/* The maximum number of quesitons per session */
const QUESTIONS_PER_SESSION = 3;

/* ********************************
 *		   FUNCTIONS			*
 **********************************/

 /**
  * Update the score text
  */
function updateScore() {
	$('.score-correct').text( score );
	$('.score-answered').text( answers.length );
}

/**
 * Return the correct answer message either from the quiz json file or a default message 
 * @param {number} idx: The index in the questions array to find the message for
 * @return The correct answer message
 */
function correctMessage( idx ) {
	if ( Object.keys( QUESTIONS[idx]).includes( 'correctMessage' ) ) {
		return QUESTIONS[idx].correctMessage;
	}
	return "That's right!";
}

/**
 * Return the incorrect answer message either from the quiz json file or a default message 
 * @param {number} idx: The index in the questions array to find the message for
 * @return The incorrect answer message
 */
function incorrectMessage( idx ) {
	if ( Object.keys( QUESTIONS[idx]).includes( 'incorrectMessage' ) ) {
		return QUESTIONS[idx].incorrectMessage;
	}
	return `Good try, but the answer is ${QUESTIONS[idx].answers[QUESTIONS[idx].correctAnswer]}`;
}

/**
 * Update the question number text
 */
function updateQuestionNumber() {
	$('.question-number').text( ( currentQuestion + 1) );
	let q = ( QUESTIONS.length < QUESTIONS_PER_SESSION ) ? QUESTIONS.length : QUESTIONS_PER_SESSION;
	$('.question-total').text(q);
}

/**
 * Hide the answers on a question page other than the correct answer and the answer that was chosen
 * @param {String} method How to hide the other buttons. 
 *            hide: Just don't display the buttons (default)
 *            slide: Slide up the buttons to hide them
 */
function collapseAnswers(method="hide") {
	for ( let i = 0 ; i < QUESTIONS[asked[currentQuestion]].answers.length ; i++ ) {
		if ( i ===  QUESTIONS[asked[currentQuestion]].correctAnswer ) {
			$(`label[for="ans${i}"]`).addClass('lbl-button-correct');
		} else if ( i === answers[currentQuestion] ) {
			$(`label[for="ans${i}`).addClass('lbl-button-answered');
		} else {
			if ( method.localeCompare("slide") === 0 ) {
				$(`label[for="ans${i}`).slideUp();
			} else {
				console.log(`trying to hide button ${i}`);
				$(`label[for="ans${i}`).addClass('no-display');
				$(`label[for="ans${i}`).attr('hidden', true);
			}
		}
	}
}

/**
 * Populate the start card with the quiz list from the external json file
 */
async function populateStartCard() {
	// TODO: This works okay with the two quizzes I have, but it would be good to make it display better 
	// if there were more buttons.
	// Display X at a time; display the forward and backwards arrows?
	// Use the same principles to decide how many buttons per row as the questions card?
	await loadQuizList();
	QUIZZES.forEach( function( quiz, idx ) {
		// We use the meaningless _idx attribute to help figure out which quiz we chose when the button is clicked
		$('.card-start').append(`
			<button _idx="${idx}" class="btn btn-quiz">${quiz.name}</button>`
		);
	});
}

/**
 * Display a random question from the list of unasked questions
 */
function displayRandomUnaskedQuestion() {
	displayQuestion( unasked[ Math.floor( Math.random() * unasked.length ) ] );
}

/**
 * Display a question
 * @param {Number} num The index from the QUESTIONS array of the question to display
 */
function displayQuestion( num ) {
	updateQuestionNumber();
	updateReply();
	console.log(`Asking question ${num}`);
	$('.question').text(`${QUESTIONS[num].question}`);
	let alreadyAsked = asked.includes( num );
	let alreadyAnswered = ( alreadyAsked && answers.length > asked.indexOf( num) );
	if ( !alreadyAsked ) {
		// Add the question number to the asked array and remove it from the unasked array
		asked.push(num);
		unasked.splice(unasked.indexOf(num), 1);
	}
	let html = "";
	QUESTIONS[num].answers.forEach( function( answer, i ) {
		html += `<input type="radio" name="answer" class="answer no-display" id="ans${i}" value="${i}">
		         <label for="ans${i}" class="lbl-button">${answer}</label>`;
	});
	$('.answer-list').html( html );
	// Previous button should be enabled unless we're on the first question
	$('.btn-prev').attr('disabled', ( currentQuestion === 0 ) );
	// Next button should be disabled if the question hasn't been answered
	$('.btn-next').attr('disabled', !alreadyAnswered );
	// Submit button should be disabled if the question has already been answered
	$('.btn-submit-answer').attr('disabled', alreadyAnswered);

	if ( alreadyAnswered ) {
		let ans =answers[currentQuestion];
		// Check the radio button that corresponds to the answer that was given
		$(`#ans${ans}`).attr('checked', true);
		// Disable all the radio buttons since we don't want to be able to make a selection
		$('input[type="radio"]:not(:checked)').attr('disabled', true);
		// Add the disabled styling to the labels (which we display like buttons)
		$('label[class="lbl-button"]').addClass('lbl-button-disabled');
		// Collapse the answers other than the one we chose and the correct answer
			if ( window.orientation === 90 || window.orientation === -90 ) {
			collapseAnswers();
		}
		// Add the answered (wrong) styling to the labels which corresponds to what we answered
		$(`label[for="ans${ans}`).addClass('lbl-button-answered');
		// Add the correct answer styling to the labe for the correct answer (this will override the styling for answered,
		// So if we selected the correct answer it will style it wrong, then restyle it correct)
		$(`label[for="ans${QUESTIONS[asked[currentQuestion]].correctAnswer}"]`).addClass('lbl-button-correct');
		// Display the reply text
		$('.answer-reply').slideDown();
		// Focus on the next question button
		$('.btn-next').focus();
	} else {
		// Hide the reply text
		$('.answer-reply').slideUp();
	}
}

/**
 * Return a results message based on the user's score. Use the messages from the quiz JSON file if available or 
 * default messages otherwise.
 * @param {Number} pct The percentage of correct answers
 */
function resultsMessage( pct ) {
	let message = "";
	if ( pct >= 1 ) {
		try {
			message = MESSAGES.perfect;
		} catch ( e ) {
			message = "Perfect!"
		};
	} else if ( pct >= 0.8 ) {
		try {
			message = MESSAGES.great;
		} catch ( e ) { 
			message = "Great Job!"
		}
	} else if ( pct >= 0.6 ) {
		try {
			message = MESSAGES.good;
		} catch ( e ) {
			message = "Good Job!"
		}
	} else if ( pct >= 0.4 ) {
		try {
			message = MESSAGES.bad;
		} catch ( e ) { 
			message = "Keep Trying!" 
		}
	} else {
		try {
			message = MESSAGES.terrible;
		} catch ( e ) {
			message = "Better Luck Next Time!"
		}
	}
	console.log( message );
	return message;
}

/**
 * Switch card display model to display the end card
 */
function displayEndCard() {
	$('.card-question').slideUp();
	$('.card-answers').slideUp();
	$('.score').slideUp();
	// How did we do?
	let numberQuestions = ( QUESTIONS.length < QUESTIONS_PER_SESSION ) ? QUESTIONS.length : QUESTIONS_PER_SESSION;
	$('.results-msg').text( resultsMessage( score / numberQuestions ) );
	$('.card-end').slideDown();
	$('.btn-try-again').focus();
}

/**
 * Update the reply text based on the current question and answer
 * This does not display or hide the element, just updates the text.
 */
function updateReply() {
	if ( currentQuestion >= answers.length ) {
		$('.answer-reply').html(`<p></p>`);
		return;
	}
	let correct = ( QUESTIONS[asked[currentQuestion]].correctAnswer === answers[currentQuestion] );
	console.log(`Question: ${currentQuestion} Expected answer: ${QUESTIONS[asked[currentQuestion]].correctAnswer}, answer: ${answers[currentQuestion]}`);
	if ( correct ) {
		$('.answer-reply').html(`<p>${correctMessage(asked[currentQuestion])}</p>`);
	} else {
		$('.answer-reply').html(`<p>${incorrectMessage(asked[currentQuestion])}</p>`);
	}
}

/**
 * Apply a theme from an external CSS file
 * @param {String} theme The theme css file. Should be relative to root or an absolute path
 */
function loadTheme( theme ) {
	$('head').append(`<link href="${theme}" rel="stylesheet" type="text/css">`);
}

/**
 * Load a quiz from an external JSON file
 * @param {String} quiz The quiz JSON file. Should be relative to root or an absolute path
 */
async function loadQuiz( quiz ) {
	let response = await fetch( quiz );
	let json = await response.json();
	QUESTIONS = json.questions;
	MESSAGES = json.messages;
	// These functions need to be called after the json file is loaded and parsed.
	
	updateQuestionNumber();
	console.log( `loaded ${QUESTIONS.length} questions` );
	reset();
}

/**
 * Load the list of quizzes from the external JSON file in the hardcoded QUIZ_FILE constant.
 */
async function loadQuizList() {
	let response = await fetch( QUIZ_FILE );
	let json = await response.json();
	QUIZZES = json.quizzes;
	console.log( `loaded ${QUIZZES.length} quizzes` );
}

/**
 * Reset the global state variables to the initial states
 * Only reset the list of unasked questions if all questions have been asked
 */
function reset() {
	if ( unasked.length === 0 ) {
		for ( let i = 0 ; i < QUESTIONS.length ; i++ ) {
			unasked.push(i);
		}
	}
	asked.splice(0, asked.length);
	answers.splice(0, answers.length);
	score = 0;
	currentQuestion = 0;
}

/**
 * Reset all global state variables to the initial states
 * This resets the unasked question list as well, so should be used when changing quizzes.
 */
function fullReset() {
	unasked.splice(0, unasked.length);
	asked.splice(0, asked.length);
	QUESTIONS.splice(0, QUESTIONS.length);
	answers.splice(0, answers.length);
	score = 0;
	currentQuestion = 0;
}

/**
 * Program start. Create the initial card view and activate all the event handlers
 */
function main() {
	populateStartCard();
	// Activate the event handlers
	$( nextQuestionHandler );
	$( previousQuestionHandler );
	$( tryAgainHandler );
	$( restartHandler );
	$( submitHandler );
	$( quizHandler );
}

/* ********************************
 *		EVENT HANDLERS		  *
 **********************************/

 /**
  * Event handler when previous questions button is clicked
  */
function previousQuestionHandler() {
	$('.btn-prev').click( function( event ) {
		event.stopPropagation();
		currentQuestion--;
		console.log(`before displaying question answers: ${answers}`);
		displayQuestion( asked[currentQuestion] );
		$('.btn-submit-answer').attr('disabled', true);
		$('.btn-next').attr('disabled', false);
		console.log(`after displaying question answers: ${answers}`);
	});
}

/**
 * Event handler when a quiz button from the list of quizzes is clicked
 */
function quizHandler() {
	$('.card-start').on('click', '.btn-quiz', async function( event ) {
		let quiz = $(this).attr('_idx');
		loadTheme( QUIZZES[quiz].theme );
		// We have to wait for the quiz to load before we can proceed
		await loadQuiz( QUIZZES[quiz].quiz );
		$('.head').find('h1').text( QUIZZES[quiz].name );
		$('.card-start').slideUp();
		$('.card-question').slideDown();
		$('.card-answers').slideDown();
		displayRandomUnaskedQuestion();
	})
}

/**
 * Event handler when an answer is submitted
 */
function submitHandler() {
	$('.card-answers').on('change', '.answer', function( event ) {
		event.preventDefault();
		console.log('called the submit answer handler');
		event.stopPropagation();
		let answer = Number($('input:radio[name=answer]:checked').val());
		// Did we get an answer?
		if ( answer === NaN || answer === undefined ) return;
		console.log(`pushing ${answer} to the answers array`);
		answers.push(answer);
		// Update the reply text about your answer
		updateReply();
		if ( answer === QUESTIONS[currentQuestion].correctAnswer ) {
			score++;
		}
		// Update the score 
		updateScore();

		console.log(answer);
		// Change button activation
		$('.btn-submit-answer').attr('disabled', true);
		$('.btn-next').attr('disabled', false);
		$('label[class="lbl-button"]').addClass('lbl-button-disabled');
		$(`label[for="ans${answers[currentQuestion]}`).addClass('lbl-button-answered');
		$(`label[for="ans${QUESTIONS[asked[currentQuestion]].correctAnswer}"]`).addClass('lbl-button-correct');
		// Show the text about the answer
		console.log(`classes: ${$('.answer-reply').attr('class')}`);
		// Collapse the answers other than the one we chose and the correct answer
		if ( window.orientation === 90 || window.orientation === -90 ) {
			collapseAnswers();
		}
		$('.answer-reply').slideDown();
		// Focus on the next question button
		$('.btn-next').focus();
	});
}

/**
 * Event handler when next question button is clicked
 */
function nextQuestionHandler() {
	$('.card-answers').on('click', '.btn-next', function( event ) {
		event.stopPropagation();
		currentQuestion++;
		let numberQuestions = ( QUESTIONS.length < QUESTIONS_PER_SESSION ) ? QUESTIONS.length : QUESTIONS_PER_SESSION;
		if ( answers.length === numberQuestions ) {
			displayEndCard();
		} else if ( currentQuestion < asked.length ) {
			displayQuestion( asked[currentQuestion] );
		} else {
			displayRandomUnaskedQuestion();
		}
	});
}

/**
 * Event handler when try again button is clicked
 */
function tryAgainHandler() {
	$('.btn-try-again').click( function( event ) {
		reset();
		displayRandomUnaskedQuestion();
		$('.card-end').slideUp();
		$('.card-question').slideDown();
		$('.card-answers').slideDown();
		$('.score').slideDown();
		updateScore();
		updateQuestionNumber();
	});
}

/**
 * Event handler when restart button is clicked
 */
function restartHandler() {
	$('.btn-restart').click( function( event ) {
		console.log('Calling restart handler');
		fullReset();
		$('.card-end').slideUp();
		$('.card-start').slideDown();
		$('.score').slideDown();
		updateScore();
		$('.question-number').text('_');
		$('.question-total').text('_');
		$('.head').find('h1').text( 'Quiz about Something!' );
	});
}

main();
