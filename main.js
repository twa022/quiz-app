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

let currentQuestion = 0;
let score = 0;
let answered = 0;

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
    $('.question').text(`${QUESTIONS[num].question}`);

    let html = "";
    for ( let i = 0 ; i < QUESTIONS[num].answers.length ; i++ ) {
        html += `<input type="radio" name="answer" id="ans${i}" value="${i}" required>
                 <label for="ans${i}">${QUESTIONS[num].answers[i]}</label>`
    }
    $('.answer-list').html( html );
    $('#ans0').focus();
}

function displayEndCard() {
    $('.card-end').toggleClass('no-display');
    $('.card-questions').toggleClass('no-display');
    $('.btn-try-again').focus();
}

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

        // Is it correct
        if ( Number(answer) === QUESTIONS[currentQuestion].correctAnswer ) {
            $('.answer-reply').html(`<p>${QUESTIONS[currentQuestion].correctMessage()}</p>`);
            score++;
        } else {
            $('.answer-reply').html(`<p>${QUESTIONS[currentQuestion].incorrectMessage()}</p>`);
        }
        answered++;
        // Update the score 
        updateScore( score, answered );

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

$( function() {
    $('.card-questions').on('click', '.btn-next-question', function( event ) {
        currentQuestion++;
        if ( currentQuestion === QUESTIONS.length ) {
            displayEndCard();
        } else {
            displayQuestion( currentQuestion ); // Display the next question
            $('.btn-next-question').attr('disabled', true);
            $('.btn-submit-answer').attr('disabled', false);
        }
        $('.answer-reply').toggleClass('no-display');
    });
})

$( function() {
    $('.btn-try-again').click( function( event ) {
        currentQuestion = 0;
        score = 0;
        answered = 0;
        displayQuestion( 0 );
        $('.card-end').toggleClass('no-display');
        $('.card-questions').toggleClass('no-display');
        updateScore( score, answered );
        updateQuestionNumber();
    });
})

updateQuestionNumber();
$('.btn-start').focus();