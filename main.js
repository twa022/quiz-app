"using strict";

/* ************************************ *
 *			     GLOBALS			    *
 * ************************************ */

/* The JSON file containing the list of quizzes */
const QUIZ_LIST_FILE = 'quizzes.json';
/* The maximum number of quesitons per session */
const QUESTIONS_PER_SESSION = 5;
/* The maximum number of quizzes to display per page on the quiz list */
const QUIZZES_PER_PAGE = 6;

/* Stored variables about the quiz list and the currently runnign quiz */
const STORE = {
	/* The list of quiz objects of available quizzes. Will be loaded from the external QUIZ_LIST_FILE json file */
	quizList: [],
	
	/* ******************************* *
	 *     Currently playing quiz      *
	 * ******************************* */

	/* Questions will be loaded from an external json file */
	questions: [],
	/* The results messages loaded from the external quiz json file */
	messages: {},
	/* The question which you are currently displaying */
	currentQuestion: 0,
	/* Your current number of correct questions */
	score: 0,
	/* The numbers of the questions that have been asked in the order they were asked */
	asked: [],
	/* The numbers of the questions that have not yet been asked */
	unasked: [],
	/* The answers you gave to the questions in the order they were asked */
	answered: [],
};

/* ********************************
 *		   FUNCTIONS			*
 **********************************/

 /**
  * Update the score text
  */
function updateScore() {
	$('.score').text( `${STORE.score} / ${STORE.answered.length}` );
}

/**
 * Return the correct answer message either from the quiz json file or a default message 
 * @param {number} idx: The index in the questions array to find the message for
 * @return The correct answer message
 */
function correctMessage( idx ) {
	if ( Object.keys( STORE.questions[idx]).includes( 'correctMessage' ) ) {
		return STORE.questions[idx].correctMessage;
	}
	return "That's right!";
}

/**
 * Return the incorrect answer message either from the quiz json file or a default message 
 * @param {number} idx: The index in the questions array to find the message for
 * @return The incorrect answer message
 */
function incorrectMessage( idx ) {
	if ( Object.keys( STORE.questions[idx]).includes( 'incorrectMessage' ) ) {
		return STORE.questions[idx].incorrectMessage;
	}
	return `Good try, but the answer is ${STORE.questions[idx].answers[STORE.questions[idx].correctAnswer]}`;
}

/**
 * Update the question number text
 */
