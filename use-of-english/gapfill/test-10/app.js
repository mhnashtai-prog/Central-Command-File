// FCE Cambridge Use of English Part 2 - Application Logic

let currentExercise = null;
let exerciseKeys = [];

// Initialize the application
function initializePage() {
    console.log('Initializing page...');
    
    // Check if exerciseData is loaded
    if (typeof exerciseData === 'undefined') {
        console.error('exerciseData not found! Make sure fetchfile-for-gapfill-test10.js is loaded.');
        alert('Error: Exercise data not loaded. Please check that all files are in the same folder.');
        return;
    }
    
    console.log('Exercise data found:', exerciseData);
    exerciseKeys = Object.keys(exerciseData);
    console.log('Available exercises:', exerciseKeys);
    
    if (exerciseKeys.length === 0) {
        console.error('No exercises found in exerciseData');
        return;
    }
    
    const select = document.getElementById('exerciseSelect');
    if (!select) {
        console.error('exerciseSelect dropdown not found');
        return;
    }
    
    // Clear existing options (keep the default one)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
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
        'text_horse_art': 'The Horse in Art (15 questions)',
        'text_inferno_ski_race': 'The Inferno Ski Race',
        'text_vancouver': 'Vancouver - A Canadian Gem',
        'text_my_home_town': 'My Malaysian Home Town',
        'text_waste_plastic': 'Dealing with Waste Plastic',
        'text_cruise_ship': 'The Island Princess Cruise Ship',
        'text_many_parts': 'A Man of Many Parts',
        'text_model_village': 'Cadbury\'s Model Village',
        'text_history_sea': 'History from the Sea',
        'text_riverside_hotel': 'A Hotel Famous for Food',
        'text_cycling_corners': 'Cycling Round Corners (15 questions)',
        'text_mission_mars': 'Mission to Mars (15 questions)',
        'text_writing_story': 'Writing a Story (15 questions)',
        'text_family_photographs': 'Family Photographs (15 questions)',
        'text_busy_family': 'A Busy Family (15 questions)',
        'text_export_ice': 'The Export of Ice (15 questions)'
    };
    
    // Populate dropdown with exercises
    exerciseKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = exerciseTitles[key] || key.replace(/_/g, ' ').replace(/text_/, '');
        select.appendChild(option);
        console.log('Added exercise:', option.textContent);
    });
    
    console.log(`Successfully loaded ${exerciseKeys.length} exercises`);
}

// Load selected exercise
function loadExercise() {
    console.log('Loading exercise...');
    const selectedKey = document.getElementById('exerciseSelect').value;
    console.log('Selected key:', selectedKey);
    
    if (!selectedKey) {
        resetInterface();
        return;
    }
    
    currentExercise = exerciseData[selectedKey];
    if (!currentExercise) {
        console.error('Exercise not found:', selectedKey);
        return;
    }
    
    console.log('Loaded exercise:', currentExercise.exercise.title);
    console.log('Total blanks:', currentExercise.exercise.totalBlanks);
    
    try {
        generateInputFields();
        generateTextContent();
        resetScore();
        console.log('Exercise loaded successfully');
    } catch (error) {
        console.error('Error loading exercise:', error);
        alert('Error loading exercise. Please check the console for details.');
    }
}

// Generate input fields dynamically based on exercise
function generateInputFields() {
    console.log('Generating input fields...');
    const inputColumn = document.getElementById('inputColumn');
    inputColumn.innerHTML = '';
    
    // Extract answers from exercise data
    const answers = new Map();
    currentExercise.text.segments.forEach(segment => {
        segment.blanks.forEach(blank => {
            answers.set(blank.number, blank.answer);
        });
    });
    
    console.log('Found answers:', Array.from(answers.entries()));
    
    // Create input fields for all question numbers
    const startNum = currentExercise.exercise.startNumber;
    const totalBlanks = currentExercise.exercise.totalBlanks;
    
    console.log(`Creating ${totalBlanks} input fields starting from ${startNum}`);
    
    for (let i = 0; i < totalBlanks; i++) {
        const questionNum = startNum + i;
        const inputButton = document.createElement('div');
        inputButton.className = 'input-button';
        inputButton.dataset.number = questionNum;
        
        // Answer label (grey, above input field)
        const answerLabel = document.createElement('div');
        answerLabel.className = 'answer-label';
        answerLabel.textContent = `ANSWER ${questionNum}`;
        
        // Input field
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'input-field';
        inputField.maxLength = 15;
        inputField.placeholder = '';
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
        
        inputButton.appendChild(answerLabel);
        inputButton.appendChild(inputField);
        inputColumn.appendChild(inputButton);
    }
    
    console.log('Input fields generated successfully');
}

// Generate text content with blanks
function generateTextContent() {
    console.log('Generating text content...');
    const textContent = document.getElementById('textContent');
    textContent.innerHTML = '';
    
    let paragraphContent = '';
    
    currentExercise.text.segments.forEach((segment, index) => {
        console.log(`Processing segment ${index}:`, segment);
        
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
    
    console.log('Text content generated successfully');
}

// Helper function to create paragraph elements
function createParagraph(container, content) {
    const paragraph = document.createElement('div');
    paragraph.className = 'text-paragraph';
    paragraph.innerHTML = `<strong>${content}</strong>`;
    container.appendChild(paragraph);
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
    
    console.log('Checking answers...');
    let correct = 0;
    const totalBlanks = currentExercise.exercise.totalBlanks;
    
    document.querySelectorAll('.input-field').forEach(field => {
        field.classList.remove('correct', 'incorrect');
        
        const userAnswer = field.value.trim().toLowerCase();
        const correctAnswer = field.dataset.answer.trim().toLowerCase();
        
        console.log(`Q${field.dataset.questionNumber}: "${userAnswer}" vs "${correctAnswer}"`);
        
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
    
    console.log(`Final score: ${correct}/${totalBlanks} (${percentage}%)`);
    
    // Scroll to top to see results
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Reset exercise to start over
function repeatExercise() {
    if (!currentExercise) {
        alert('Please select an exercise first.');
        return;
    }
    
    console.log('Repeating exercise...');
    
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
    
    console.log('Showing all answers...');
    
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

// Reset interface to initial state
function resetInterface() {
    document.getElementById('inputColumn').innerHTML = '<div class="loading">Select an exercise to begin</div>';
    document.getElementById('textContent').innerHTML = `
        <p><strong>FCE Use of English Part 2 - Open Cloze Practice</strong></p>
        <p>Select an exercise from the dropdown menu above. Read the text and think of the word which best fits each gap. Use only one word in each gap.</p>
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
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Attach Return to Menu button event listener with corrected path
    const returnBtn = document.getElementById('returnBtn');
    if (returnBtn) {
        returnBtn.addEventListener('click', function() {
            // Navigate back to the use-of-english index (adjust path as needed)
            window.location.href = 'Central-Command-File/use-of-english/gapfill/index.html';
        });
    }
    
    // Small delay to ensure all scripts are loaded
    setTimeout(initializePage, 100);
});

// Error handling for uncaught errors
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    console.error('Error occurred in:', e.filename, 'at line', e.lineno);
});

// Log when script loads
console.log('app.js loaded successfully');
