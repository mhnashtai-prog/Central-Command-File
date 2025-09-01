// FCE Cambridge Use of English Part 2 - Application Logic

let currentExercise = null;
let exerciseKeys = Object.keys(exerciseData);

// Initialize the application
function initializePage() {
    const select = document.getElementById('exerciseSelect');
    
    // Create user-friendly titles for exercises
    const exerciseTitles = {
        'text_ideal_school': 'Your Ideal School',
        'text_dictionaries': 'The History of Dictionaries',
        'text_swimming': 'Swimming Technique and the Shaw Method',
        'text_summer_camp': 'American Summer Camps',
        'text_hollywood': 'The Birth of Hollywood',
        'text_actors_problems': 'Problems Actors Face',
        'text_dickens_childhood': 'Charles Dickens\' Childhood',
        'text_sharks': 'Great White Shark Research (15 questions)',
        'text_horse_art': 'The Horse in Art (15 questions)'
    };
    
    // Populate dropdown with exercises
    exerciseKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = exerciseTitles[key] || key.replace(/_/g, ' ').replace(/text_/, '');
        select.appendChild(option);
    });
}

// Load selected exercise
function loadExercise() {
    const selectedKey = document.getElementById('exerciseSelect').value;
    if (!selectedKey) {
        resetInterface();
        return;
    }
    
    currentExercise = exerciseData[selectedKey];
    if (!currentExercise) return;
    
    generateInputFields();
    generateTextContent();
    updateInstructions();
    resetScore();
}

// Generate input fields dynamically based on exercise
function generateInputFields() {
    const inputColumn = document.getElementById('inputColumn');
    inputColumn.innerHTML = '';
    
    // Extract answers from exercise data
    const answers = new Map();
    currentExercise.text.segments.forEach(segment => {
        segment.blanks.forEach(blank => {
            answers.set(blank.number, blank.answer);
        });
    });
    
    // Create input fields for all question numbers
    const startNum = currentExercise.exercise.startNumber;
    const totalBlanks = currentExercise.exercise.totalBlanks;
    
    for (let i = 0; i < totalBlanks; i++) {
        const questionNum = startNum + i;
        const inputButton = document.createElement('div');
        inputButton.className = 'input-button';
        inputButton.dataset.number = questionNum;
        
        // Question number label
        const questionLabel = document.createElement('span');
        questionLabel.className = 'question-number';
        questionLabel.textContent = questionNum;
        
        // Input field
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'input-field';
        inputField.maxLength = 15;
        inputField.placeholder = `Q${questionNum}`;
        inputField.dataset.answer = answers.get(questionNum) || '';
        inputField.dataset.questionNumber = questionNum;
        
        // Sync input with text blanks
        inputField.addEventListener('input', function() {
            const blankElement = document.querySelector(`[data-blank-number="${questionNum}"]`);
            if (blankElement) {
                blankElement.textContent = this.value || `(${questionNum})`;
                blankElement.classList.toggle('filled', this.value.trim() !== '');
            }
        });
        
        inputButton.appendChild(questionLabel);
        inputButton.appendChild(inputField);
        inputColumn.appendChild(inputButton);
    }
}

// Generate text content with blanks
function generateTextContent() {
    const textContent = document.getElementById('textContent');
    textContent.innerHTML = '';
    
    let paragraphContent = '';
    
    currentExercise.text.segments.forEach(segment => {
        // Handle empty segments (paragraph breaks)
        if (segment.content.trim() === '' && segment.blanks.length === 0) {
            if (paragraphContent.trim()) {
                createParagraph(textContent, paragraphContent);
                paragraphContent = '';
            }
            return;
        }
        
        // Add segment content
        paragraphContent += segment.content;
        
        // Add blanks
        segment.blanks.forEach(blank => {
            paragraphContent += ` <span class="blank" data-blank-number="${blank.number}">(${blank.number})</span>`;
        });
        
        // Add text after blanks
        if (segment.afterText) {
            paragraphContent += ` ${segment.afterText}`;
            // Add space if not ending with punctuation
            if (!segment.afterText.match(/[.!?]$/)) {
                paragraphContent += ' ';
            }
        }
    });
    
    // Add final paragraph if content remains
    if (paragraphContent.trim()) {
        createParagraph(textContent, paragraphContent);
    }
}

