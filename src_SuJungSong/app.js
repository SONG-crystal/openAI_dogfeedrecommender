
const { OpenAIApi, Configuration } = require('openai');


function configureOpenAI() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });


  const openai = new OpenAIApi(configuration);
  return openai;
}


function buildUserPrompt(species, budget, age, allergic) {
  const prompt = 
`

---begin-topic---
${species}
---end-topic---

I have ${species} breed a dog.

He is ${age} old.

I'm have ${budget} dollars.

The puppy has allergic to ${allergic}.

Please recommend a food suitable for our dog, consider the dog's age and recommend a food.

Please tell me the name, price, and some ingredients of the dog food you sell on the market.Please tell me in the form of a list.

Take this into account in your response.

You must format your response using Bootstrap HTML in the following form, adding Bootstrap classes to make the response look nice:

<div class="container">...</div>
`;

  console.log({prompt});
  return prompt;
}


async function chat(species, budget, age, allergic) {
  const openai = configureOpenAI();


  const messages = [
    // System prompt tells the AI how to function
    {
      role: "system",
      content: "You are a college-level educational assistant, helping students study topics."
    },
    // User prompt is what we want it to do
    {
      role: "user",
      // Build the prompt using our function and the user's data
      content: buildUserPrompt(species, budget, age, allergic)
    }
  ]
  
  // Any network request could fail, so we use try/catch
  try {
    // Send our messages to OpenAI, and `await` the response (it will take time)
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    // The response we get back will be a complex object, and we want to drill in
    // to get our data, see https://platform.openai.com/docs/guides/chat/response-format
    const answer = completion.data.choices[0].message.content;
    console.log({ answer });

    displayOutput(answer);
  } catch (error) {
    // If anything goes wrong, show an error in the console (we could improve this...)
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  } finally {
    // Re-enable the submit button so the user can try again
    toggleSubmitButton();
  }
}

// Toggle the Submit button to a Loading... button, or vice versa
function toggleSubmitButton() {
  const submitButton = document.querySelector('#input-form button[type=submit]');

  // Flip the value true->false or false->true
  submitButton.disabled = !submitButton.disabled;

  // Flip the button's text back to "Loading..."" or "Submit"
  const submitButtonText = submitButton.querySelector('.submit-button-text');
  debugger;
  if(submitButtonText.innerHTML === 'Loading...') {
    submitButtonText.innerHTML = 'Submit';
  } else {
    submitButtonText.innerHTML = 'Loading...';
  }

  // Show or Hide the loading spinner
  const submitButtonSpinner = submitButton.querySelector('.submit-button-spinner')
  submitButtonSpinner.hidden = !submitButtonSpinner.hidden;
}

// Update the output to use new HTML content
function displayOutput(html) {
  // Put the AI generated HTML into our output div.  Use `innerHTML` so it renders as HTML
  const output = document.querySelector('#output');
  output.innerHTML = html;
}

// Set the output to nothing (clear it)
function clearOutput() {
  displayOutput('');
}

// Process the user's form input and send to ChatGPT API
function processFormInput(form) {
  // Get values from the form
  const species = form.topic.value.trim();
  const budget = form.level.value;
  const age = form['question-count'].value;
  const allergic = form['question-type'].value;
  //const includeAnswers = form['include-answers'].checked;

  // Update the Submit button to indicate we're done loading
  toggleSubmitButton();

  // Clear the output of any existing content
  clearOutput();

  // Send the input values to OpenAI's ChatGPT API
  chat(species, budget, age, allergic);
}

function main() {
  // Wait for the user to submit the form
  document.querySelector('#input-form').onsubmit = function(e) {
    // Stop the form from submitting, we'll handle it in the browser with JS
    e.preventDefault();

    // Process the data in the form, passing the form to the function
    processFormInput(e.target)
  };

  // Update the character count when the user enters any text in the topic textarea
  document.querySelector('#topic').oninput = function(e) {
    // Get the current length
    const length = e.target.value.length;
    // Update the badge text
    document.querySelector('#topic-badge').innerText = `${length} characters`;
  }
}

// Wait for the DOM to be ready before we start
addEventListener('DOMContentLoaded', main);
