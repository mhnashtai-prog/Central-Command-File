// Main application logic for FCE Cambridge Use of English exercises

let currentExercise = null;
let exerciseKeys = Object.keys(exerciseData);

// Initialize the application
function initializePage() {
    const select = document.getElementById('exerciseSelect');
    
    // Create user-friendly titles for exercises
    const exerciseTitles = {
        'text5_future_of_car': 'The Future of Cars',
        'text6_bees': 'The Importance of Bees', 
        'text7_how_to_study': 'How to Study Effectively',
        'text1_saving_the_tiger': 'Saving the Tiger',
        'text2_london_marathon': 'The London Marathon'
    };
    
    // Populate dropdown with exercises
    exerciseKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = exerciseTitles[key] || key.replace(/_/g, ' ').replace(/text\d+/, '');
        select.appendChild(option);
    });
}

// Load selected exercise
function loadExercise() {
    const selectedKey = document.getElementById('exerciseSelect').value;
    if (!selectedKey) return;
    
    currentExercise = exerciseData[selectedKey];
    if (!currentExercise) return;
    
    generateInputFields();
    generateTextContent();
    
    // Update instructions
    document.getElementById('instructions').innerHTML = 
        `<strong>Instructions:</strong> ${currentExercise.exercise.instructions}`;
    
    // Reset score
    document.getElementById('score').textContent = 'Score: 0/8';
}

// Generate input fields dynamically
function generateInputFields() {
    const inputColumn = document.getElementById('inputColumn');
    inputColumn.innerHTML = '';
    
    // Extract answers from exercise data
    const answers = [];
    currentExercise.text.segments.forEach(segment => {
        segment.blanks.forEach(blank => {
            answers[blank.number - 1] = blank.answer;
        });
    });
    
    // Create input fields
    for (let i = 1; i <= currentExercise.exercise.totalBlanks; i++) {
        const inputButton = document.createElement('div');
        inputButton.className = 'input-button';
        inputButton.dataset.number = i;
        
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'input-field';
        inputField.maxLength = 15;
        inputField.placeholder = `Answer ${i}`;
        inputField.dataset.answer = answers[i - 1] || '';
        
        // Sync input with text blanks
        inputField.addEventListener('input', function() {
            const blankElement = document.querySelector(`[data-blank-number="${i}"]`);
            if (blankElement) {
                blankElement.textContent = this.value || `(${i})`;
                blankElement.classList.toggle('filled', this.value.trim() !== '');
            }
        });
        
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

// Check user answers against correct answers
function checkAnswers() {
    if (!currentExercise) {
        alert('Please select an exercise first.');
        return;
    }
    
    let correct = 0;
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
    
    document.getElementById('score').textContent = 
        `Score: ${correct}/${currentExercise.exercise.totalBlanks}`;
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
    document.getElementById('score').textContent = 
        `Score: 0/${currentExercise.exercise.totalBlanks}`;
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
        const blankNumber = field.closest('.input-button').dataset.number;
        const blankElement = document.querySelector(`[data-blank-number="${blankNumber}"]`);
        if (blankElement) {
            blankElement.textContent = field.dataset.answer;
            blankElement.classList.add('filled');
        }
    });
    
    document.getElementById('score').textContent = 
        `Score: ${currentExercise.exercise.totalBlanks}/${currentExercise.exercise.totalBlanks}`;
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', initializePage);
