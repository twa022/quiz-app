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

let QUIZZES_FILTERED = [];
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

const QUIZZES_PER_PAGE = 6;
/* ********************************
 *		   FUNCTIONS			*
 **********************************/

 /**
  * Update the score text
  */
function updateScore() {
	$('.score-number').text( `${score} / ${answers.length}` );
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
	let q = ( QUESTIONS.length < QUESTIONS_PER_SESSION ) ? QUESTIONS.length : QUESTIONS_PER_SESSION;
	$('.question-number').text( `${currentQuestion + 1} / ${q}` );
}

/**
 * Hide the answers on a question page other than the correct answer and the answer that was chosen
 * @param {String} method How to hide the other buttons. 
 *            hide: Just don't display the buttons (default)
 *            slide: Slide up the buttons to hide them
 */
function collapseAnswers(method="hide") {
	// Only collapse answers on landscape or if the window height is particularly short
	if ( !( window.orientation === 90 || window.orientation === -90 || window.innerHeight < 640 ) ) {
		return;
	}
	for ( let i = 0 ; i < QUESTIONS[asked[currentQuestion]].answers.length ; i++ ) {
		if ( i ===  QUESTIONS[asked[currentQuestion]].correctAnswer ) {
			$(`button[_answer="${i}"]`).addClass('btn-answer-correct');
		} else if ( i === answers[currentQuestion] ) {
			$(`button[_answer="${i}"`).addClass('btn-answer-answered');
		} else {
			if ( method.localeCompare("slide") === 0 ) {
				$(`button[_answer="${i}"`).slideUp();
			} else {
				$(`button[_answer="${i}"`).addClass('no-display');
			}
		}
	}
}

