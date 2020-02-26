/* *************************************
 *               GLOBALS               *
 ***************************************/

const QUESTIONS = [
    {
        'question': 'This is question 1',
        'answers': [ 'longer answer text blah de blah', 'ans2', 'ans3', 'ans4' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.answers[this.correctAnswer]}`; },
    },
    {
        'question': 'This is question 2',
        'answers': [ 'longer answer text blah de blah', 'ans2', 'ans3', 'ans4' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.answers[this.correctAnswer]}`; },
    },
    {
        'question': 'This is question 3',
        'answers': [ 'longer answer text blah de blah', 'ans2', 'ans3', 'ans4' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.answers[this.correctAnswer]}`; },
    },
    {
        'question': 'This is question 4',
        'answers': [ 'ans1', 'ans2', 'ans3', 'ans4' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.answers[this.correctAnswer]}`; },
    },
    {
        'question': 'This is question 5',
        'answers': [ 'ans1', 'ans2', 'ans3' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.answers[this.correctAnswer]}`; },
    },
    {
        'question': 'This is question 6',
        'answers': [ 'ans1', 'ans2', 'ans3', 'ans4', 'ans5' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.answers[this.correctAnswer]}`; },
    },
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

/**
 * Update the question number text
 */
function updateQuestionNumber() {
    $('.question-number').text( ( currentQuestion + 1) );
    let q = ( QUESTIONS.length < QUESTIONS_PER_SESSION ) ? QUESTIONS.length : QUESTIONS_PER_SESSION;
    $('.question-total').text(q);
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
        asked.push(num);
        unasked.splice(unasked.indexOf(num), 1);
    }
    console.log(`asked: ${asked}`);
    console.log(`answers: ${answers}`);
    console.log(`unasked: ${unasked}`);

    let html = "";
    for ( let i = 0 ; i < QUESTIONS[num].answers.length ; i++ ) {
        html += `<div class="radio-line">
                     <input type="radio" name="answer" class="answer no-display" id="ans${i}" value="${i}">
                    <label for="ans${i}" class="lbl-button">${QUESTIONS[num].answers[i]}</label>
                </div>`;
    }
    $('.answer-list').html( html );
    if ( currentQuestion === 0 ) {
        $('.btn-prev').attr('disabled', true);
    }
    if ( alreadyAnswered ) {
        $('.btn-answer-question').attr('disabled', true);
        console.log( 'applying check');
        $(`#ans${answers[currentQuestion]}`).attr('checked', true);
        console.log( 'done applying check');
        $('input[type="radio"]:not(:checked)').attr('disabled', true);
        $('label[class="lbl-button"]').addClass('lbl-button-disabled');
        $(`label[for="ans${answers[currentQuestion]}`).addClass('lbl-button-answered');
        $(`label[for="ans${QUESTIONS[asked[currentQuestion]].correctAnswer}"]`).addClass('lbl-button-correct');
        $('.answer-reply').slideDown();
        $('.btn-submit-answer').attr('disabled', true);
        $('.btn-next-question').focus();
    } else {
        $('.answer-reply').slideUp();
        $('#ans0').focus();
        $('.btn-submit-answer').attr('disabled', false);
        $('.btn-next-question').attr('disabled', true);
    }
 
    if ( currentQuestion > 0 ) {
        $('.btn-prev').attr('disabled', false);
    }
}

/**
 * Switch card display model to display the end card
 */
function displayEndCard() {
    $('.card-questions').slideUp();
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
        $('.answer-reply').html(`<p>${QUESTIONS[asked[currentQuestion]].correctMessage()}</p>`);
    } else {
        $('.answer-reply').html(`<p>${QUESTIONS[asked[currentQuestion]].incorrectMessage()}</p>`);
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
        $('.btn-next-question').attr('disabled', false);
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
        $('.btn-next-question').attr('disabled', false);
        $('label[class="lbl-button"]').addClass('lbl-button-disabled');
        $(`label[for="ans${answers[currentQuestion]}`).addClass('lbl-button-answered');
        $(`label[for="ans${QUESTIONS[asked[currentQuestion]].correctAnswer}"]`).addClass('lbl-button-correct');
        // Show the text about the answer
        console.log(`classes: ${$('.answer-reply').attr('class')}`);
        $('.answer-reply').slideDown();
        // Focus on the next question button
        $('.btn-next-question').focus();
    });
}

/**
 * Event handler when next question button is clicked
 */
function nextQuestionHandler() {
    $('.card-questions').on('click', '.btn-next-question', function( event ) {
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
    updateQuestionNumber();
    reset();
    $('.btn-start').focus();

    $( nextQuestionHandler );
    $( previousQuestionHandler );
    $( tryAgainHandler );
    $( submitHandler );
    $( startHandler );
}

main();
