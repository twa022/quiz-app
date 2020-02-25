/* *************************************
 *               GLOBALS               *
 ***************************************/

const QUESTIONS = [
    {
        'question': 'This is question 1',
        'answers': [ 'ans1', 'ans2', 'ans3', 'ans4' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.correctAnswer}`; },
    },
    {
        'question': 'This is question 2',
        'answers': [ 'ans1', 'ans2', 'ans3', 'ans4' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.correctAnswer}`; },
    },
    {
        'question': 'This is question 3',
        'answers': [ 'ans1', 'ans2', 'ans3', 'ans4' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.correctAnswer}`; },
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

const QUESTIONS_PER_SESSION = 10;

function updateScore( correct, answered ) {
    $('.score-correct').text(correct);
    $('.score-answered').text(answered);
}

function updateQuestionNumber() {
    $('.question-number').text( ( currentQuestion + 1) );
    $('.question-total').text(QUESTIONS.length);
}

function displayQuestion( num ) {
    updateQuestionNumber();
    console.log(`Asking question ${num}`);
    $('.question').text(`${QUESTIONS[num].question}`);
    asked.push(num);
    unasked.splice(unasked.indexOf(num), 1);
    console.log(`asked: ${asked}`);
    console.log(`answers: ${answers}`);
    console.log(`unasked: ${unasked}`);

    let html = "";
    for ( let i = 0 ; i < QUESTIONS[num].answers.length ; i++ ) {
        html += `<input type="radio" name="answer" id="ans${i}" value="${i}" required>
                 <label for="ans${i}">${QUESTIONS[num].answers[i]}</label>`;
    }
    $('.answer-list').html( html );
    if ( currentQuestion > 0 ) {
        $('.btn-prev').attr('disabled', false);
    }
    $('#ans0').focus();
}

function displayEndCard() {
    $('.card-end').toggleClass('no-display');
    $('.card-questions').toggleClass('no-display');
    $('.btn-try-again').focus();
}

$( function() {
    $('.btn-prev').click( function( event ) {
        currentQuestion--;
        displayQuestion( asked[currentQuestion] );
        if ( currentQuestion === 0 ) {
            $(this).attr('disabled', true);
        }
        $('.btn-submit-answer').attr('disabled', true);
        $('.btn-next-question').attr('disabled', false);
    });
})

$( function () {
    $('.btn-start').click( function( event ) {
        $('.card-start').toggleClass('no-display');
        $('.card-questions').toggleClass('no-display');
        displayQuestion( currentQuestion );
    });
})

$( function() {
    $('.card-questions').on('submit', '.answers', function( event ) {
        event.preventDefault();
        console.log('called the submit answer handler');
        event.stopPropagation();
        let answer = $('input:radio[name=answer]:checked').val();
        // Did we get an answer?
        if ( answer === undefined ) return;

        answers.push(answer);
        // Is it correct
        if ( Number(answer) === QUESTIONS[currentQuestion].correctAnswer ) {
            $('.answer-reply').html(`<p>${QUESTIONS[asked[currentQuestion]].correctMessage()}</p>`);
            score++;
        } else {
            $('.answer-reply').html(`<p>${QUESTIONS[asked[currentQuestion]].incorrectMessage()}</p>`);
        }
        // Update the score 
        updateScore( score, answers.length );

        console.log(answer);
        // Change button activation
        $('.btn-submit-answer').attr('disabled', true);
        $('.btn-next-question').attr('disabled', false);
        // Show the text about the answer
        $('.answer-reply').toggleClass('no-display');
        // Focus on the next question button
        $('.btn-next-question').focus();
    });
})

function nextQuestionHandler() {
    $('.card-questions').on('click', '.btn-next-question', function( event ) {
        currentQuestion++;
        let noQ = ( QUESTIONS.length < QUESTIONS_PER_SESSION ) ? QUESTIONS.length : QUESTIONS_PER_SESSION;
        if ( unasked.length === 0 || asked.length === noQ ) {
            displayEndCard();
        } else {
            console.log(Math.floor( Math.random() * noQ ) );
            displayQuestion( unasked[ Math.floor( Math.random() * unasked.length ) ] );
        }
        $('.btn-next-question').attr('disabled', true);
        $('.btn-submit-answer').attr('disabled', false);
        $('.answer-reply').toggleClass('no-display');
    });
}

$( function() {
    $('.btn-try-again').click( function( event ) {
        resetVals();
        displayQuestion( unasked[ Math.floor( Math.random() * unasked.length ) ] );
        $('.card-end').toggleClass('no-display');
        $('.card-questions').toggleClass('no-display');
        updateScore( score, answers.length );
        updateQuestionNumber();
    });
})

function resetVals() {
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

updateQuestionNumber();
resetVals();
$('.btn-start').focus();

$( nextQuestionHandler );