function displayQuizList( start = 0, filter = "", prev = false ) {
	let lastQuiz;
	if ( start < 0 ) start = 0;
	if ( start >= QUIZZES.length ) start = QUIZZES.length - QUIZZES_PER_PAGE;
	$('.quizlist').html('');
	if ( filter ) {
		$('.clear-search').removeClass('no-display');
		$('.btn-random-quiz').addClass('no-display');
		let found = 0;
		filter = filter.toLowerCase();
		if ( prev ) {
			$('.btn-quizlist-next').attr('disabled', false);
			$('.btn-quizlist-prev').attr('disabled', true);
			for ( let idx = start ; idx >= 0 && found <= QUIZZES_PER_PAGE ; idx-- ) {
				console.log(`Checking ${QUIZZES[idx].name} (keywords: ${QUIZZES[idx].keywords}) against filter ${filter}`);
				if ( QUIZZES[idx].name.toLowerCase().includes( filter ) || QUIZZES[idx].keywords.some( k => { return k.includes( filter ) } ) ) {
					// We search for one more match than we actually want to display. If we find it 
					// we know there are more matches not displayed and we should enable the next page button
					if ( found === QUIZZES_PER_PAGE ) {
						$('.btn-quizlist-prev').attr('disabled', false);
						break;
					}
					$('.quizlist').prepend(`
						<button _idx="${idx}" class="btn btn-quiz">${QUIZZES[idx].name}</button>`
					);
					found++;
				}
			}			
		} else {
			$('.btn-quizlist-next').attr('disabled', true);
			$('.btn-quizlist-prev').attr('disabled', ( start === 0 ) );
			for ( let idx = start ; idx < QUIZZES.length && found <= QUIZZES_PER_PAGE ; idx++ ) {
				if ( QUIZZES[idx].name.toLowerCase().includes( filter ) || QUIZZES[idx].keywords.some( k => { return k.includes( filter ) } ) ) {
					// We search for one more match than we actually want to display. If we find it 
					// we know there are more matches not displayed and we should enable the next page button
					if ( found === QUIZZES_PER_PAGE ) {
						$('.btn-quizlist-next').attr('disabled', false);
						break;
					}
					$('.quizlist').append(`
						<button _idx="${idx}" class="btn btn-quiz">${QUIZZES[idx].name}</button>`
					);
					found++;
				}
			}
		}
	} else {
		$('.btn-quizlist-prev').attr('disabled', ( start === 0 ) );
		if ( QUIZZES.length > start + QUIZZES_PER_PAGE ) {
			lastQuiz = start + QUIZZES_PER_PAGE;
			$('.btn-quizlist-next').attr('disabled', false);
		} else {
			lastQuiz = QUIZZES.length;
			$('.btn-quizlist-next').attr('disabled', true);
		}
		$('.clear-search').addClass('no-display');
		$('.btn-random-quiz').removeClass('no-display');
		for ( let idx = start ; idx < lastQuiz ; idx++ ) {
			$('.quizlist').append(`
				<button _idx="${idx}" class="btn btn-quiz">${QUIZZES[idx].name}</button>`
			);
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
	displayQuizList();
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
	$('.answer-list').html(''); // Clear out the answer buttons from any previous iterations
	QUESTIONS[num].answers.forEach( function( answer, i ) {
		$('.answer-list').append(`<button class="btn btn-answer answer" _answer=${i}>${answer}</button>`);
	});
	// Previous button should be enabled unless we're on the first question
	$('.btn-prev').attr('disabled', ( currentQuestion === 0 ) );
	// Next button should be disabled if the question hasn't been answered
	$('.btn-next').attr('disabled', !alreadyAnswered );
	// Submit button should be disabled if the question has already been answered
	$('.btn-submit-answer').attr('disabled', alreadyAnswered);

	if ( alreadyAnswered ) {
		let ans = answers[currentQuestion];
		// Add the disabled styling to the labels (which we display like buttons)
		$('.answer-list').find('button').addClass('btn-answer-disabled');
		// Collapse the answers other than the one we chose and the correct answer
		collapseAnswers();
		// Add the answered (wrong) styling to the labels which corresponds to what we answered
		$(`button[_answer="${ans}"]`).addClass('btn-answer-answered');
		// Add the correct answer styling to the labe for the correct answer (this will override the styling for answered,
		// So if we selected the correct answer it will style it wrong, then restyle it correct)
		$(`button[_answer="${QUESTIONS[asked[currentQuestion]].correctAnswer}"]`).addClass('btn-answer-correct');
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
	let message;
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
	if ( numberQuestions === 0 ) {
		$('.results-msg').text("Only the owl and planets quiz are currently available. Try one of those!");
		$('.btn-try-again').attr('disabled', true);
		$('.btn-restart').focus();
	} else {
		$('.btn-try-again').attr('disabled', false);
		$('.results-msg').text( resultsMessage( score / numberQuestions ) );
		$('.btn-try-again').focus();
	}
	$('.card-end').slideDown();
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
 * @param {String} themeFile The theme css file. Should be relative to root or an absolute path
 */
async function loadTheme( themeFile ) {
	let ok = true;
	try { 
		await fetch( themeFile ).then( response => { if ( !response.ok) ok = false; } );
	} catch ( e ) {
		console.log(`Unable to load theme file ${themeFile}`)
		return;
	}
	if ( !ok ) return;
	console.log('Applying theme');
	$('head').append(`<link href="${themeFile}" rel="stylesheet" type="text/css">`);
}

/**
 * Load a quiz from an external JSON file
 * @param {String} quiz The quiz JSON file. Should be relative to root or an absolute path
 */
async function loadQuiz( quiz ) {
	let response;
	let json;
	try {
		response = await fetch( quiz );
		json = await response.json();
	} catch( e ) {
		console.log(`Unable to load quiz file ${quiz}`)
		QUESTIONS = [];
		MESSAGES = [];
		return;
	}
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
	let response;
	let json;
	try {
		response = await fetch( QUIZ_FILE );
		json = await response.json();
	} catch ( e ) {
		QUIZZES = null;
		return;
	}
	QUIZZES = json.quizzes;
	console.log( `loaded ${QUIZZES.length} quizzes` );
}

/**
 * Reset the global state variables to the initial states
 * @param {Boolean} full Whether or not to do a full reset
 *         false (default) Only reset the list of unasked questions if all questions have been asked
 *         true: Reset all the globals to their initial empty state.
 */
function reset( full = false ) {
	if ( full ) {
		unasked.splice(0, unasked.length );
		QUESTIONS.splice(0, QUESTIONS.length);
	} else { // do a partial reset (doing the same quiz)
		// Reset the unasked question array
		if ( unasked.length === 0 ) {
			for ( let i = 0 ; i < QUESTIONS.length ; i++ ) {
				unasked.push(i);
			}
		}
	}
	asked.splice(0, asked.length);
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
	$( searchQuizListHandler );
	$( nextQuizPageHandler );
	$( previousQuizPageHandler );
	$( clearSearchHandler );
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
		if ( quiz === 'random' ) {
			quiz = Math.floor( Math.random() * QUIZZES.length );
		}
		loadTheme( QUIZZES[quiz].theme );
		// We have to wait for the quiz to load before we can proceed
		await loadQuiz( QUIZZES[quiz].quiz );
		$('head').find('title').text( `${QUIZZES[quiz].name} Quiz` );
		if ( !QUESTIONS || QUESTIONS.length === 0 ) {
			$('header').find('h1').text( 'Error loading quiz' );
			$('.final-score').addClass('no-display');
			$('.card-start').slideUp();
			displayEndCard();
			return;
		}
		$('header').find('h1').text( `${QUIZZES[quiz].name} Quiz` );
		$('.card-start').slideUp();
		$('.score').slideDown();
		$('.card-question').slideDown();
		$('.card-answers').slideDown();
		displayRandomUnaskedQuestion();
	})
}

/**
 * Event handler when an answer is submitted
 */
function submitHandler() {
	$('.card-answers').on('click', '.answer', function( event ) {
		event.stopPropagation();
		event.preventDefault();
		console.log('called the submit answer handler');
		let answer = Number($(this).attr('_answer'));
		// Did we get an answer?
		if ( answer === NaN || answer === undefined ) return;
		console.log(`pushing ${answer} to the answers array`);
		answers.push(answer);
		// Update the reply text about your answer
		updateReply();
		if ( answer === QUESTIONS[asked[currentQuestion]].correctAnswer ) {
			score++;
		}
		// Update the score 
		updateScore();
		// Change button activation
		$('.btn-submit-answer').attr('disabled', true);
		$('.btn-next').attr('disabled', false);
		$('button[class="btn-answer"]').addClass('btn-answer-disabled');
		$(`button[_answer="${answers[currentQuestion]}`).addClass('btn-answer-answered');
		$(`button[_answer="${QUESTIONS[asked[currentQuestion]].correctAnswer}"]`).addClass('btn-answer-correct');
		// Collapse the answers other than the one we chose and the correct answer
		collapseAnswers();
		// Show the text about the answer
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
			$('.final-score').removeClass('no-display');
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
		reset( true );
		$('.card-end').slideUp();
		$('.card-start').slideDown();
		updateScore();
		$('.question-number').text('_ / _');
		$('head').find('title').text( 'Quiz about Something!' );
		$('header').find('h1').text( 'Quiz about Something!' );
	});
}

function searchQuizListHandler() {
	$('.search-quizzes').change( function( event ) {
		displayQuizList( 0, $('.search-quizzes').val() );
	});
}

function nextQuizPageHandler() {
	$('.btn-quizlist-next').click( function( event ) {
		console.log(`clicked next quiz list page, will display starting with ${Number($('.btn-quiz:last-child').attr('_idx')) + 1}`);
		displayQuizList( Number($('.btn-quiz:last-child').attr('_idx')) + 1, $('.search-quizzes').val() );
	});
}

function previousQuizPageHandler() {
	$('.btn-quizlist-prev').click( function( event ) {
		console.log(`clicked previous quiz list page, will display starting with ${Number($('.btn-quiz:first-child').attr('_idx')) - QUIZZES_PER_PAGE}`);
		if ( $('.search-quizzes').val() ) {
			displayQuizList( Number($('.btn-quiz:first-child').attr('_idx')) - 1, $('.search-quizzes').val(), true );
		} else {
			displayQuizList( Number($('.btn-quiz:first-child').attr('_idx')) - QUIZZES_PER_PAGE );
		}
	});
}

function clearSearchHandler() {
	$('.clear-search').click( function( event ) {
		$('.search-quizzes').val('');
		displayQuizList();
	})
}

main();
