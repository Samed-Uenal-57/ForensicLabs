const chapters = ['theory', 'technical', 'artifacts', 'exercises', 'scenario'];

const state = {
    visited: new Set()
};

let draggedItemId = null;

const exerciseSolutions = {
    sequence: ['step-shutdown', 'step-hash', 'step-autopsy', 'step-analyze', 'step-report']
};

const quizQuestions = [
    {
        question: 'Wozu wird ein SHA-256-Hash eines forensischen Images verwendet?',
        answers: [
            'Um die Integrität des Images zu überprüfen',
            'Um gelöschte Dateien automatisch wiederherzustellen',
            'Um das Image zu verschlüsseln'
        ],
        correct: 0
    },
    {
        question: 'Welche Information liefert der Registry-Schlüssel USBSTOR typischerweise?',
        answers: [
            'Den Inhalt aller Dateien auf dem USB-Stick',
            'Informationen zu angeschlossenen USB-Massenspeichern, etwa Hersteller und Gerätekennung',
            'Den Zeitpunkt jeder geöffneten Datei'
        ],
        correct: 1
    },
    {
        question: 'Wofür ist die $MFT (Master File Table) besonders relevant?',
        answers: [
            'Für Metadaten und Dateisystemeinträge, auch zu gelöschten Dateien',
            'Für den Netzwerkverkehr des Rechners',
            'Für die Liste installierter Bildschirmauflösungen'
        ],
        correct: 0
    },
    {
        question: 'Was können LNK-Dateien und „Zuletzt verwendet“-Einträge belegen?',
        answers: [
            'Dass ein Benutzer ein bestimmtes Passwort eingegeben hat',
            'Hinweise auf geöffnete Dateien und deren ursprüngliche Pfade',
            'Die vollständige Kopie einer gelöschten Datei'
        ],
        correct: 1
    },
    {
        question: 'Was ist vor der Analyse eines Disk-Images in Autopsy sinnvoll?',
        answers: [
            'Das Originalmedium verändern, damit Autopsy es schneller einliest',
            'Das Image sichern und seine Integrität anhand eines Hashwerts prüfen',
            'Die Ereignisprotokolle auf dem Original löschen'
        ],
        correct: 1
    },
    {
        question: 'Welche Quelle eignet sich für Zeitinformationen zu Systemereignissen?',
        answers: [
            'Windows-Ereignisprotokolle wie System.evtx',
            'Die Dateiendung .txt allein',
            'Der Name des Benutzerkontos'
        ],
        correct: 0
    },
    {
        question: 'Was gehört zu einer nachvollziehbaren forensischen Untersuchung?',
        answers: [
            'Ergebnisse ohne Beschreibung der Arbeitsschritte präsentieren',
            'Untersuchungsschritte und Ergebnisse dokumentieren',
            'Nur die auffälligsten Dateien sichern und den Rest verwerfen'
        ],
        correct: 1
    }
];

function switchTab(chapterId) {
    if (!chapters.includes(chapterId)) {
        return;
    }

    document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.toggle('hidden', content.id !== `content-${chapterId}`);
    });

    document.querySelectorAll('.tab-btn').forEach((button) => {
        const isActive = button.id === `tab-${chapterId}`;
        button.classList.toggle('active-tab', isActive);
        button.setAttribute('aria-selected', String(isActive));
    });

    state.visited.add(chapterId);
    updateProgress();
}

function updateProgress() {
    const percentage = Math.round((state.visited.size / chapters.length) * 100);
    document.getElementById('progress-bar').style.width = `${percentage}%`;
    document.getElementById('progress-text').innerText = `${percentage}% abgeschlossen`;
}

function showFeedback(element, message, type) {
    element.textContent = message;
    element.className = `exercise-feedback is-${type}`;
}

function getExerciseItem(container) {
    return container.querySelector('.draggable-item');
}