function updateQuestionNumber() {
	let q = ( STORE.questions.length < QUESTIONS_PER_SESSION ) ? STORE.questions.length : QUESTIONS_PER_SESSION;
	$('.question-number').text( `${STORE.currentQuestion + 1} / ${q}` );
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
	for ( let i = 0 ; i < STORE.questions[STORE.asked[STORE.currentQuestion]].answers.length ; i++ ) {
		if ( i ===  STORE.questions[STORE.asked[STORE.currentQuestion]].correctAnswer ) {
			$(`button[_answer="${i}"]`).addClass('btn-answer-correct');
		} else if ( i === STORE.answered[STORE.currentQuestion] ) {
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

/**
 * Display the list of quizzes
 * @param {Number} start The index of the STORE.quizList array to start finding displayable quizzes
 * @param {String} filter A text search term to filter the resulting list
 * @param {Boolean} reverseOrd Whether or not to look backwards through the quiz list from the start index
 */
function displayQuizList( start = 0, filter = "", reverseOrd = false ) {
	if ( start < 0 ) {
		start = 0;
	}
	if ( start >= STORE.quizList.length ) {
		start = ( reverseOrd ) ? STORE.quizList.length - 1 : STORE.quizList.length - QUIZZES_PER_PAGE;
	}
	$('.quizlist').html('');
	if ( filter ) {
		$('.clear-search').removeClass('no-display');
		$('.btn-random-quiz').addClass('no-display');
		let found = 0;
		filter = filter.toLowerCase();
		$('.btn-quizlist-next').prop('disabled', !reverseOrd );
		$('.btn-quizlist-prev').prop('disabled', ( reverseOrd || start === 0 ) );
		for ( let idx = start ; ( reverseOrd ) ? idx >= 0 : idx < STORE.quizList.length && found <= QUIZZES_PER_PAGE ; (reverseOrd) ? idx-- : idx++ ) {
			console.log(`Checking ${STORE.quizList[idx].name} (keywords: ${STORE.quizList[idx].keywords}) against filter ${filter}`);
			if ( STORE.quizList[idx].name.toLowerCase().includes( filter ) || STORE.quizList[idx].keywords.some( k => { return k.includes( filter ) } ) ) {
				// We search for one more match than we actually want to display. If we find it 
				// we know there are more matches not displayed and we should enable the next / previous page button
				if ( found === QUIZZES_PER_PAGE ) {
					$( function() { return (reverseOrd) ? '.btn-quizlist-prev' : '.btn-quizlist-next'; }).prop('disabled', false);
					break;
				}
				let html = `<button _idx="${idx}" class="btn btn-quiz">${STORE.quizList[idx].name}</button>`;
				( reverseOrd ) ? $('.quizlist').prepend( html ) : $('.quizlist').append( html );
				found++;
			}
		}
	} else {
		let lastQuiz;
		if ( reverseOrd ) {
			lastQuiz = ( start - QUIZZES_PER_PAGE + 1 >= 0 ) ? start - QUIZZES_PER_PAGE + 1 : 0;
		} else {
			lastQuiz = ( STORE.quizList.length > start + QUIZZES_PER_PAGE ) ? start + QUIZZES_PER_PAGE - 1 : STORE.quizList.length - 1;
		}
		$('.btn-quizlist-next').prop('disabled', start >= STORE.quizList.length - 1 || lastQuiz >= STORE.quizList.length - 1 );
		$('.btn-quizlist-prev').prop('disabled', start <= 0 || lastQuiz <= 0 );
		$('.clear-search').addClass('no-display');
		$('.btn-random-quiz').removeClass('no-display');
		for ( let idx = start ; ( reverseOrd ) ? idx >= lastQuiz: idx <= lastQuiz ; (reverseOrd) ? idx-- : idx++ ) {
			let html = `<button _idx="${idx}" class="btn btn-quiz">${STORE.quizList[idx].name}</button>`;
			( reverseOrd ) ? $('.quizlist').prepend( html ) : $('.quizlist').append( html );
		}
	$('.search-quizzes').focus();
	}
}

/**
 * Populate the start card with the quiz list from the external json file
 */
async function populateStartCard() {
	await loadQuizList();
	displayQuizList();
}

/**
 * Display a random question from the list of unasked questions
 */
function displayRandomUnaskedQuestion() {
	displayQuestion( STORE.unasked[ Math.floor( Math.random() * STORE.unasked.length ) ] );
}

/**
 * Display a question
 * @param {Number} num The index from the STORE.questions array of the question to display
 */
function displayQuestion( num ) {
	updateQuestionNumber();
	updateReply();
	console.log(`Asking question ${num}`);
	$('.question-ctr').html(`<p class="question">${STORE.questions[num].question}</p>`);
	let alreadyAsked = STORE.asked.includes( num );
	let alreadyAnswered = ( alreadyAsked && STORE.answered.length > STORE.asked.indexOf( num) );
	if ( !alreadyAsked ) {
		// Add the question number to the asked array and remove it from the unasked array
		STORE.asked.push(num);
		STORE.unasked.splice(STORE.unasked.indexOf(num), 1);
		if ( STORE.unasked.length === 0 ) {
			for ( let i = 0 ; i < STORE.questions.length ; i++ ) {
				if ( !STORE.asked.includes(i) ) {
					STORE.unasked.push(i);
				}
			}
		}
	}
	$('.answer-list').html(''); // Clear out the answer buttons from any previous iterations
	STORE.questions[num].answers.forEach( function( answer, i ) {
		$('.answer-list').append(`<button class="btn btn-answer answer" _answer=${i}>${answer}</button>`);
	});
	// Previous button should be enabled unless we're on the first question
	$('.btn-prev').prop('disabled', ( STORE.currentQuestion === 0 ) );
	// Next button should be disabled if the question hasn't been answered
	$('.btn-next').prop('disabled', !alreadyAnswered );
	// Submit button should be disabled if the question has already been answered
	$('.btn-submit-answer').prop('disabled', alreadyAnswered);

	if ( alreadyAnswered ) {
		let ans = STORE.answered[STORE.currentQuestion];
		// Add the disabled styling to the labels (which we display like buttons)
		$('.answer-list').find('button').prop('disabled', true);
		// Collapse the answers other than the one we chose and the correct answer
		collapseAnswers();
		// Add the answered (wrong) styling to the labels which corresponds to what we answered
		$(`button[_answer="${ans}"]`).addClass('btn-answer-answered');
		// Add the correct answer styling to the labe for the correct answer (this will override the styling for answered,
		// So if we selected the correct answer it will style it wrong, then restyle it correct)
		$(`button[_answer="${STORE.questions[STORE.asked[STORE.currentQuestion]].correctAnswer}"]`).addClass('btn-answer-correct');
		// Display the reply text
		$('.answer-reply').slideDown();
		// Focus on the next question button
		$('.btn-next').focus();
	} else {
		// Hide the reply text
		$('.answer-reply').slideUp();
	}
	$('.question').focus();
}

/**
 * Return a result message based on the user's score. Use the messages from the quiz JSON file if available or 
 * default messages otherwise.
 * @param {Number} pct The percentage of correct answers
 * @returns The result message string
 */
function resultMessage( pct ) {
	let message;
	if ( pct >= 1 ) {
		if ( STORE.messages.hasOwnProperty('perfect') ) {
			message = STORE.messages.perfect;
		} else {
			message = "Perfect!"
		};
	} else if ( pct >= 0.8 ) {
		if ( STORE.messages.hasOwnProperty('great') ) {
			message = STORE.messages.great;
		} else { 
			message = "Great Job!"
		}
	} else if ( pct >= 0.6 ) {
		if ( STORE.messages.hasOwnProperty('good') ) {
			message = STORE.messages.good;
		} else { 
			message = "Good Job!"
		}
	} else if ( pct >= 0.4 ) {
		if ( STORE.messages.hasOwnProperty('bad') ) {
			message = STORE.messages.bad;
		} else { 
			message = "Keep Trying!" 
		}
	} else {
		if ( STORE.messages.hasOwnProperty('terrible') ) {
			message = STORE.messages.terrible;
		} else { 
			message = "Better Luck Next Time!"
		}
	}
	console.log( message );
	return message;
}

/**
 * Display the summary card
 */
function displayEndCard() {
	$('.card-question').slideUp();
	$('.card-answers').slideUp();
	$('.card-score').slideUp();
	// How did we do?
	let numberQuestions = ( STORE.questions.length < QUESTIONS_PER_SESSION ) ? STORE.questions.length : QUESTIONS_PER_SESSION;
	if ( numberQuestions === 0 ) {
		$('.result-msg').text("Only the owl and planets quiz are currently available. Try one of those!");
		$('.btn-try-again').prop('disabled', true);
		$('.card-result').slideDown();
	} else {
		$('.btn-try-again').prop('disabled', false);
		$('.result-msg').text( resultMessage( STORE.score / numberQuestions ) );
		$('.card-result').slideDown();
	}
	$('.results-msg').focus();
}

/**
 * Update the reply text based on the current question and answer
 * This does not display or hide the element, just updates the text.
 */
function updateReply() {
	if ( STORE.currentQuestion >= STORE.answered.length ) {
		$('.answer-reply').html(`<p></p>`);
		return;
	}
	let correct = ( STORE.questions[STORE.asked[STORE.currentQuestion]].correctAnswer === STORE.answered[STORE.currentQuestion] );
	console.log(`Question: ${STORE.currentQuestion} Expected answer: ${STORE.questions[STORE.asked[STORE.currentQuestion]].correctAnswer}, answer: ${STORE.answered[STORE.currentQuestion]}`);
	if ( correct ) {
		$('.answer-reply').html(`<p>${correctMessage(STORE.asked[STORE.currentQuestion])}</p>`);
	} else {
		$('.answer-reply').html(`<p>${incorrectMessage(STORE.asked[STORE.currentQuestion])}</p>`);
	}
}

/**
 * Apply a theme from an external CSS file
 * @param {String} themeFile The theme css file. Should be relative to root or an absolute path
 */
async function loadTheme( themeFile ) {
	let ok = true;
	try { 
		// On a 404 or other load issue, fetch doesn't throw an error, but sets the ok key to false
		// Record if there was an issue so we can fail gracefully-ish
		await fetch( themeFile ).then( response => { if ( !response.ok ) ok = false; } );
	} catch ( e ) {
		console.log(`Unable to load theme file ${themeFile}`)
		return;
	}
	if ( !ok ) {
		return;
	}
	console.log('Applying theme');
	$('head').append(`<link href="${themeFile}" rel="stylesheet" type="text/css" class="quiz-theme">`);
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
		STORE.questions = [];
		STORE.messages = [];
		return;
	}
	STORE.questions = json.questions;
	STORE.messages = json.messages;
	// These functions need to be called after the json file is loaded and parsed.
	
	updateQuestionNumber();
	console.log( `loaded ${STORE.questions.length} questions` );
	reset();
}

/**
 * Load the list of quizzes from the external JSON file in the hardcoded QUIZ_LIST_FILE constant.
 */
async function loadQuizList() {
	let response;
	let json;
	try {
		response = await fetch( QUIZ_LIST_FILE );
		json = await response.json();
	} catch ( e ) {
		STORE.quizList = null;
		return;
	}
	STORE.quizList = json.quizzes;
	console.log( `loaded ${STORE.quizList.length} quizzes` );
}

/**
 * Reset the global state variables to the initial states
 * @param {Boolean} full Whether or not to do a full reset
 *         false (default) Only reset the list of unasked questions if all questions have been asked
 *         true: Reset all the globals to their initial empty state.
 */
function reset( full = false ) {
	if ( full ) {
		STORE.unasked.splice(0, STORE.unasked.length );
		STORE.questions.splice(0, STORE.questions.length);
	} else { // do a partial reset (doing the same quiz)
		// Reset the unasked question array
		if ( STORE.unasked.length === 0 ) {
			for ( let i = 0 ; i < STORE.questions.length ; i++ ) {
				STORE.unasked.push(i);
			}
		}
	}
	STORE.asked.splice(0, STORE.asked.length);
	STORE.answered.splice(0, STORE.answered.length);
	STORE.score = 0;
	STORE.currentQuestion = 0;
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
		STORE.currentQuestion--;
		console.log(`before displaying question answers: ${STORE.answered}`);
		displayQuestion( STORE.asked[STORE.currentQuestion] );
		$('.btn-submit-answer').prop('disabled', true);
		$('.btn-next').prop('disabled', false);
		console.log(`after displaying question answers: ${STORE.answered}`);
	});
}

