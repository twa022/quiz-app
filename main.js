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
    {
        'question': 'This is question 4',
        'answers': [ 'ans1', 'ans2', 'ans3', 'ans4' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.correctAnswer}`; },
    },
    {
        'question': 'This is question 5',
        'answers': [ 'ans1', 'ans2', 'ans3' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.correctAnswer}`; },
    },
    {
        'question': 'This is question 6',
        'answers': [ 'ans1', 'ans2', 'ans3', 'ans4', 'ans5' ],
        'correctAnswer': 2,
        correctMessage() { return 'That&apos;s right!'; },
        incorrectMessage() { return `Good try, but the answer is ${this.correctAnswer}`; },
    },];

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

const QUESTIONS_PER_SESSION = 3;

function updateScore( correct, answered ) {
    $('.score-correct').text(correct);
    $('.score-answered').text(answered);
}

function updateQuestionNumber() {
    $('.question-number').text( ( currentQuestion + 1) );
    let q = ( QUESTIONS.length < QUESTIONS_PER_SESSION ) ? QUESTIONS.length : QUESTIONS_PER_SESSION;
    $('.question-total').text(q);
}

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
        html += `<input type="radio" name="answer" id="ans${i}" value="${i}">
                 <label for="ans${i}">${QUESTIONS[num].answers[i]}</label>`;
    }
    $('.answer-list').html( html );
    if ( alreadyAnswered ) {
        $('.btn-answer-question').attr('disabled', true);
        console.log( 'applying check');
        $(`#ans${answers[currentQuestion]}`).attr('checked', true);
        console.log( 'done applying check');
        $('input[type="radio"]:not(:checked)').attr('disabled', true);
        $('.answer-reply').removeClass('no-display');
        $('.btn-submit-answer').attr('disabled', true);
        $('.btn-next-question').focus();
    } else {
        $('.answer-reply').addClass('no-display');
        $('#ans0').focus();
        $('.btn-submit-answer').attr('disabled', false);
    }
 
    if ( currentQuestion > 0 ) {
        $('.btn-prev').attr('disabled', false);
    }
}

function displayEndCard() {
    $('.card-end').removeClass('no-display');
    $('.card-questions').addClass('no-display');
    $('.btn-try-again').focus();
}

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

$( function() {
    $('.btn-prev').click( function( event ) {
        event.stopPropagation();
        currentQuestion--;
        console.log(`before displaying question answers: ${answers}`);
        displayQuestion( asked[currentQuestion] );
        if ( currentQuestion === 0 ) {
            $(this).attr('disabled', true);
        }
        $('.btn-submit-answer').attr('disabled', true);
        $('.btn-next-question').attr('disabled', false);
        console.log(`after displaying question answers: ${answers}`);
    });
})

$( function () {
    $('.btn-start').click( function( event ) {
        $('.card-start').addClass('no-display');
        $('.card-questions').removeClass('no-display');
        displayQuestion( currentQuestion );
    });
})

$( function() {
    $('.card-questions').on('submit', '.answers', function( event ) {
        event.preventDefault();
        console.log('called the submit answer handler');
        event.stopPropagation();
        let answer = Number($('input:radio[name=answer]:checked').val());
        // Did we get an answer?
        if ( answer === NaN || answer === undefined ) return;

        console.log(   `pushing ${answer} to the answers array`);
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
        console.log(`classes: ${$('.answer-reply').attr('class')}`);
        $('.answer-reply').removeClass('no-display');
        // Focus on the next question button
        $('.btn-next-question').focus();
    });
})

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

$( function() {
    $('.btn-try-again').click( function( event ) {
        resetVals();
        displayQuestion( unasked[ Math.floor( Math.random() * unasked.length ) ] );
        $('.card-end').addClass('no-display');
        $('.card-questions').removeClass('no-display');
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