function resetExercise(exerciseId) {
    const source = document.querySelector(`.exercise-source[data-exercise="${exerciseId}"]`);
    const items = Array.from(document.querySelectorAll(`.exercise-source[data-exercise="${exerciseId}"] .draggable-item, .drop-zone[data-exercise="${exerciseId}"] .draggable-item`));

    items.sort((first, second) => Number(first.dataset.order) - Number(second.dataset.order));
    items.forEach((item) => source.appendChild(item));

    document.querySelectorAll(`.drop-zone[data-exercise="${exerciseId}"]`).forEach((zone) => {
        zone.classList.remove('is-correct', 'is-incorrect');
    });

    const feedbackId = exerciseId === 'sequence' ? 'dd1-feedback' : 'dd2-feedback';
    const feedback = document.getElementById(feedbackId);
    feedback.className = 'exercise-feedback hidden';
    feedback.textContent = '';
}

function checkSequence() {
    const zones = Array.from(document.querySelectorAll('.drop-zone[data-exercise="sequence"]'));
    let correctCount = 0;
    let filledCount = 0;

    zones.forEach((zone, index) => {
        const item = getExerciseItem(zone);
        const isCorrect = item && item.id === exerciseSolutions.sequence[index];
        zone.classList.toggle('is-correct', Boolean(isCorrect));
        zone.classList.toggle('is-incorrect', Boolean(item) && !isCorrect);
        if (item) {
            filledCount += 1;
        }
        if (isCorrect) {
            correctCount += 1;
        }
    });

    const feedback = document.getElementById('dd1-feedback');
    if (correctCount === exerciseSolutions.sequence.length) {
        showFeedback(feedback, 'Richtig! Die forensische Ablaufkette ist vollständig und korrekt.', 'success');
    } else {
        const missing = exerciseSolutions.sequence.length - filledCount;
        const message = missing
            ? `${correctCount} von 5 Positionen sind richtig. Bitte belege noch ${missing} ${missing === 1 ? 'Position' : 'Positionen'}.`
            : `${correctCount} von 5 Positionen sind richtig. Prüfe die markierten Schritte und versuche es erneut.`;
        showFeedback(feedback, message, 'error');
    }
}

function checkArtifacts() {
    const zones = Array.from(document.querySelectorAll('.drop-zone[data-exercise="artifacts"]'));
    let correctCount = 0;
    let filledCount = 0;

    zones.forEach((zone) => {
        const item = getExerciseItem(zone);
        const isCorrect = item && item.id === zone.dataset.match;
        zone.classList.toggle('is-correct', Boolean(isCorrect));
        zone.classList.toggle('is-incorrect', Boolean(item) && !isCorrect);
        if (item) {
            filledCount += 1;
        }
        if (isCorrect) {
            correctCount += 1;
        }
    });

    const feedback = document.getElementById('dd2-feedback');
    if (correctCount === zones.length) {
        showFeedback(feedback, 'Richtig! Alle vier Artefakte sind passend zugeordnet.', 'success');
    } else {
        const missing = zones.length - filledCount;
        const message = missing
            ? `${correctCount} von 4 Zuordnungen sind richtig. Bitte fülle noch ${missing} ${missing === 1 ? 'Zuordnung' : 'Zuordnungen'} aus.`
            : `${correctCount} von 4 Zuordnungen sind richtig. Prüfe die markierten Artefakte und versuche es erneut.`;
        showFeedback(feedback, message, 'error');
    }
}

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    document.getElementById('quiz-score-display').textContent = `0 / ${quizQuestions.length}`;
    const feedback = document.getElementById('quiz-feedback');
    feedback.className = 'exercise-feedback hidden';
    feedback.textContent = '';

    quizQuestions.forEach((question, questionIndex) => {
        const card = document.createElement('article');
        card.className = 'quiz-question';
        const heading = document.createElement('h3');
        heading.textContent = `${questionIndex + 1}. ${question.question}`;
        card.appendChild(heading);

        const answers = document.createElement('div');
        answers.className = 'quiz-answers';
        question.answers.forEach((answer, answerIndex) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quiz-answer';
            button.dataset.question = String(questionIndex);
            button.dataset.answer = String(answerIndex);
            button.textContent = answer;
            answers.appendChild(button);
        });
        card.appendChild(answers);

        const result = document.createElement('p');
        result.className = 'quiz-question-feedback';
        result.setAttribute('aria-live', 'polite');
        card.appendChild(result);
        container.appendChild(card);
    });
}