/**
 * Event handler when a quiz button from the list of quizzes is clicked
 */
function quizHandler() {
	$('.card-search').on('click', '.btn-quiz', async function( event ) {
		let quiz = $(this).attr('_idx');
		if ( quiz === 'random' ) {
			quiz = Math.floor( Math.random() * STORE.quizList.length );
		}
		loadTheme( STORE.quizList[quiz].theme );
		// We have to wait for the quiz to load before we can proceed
		await loadQuiz( STORE.quizList[quiz].quiz );
		$('head').find('title').text( `${STORE.quizList[quiz].name} Quiz` );
		if ( !STORE.questions || STORE.questions.length === 0 ) {
			$('header').find('h1').text( 'Error loading quiz' );
			$('.final-score').addClass('no-display');
			$('.card-search').slideUp();
			displayEndCard();
			return;
		}
		$('header').find('h1').text( `${STORE.quizList[quiz].name} Quiz` );
		$('.card-search').slideUp();
		$('.card-score').slideDown();
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
		if ( answer === NaN || answer === undefined ) {
			return;
		}
		console.log(`pushing ${answer} to the answers array`);
		STORE.answered.push(answer);
		// Update the reply text about your answer
		updateReply();
		if ( answer === STORE.questions[STORE.asked[STORE.currentQuestion]].correctAnswer ) {
			STORE.score++;
		}
		// Update the score 
		updateScore();
		// Change button activation
		$('.btn-next').prop('disabled', false);
		$('button.answer').prop('disabled', true);;
		$(`button[_answer="${STORE.answered[STORE.currentQuestion]}`).addClass('btn-answer-answered');
		$(`button[_answer="${STORE.questions[STORE.asked[STORE.currentQuestion]].correctAnswer}"]`).addClass('btn-answer-correct');
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
		STORE.currentQuestion++;
		let numberQuestions = ( STORE.questions.length < QUESTIONS_PER_SESSION ) ? STORE.questions.length : QUESTIONS_PER_SESSION;
		if ( STORE.answered.length === numberQuestions ) {
			displayEndCard();
		} else if ( STORE.currentQuestion < STORE.asked.length ) {
			displayQuestion( STORE.asked[STORE.currentQuestion] );
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
		$('.card-result').slideUp();
		$('.card-question').slideDown();
		$('.card-answers').slideDown();
		$('.card-score').slideDown();
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
		$('.card-result').slideUp();
		$('.search-quizzes').val('');
		displayQuizList();
		$('.card-search').slideDown();
		updateScore();
		$('.question-number').text('_ / _');
		$('head').find('title').text( 'What Is... Trivia?' );
		$('header').find('h1').text( 'What Is... Trivia?' );
		$('head').find('link[class="quiz-theme"]').remove();
	});
}

/**
 * Event handler when user enters / changes the search term in the quiz list search field.
 * Called any time the text in the input field changes
 */
function searchQuizListHandler() {
	$('.search-quizzes').on('input', function( event ) {
		displayQuizList( 0, $('.search-quizzes').val() );
	});
}

/**
 * Event handler when the next page button on the quiz list page is clicked 
 */
function nextQuizPageHandler() {
	$('.btn-quizlist-next').click( function( event ) {
		console.log(`clicked next quiz list page, will display starting with ${Number($('.btn-quiz:last-child').attr('_idx')) + 1}`);
		displayQuizList( Number($('.btn-quiz:last-child').attr('_idx')) + 1, $('.search-quizzes').val() );
	});
}

/**
 * Event handler when the previous page button on the quiz list page is clicked 
 */
function previousQuizPageHandler() {
	$('.btn-quizlist-prev').click( function( event ) {
		console.log(`clicked previous quiz list page, will display ending with ${Number($('.btn-quiz:first-child').attr('_idx')) - 1}`);
		displayQuizList( Number($('.btn-quiz:first-child').attr('_idx')) - 1, $('.search-quizzes').val(), true );
	});
}

/**
 * Event handler when the clear search field button is clicked
 * (Clear the search field and reset the list of displayed quizzes to default (starts at index 0, no filter))
 */
function clearSearchHandler() {
	$('.clear-search').click( function( event ) {
		$('.search-quizzes').val('');
		displayQuizList();
	})
}

$( document ).ready( function() { main(); } );
