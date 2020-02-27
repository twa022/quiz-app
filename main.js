/* *************************************
 *               GLOBALS               *
 ***************************************/

/* Questions will be loaded from an external json file */
const QUESTIONS = [];

const QUIZZES = [ 
    {
        name: 'Owl Quiz',
        theme: 'owl/owl.css',
        quiz: 'owl/owl.json'
    },
    {
        name: 'Planets Quiz',
        theme: 'planets/planets.css',
        quiz: 'planets/planets.json'
    }
];
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
 *           FUNCTIONS            *
 **********************************/

 /**
  * Update the score text
  */
function updateScore() {
    $('.score-correct').text( score );
    $('.score-answered').text( answers.length );
}

function correctMessage() {
    return "That's right!";
}

function incorrectMessage( idx ) {
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

function collapseAnswers(method="hide") {
    for ( let i = 0 ; i < QUESTIONS[asked[currentQuestion]].answers.length ; i++ ) {
        if ( i ===  QUESTIONS[asked[currentQuestion]].correctAnswer ) {
            $(`label[for="ans${i}"]`).addClass('lbl-button-correct');
        } else if ( i === answers[currentQuestion] ) {
            $(`label[for="ans${i}`).addClass('lbl-button-answered');
        } else {
           /* if ( method.localeCompare("slide") === 0 ) {
                $(`label[for="ans${i}`).slideUp();
            } else {*/
                console.log(`trying to hide button ${i}`);
                $(`label[for="ans${i}`).addClass('no-display');
                $(`label[for="ans${i}`).attr('hidden', true);
            // /}
        }
    }
}

function populateStartCard() {
    QUIZZES.forEach( function( quiz, idx ) {
        $('.card-start').append(`
            <button _idx="${idx}" class="btn btn-quiz btn-${quiz.name.toLowerCase().replace(/\s+/, '-')}">${quiz.name}</button>`
        );
    });
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
    for ( let i = 0 ; i < QUESTIONS[num].answers.length ; i++ ) {
        html += `<input type="radio" name="answer" class="answer no-display" id="ans${i}" value="${i}">
                    <label for="ans${i}" class="lbl-button">${QUESTIONS[num].answers[i]}</label>`;
    }
    $('.answer-list').html( html );
    // Previous button should be enabled unless we're on the first question
    $('.btn-prev').attr('disabled', ( currentQuestion === 0 ) );
    // Next button should be disabled if the question hasn't been answered
    $('.btn-next').attr('disabled', !alreadyAnswered );
    // Submit button should be disabled if the question has already been answered
    $('.btn-submit-answer').attr('disabled', alreadyAnswered);

    if ( alreadyAnswered ) {
        // Disable submit button
        //$('.btn-submit-answer').attr('disabled', true);
        // Check the radio button that corresponds to the answer that was given
        $(`#ans${answers[currentQuestion]}`).attr('checked', true);
        // Disable all the radio buttons since we don't want to be able to make a selection
        $('input[type="radio"]:not(:checked)').attr('disabled', true);
        // Add the disabled styling to the labels (which we display like buttons)
        $('label[class="lbl-button"]').addClass('lbl-button-disabled');
        //collapseAnswers();
        // Add the answered (wrong) styling to the labels which corresponds to what we answered
        $(`label[for="ans${answers[currentQuestion]}`).addClass('lbl-button-answered');
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
        //$('#ans0').focus();
        // Enable the submit button
        //$('.btn-submit-answer').attr('disabled', false);
        // Disable the next button until the user submits an answer
        //$('.btn-next').attr('disabled', true);
    }
}

/**
 * Switch card display model to display the end card
 */
function displayEndCard() {
    $('.card-questions').slideUp();
    $('.score').slideUp();
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

/* ********************************
 *        EVENT HANDLERS          *
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
 * Event handler when start quiz button is clicked
 */
function startHandler() {
    $('.btn-start').click( function( event ) {
        $('.card-start').slideUp();
        $('.card-questions').slideDown();
        displayQuestion( Math.floor( Math.random() * unasked.length ) );
    });
}

function quizHandler() {
    $('.card-start').on('click', '.btn-quiz', async function( event ) {
        let quiz = $(this).attr('_idx');
        loadTheme( QUIZZES[quiz].theme );
        await loadQuiz( QUIZZES[quiz].quiz );
        $('.card-start').slideUp();
        $('.card-questions').slideDown();
        displayQuestion( Math.floor( Math.random() * unasked.length ) );
    })
}

function loadTheme( theme ) {
    $('head').append(`<link href="${theme}" rel="stylesheet" type="text/css">`);
}

async function loadQuiz( quiz ) {
    let response = await fetch( quiz );
    let json = await response.json();
    json.forEach( function( q)  {
        QUESTIONS.push(q);
    });
    // These functions need to be called after the json file is loaded and parsed.
    
    updateQuestionNumber();
    console.log( `loaded ${QUESTIONS.length} questions` );
    reset();
}

/**
 * Event handler when an answer is submitted
 */
function submitHandler() {
    $('.card-questions').on('change', '.answer', function( event ) {
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
        //collapseAnswers("slide");
        $('.answer-reply').slideDown();
        // Focus on the next question button
        $('.btn-next').focus();
    });
}

/**
 * Event handler when next question button is clicked
 */
function nextQuestionHandler() {
    $('.card-questions').on('click', '.btn-next', function( event ) {
        event.stopPropagation();
        currentQuestion++;
        let noQ = ( QUESTIONS.length < QUESTIONS_PER_SESSION ) ? QUESTIONS.length : QUESTIONS_PER_SESSION;
        if ( answers.length === noQ ) {
            displayEndCard();
        } else if ( currentQuestion < asked.length ) {
            displayQuestion( asked[currentQuestion] );
        } else {
            displayQuestion( unasked[ Math.floor( Math.random() * unasked.length ) ] );
        }
    });
}

/**
 * Event handler when try again button is clicked
 */
function tryAgainHandler() {
    $('.btn-try-again').click( function( event ) {
        reset();
        displayQuestion( unasked[ Math.floor( Math.random() * unasked.length ) ] );
        $('.card-end').slideUp();
        $('.card-questions').slideDown();
        $('.score').slideDown();
        updateScore();
        updateQuestionNumber();
    });
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

function main() {
    populateStartCard();
    //$('.btn-start').focus();

    $( nextQuestionHandler );
    $( previousQuestionHandler );
    $( tryAgainHandler );
    $( submitHandler );
    $( startHandler );
    $( quizHandler );
}

main();