// Helper function to create paragraph elements
function createParagraph(container, content) {
    const paragraph = document.createElement('div');
    paragraph.className = 'text-paragraph';
    paragraph.innerHTML = `<strong>${content}</strong>`;
    container.appendChild(paragraph);
}

// Update instructions based on current exercise
function updateInstructions() {
    const instructionsDiv = document.getElementById('instructions');
    const startNum = currentExercise.exercise.startNumber;
    const endNum = startNum + currentExercise.exercise.totalBlanks - 1;
    
    instructionsDiv.innerHTML = `<strong>Instructions:</strong> For questions ${startNum}-${endNum}, read the text below and think of the word which best fits each gap. Use only one word in each gap.`;
}

// Reset score display
function resetScore() {
    const scoreDiv = document.getElementById('score');
    const totalBlanks = currentExercise.exercise.totalBlanks;
    scoreDiv.textContent = `Score: 0/${totalBlanks}`;
}

// Check user answers against correct answers
function checkAnswers() {
    if (!currentExercise) {
        alert('Please select an exercise first.');
        return;
    }
    
    let correct = 0;
    const totalBlanks = currentExercise.exercise.totalBlanks;
    
    document.querySelectorAll('.input-field').forEach(field => {
        field.classList.remove('correct', 'incorrect');
        
        const userAnswer = field.value.trim().toLowerCase();
        const correctAnswer = field.dataset.answer.trim().toLowerCase();
        
        if (userAnswer === correctAnswer) {
            field.classList.add('correct');
            correct++;
        } else {
            field.classList.add('incorrect');
        }
    });
    
    // Calculate percentage
    const percentage = Math.round((correct / totalBlanks) * 100);
    document.getElementById('score').textContent = `Score: ${correct}/${totalBlanks} (${percentage}%)`;
    
    // Scroll to top to see results
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Reset exercise to start over
function repeatExercise() {
    if (!currentExercise) {
        alert('Please select an exercise first.');
        return;
    }
    
    // Clear all input fields
    document.querySelectorAll('.input-field').forEach(field => {
        field.value = '';
        field.classList.remove('correct', 'incorrect');
    });
    
    // Reset blanks in text
    document.querySelectorAll('.blank').forEach(blank => {
        const number = blank.dataset.blankNumber;
        blank.textContent = `(${number})`;
        blank.classList.remove('filled');
    });
    
    // Reset score
    resetScore();
}

// Show all correct answers
function showAnswers() {
    if (!currentExercise) {
        alert('Please select an exercise first.');
        return;
    }
    
    document.querySelectorAll('.input-field').forEach(field => {
        field.value = field.dataset.answer;
        field.classList.remove('incorrect');
        field.classList.add('correct');
        
        // Update corresponding blank in text
        const questionNum = field.dataset.questionNumber;
        const blankElement = document.querySelector(`[data-blank-number="${questionNum}"]`);
        if (blankElement) {
            blankElement.textContent = field.dataset.answer;
            blankElement.classList.add('filled');
        }
    });
    
    // Update score to full marks
    const totalBlanks = currentExercise.exercise.totalBlanks;
    document.getElementById('score').textContent = `Score: ${totalBlanks}/${totalBlanks} (100%)`;
}

// Return to central menu
function returnToMenu() {
    // Navigate back to the central command file
    window.location.href = '../../html.code';
}

// Reset interface to initial state
function resetInterface() {
    document.getElementById('inputColumn').innerHTML = '<div class="loading">Select an exercise to begin</div>';
    document.getElementById('instructions').innerHTML = '<strong>Instructions:</strong> Select an exercise from the dropdown menu above to begin practicing.';
    document.getElementById('textContent').innerHTML = `
        <p>This interactive exercise will help you prepare for the FCE Use of English Part 2 (Open Cloze). 
        Each exercise follows the authentic Cambridge exam format with proper question numbering and difficulty level.</p>
        <p>Choose an exercise to get started!</p>
    `;
    document.getElementById('score').textContent = 'Ready to start';
    currentExercise = null;
}

// Keyboard shortcuts for better user experience
document.addEventListener('keydown', function(e) {
    if (!currentExercise) return;
    
    // Ctrl/Cmd + Enter to check answers
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        checkAnswers();
    }
    
    // Ctrl/Cmd + R to repeat (prevent default browser reload)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        repeatExercise();
    }
});

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', initializePage);