function answerQuizQuestion(button) {
    if (button.disabled) {
        return;
    }

    const questionIndex = Number(button.dataset.question);
    const answerIndex = Number(button.dataset.answer);
    const question = quizQuestions[questionIndex];
    const card = button.closest('.quiz-question');
    const buttons = Array.from(card.querySelectorAll('.quiz-answer'));
    const isCorrect = answerIndex === question.correct;

    buttons.forEach((answerButton) => {
        answerButton.disabled = true;
        if (Number(answerButton.dataset.answer) === question.correct) {
            answerButton.classList.add('is-correct');
        }
    });
    if (!isCorrect) {
        button.classList.add('is-incorrect');
    }

    const result = card.querySelector('.quiz-question-feedback');
    result.textContent = isCorrect
        ? 'Richtig.'
        : `Nicht ganz. Richtig ist: ${question.answers[question.correct]}`;

    const answered = document.querySelectorAll('.quiz-answer:disabled').length / question.answers.length;
    const score = document.querySelectorAll('.quiz-answer.is-correct').length;
    document.getElementById('quiz-score-display').textContent = `${score} / ${quizQuestions.length}`;

    if (answered === quizQuestions.length) {
        const feedback = document.getElementById('quiz-feedback');
        const message = `Quiz abgeschlossen: ${score} von ${quizQuestions.length} Punkten erreicht.`;
        showFeedback(feedback, message, score === quizQuestions.length ? 'success' : 'neutral');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.setAttribute('aria-selected', String(button.id === 'tab-theory'));
    });

    document.querySelectorAll('.draggable-item').forEach((item) => {
        item.addEventListener('dragstart', (event) => {
            draggedItemId = item.id;
            event.dataTransfer.setData('text/plain', item.id);
            event.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('dragend', () => {
            draggedItemId = null;
        });
    });

    document.querySelectorAll('.exercise-source, .drop-zone').forEach((target) => {
        target.addEventListener('dragover', (event) => {
            const draggedItem = document.getElementById(draggedItemId);
            const draggedContainer = draggedItem && draggedItem.closest('[data-exercise]');
            if (draggedContainer && draggedContainer.dataset.exercise === target.dataset.exercise) {
                event.preventDefault();
                target.classList.add('drag-over');
            }
        });

        target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
        target.addEventListener('drop', (event) => {
            event.preventDefault();
            target.classList.remove('drag-over');
            const draggedId = event.dataTransfer.getData('text/plain') || draggedItemId;
            const draggedItem = document.getElementById(draggedId);
            const origin = draggedItem && draggedItem.parentElement;
            const draggedContainer = draggedItem && draggedItem.closest('[data-exercise]');
            if (!draggedItem || !origin || origin === target ||
                !draggedContainer || draggedContainer.dataset.exercise !== target.dataset.exercise) {
                return;
            }

            const displacedItem = target.classList.contains('drop-zone') ? getExerciseItem(target) : null;
            target.appendChild(draggedItem);
            if (displacedItem) {
                origin.appendChild(displacedItem);
            }

            const exerciseId = target.dataset.exercise;
            document.querySelectorAll(`.drop-zone[data-exercise="${exerciseId}"]`).forEach((zone) => {
                zone.classList.remove('is-correct', 'is-incorrect');
            });
            const feedbackId = exerciseId === 'sequence' ? 'dd1-feedback' : 'dd2-feedback';
            const feedback = document.getElementById(feedbackId);
            feedback.className = 'exercise-feedback hidden';
            feedback.textContent = '';
        });
    });

    document.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) {
            return;
        }
        if (button.dataset.reset) {
            resetExercise(button.dataset.reset);
        } else if (button.dataset.check === 'sequence') {
            checkSequence();
        } else if (button.dataset.check === 'artifacts') {
            checkArtifacts();
        } else if (button.hasAttribute('data-reset-quiz')) {
            renderQuiz();
        } else if (button.classList.contains('quiz-answer')) {
            answerQuizQuestion(button);
        }
    });

    renderQuiz();
    switchTab('theory');
});
