// main.js

// CONSTANTS
const RECIPE_URLS = [
  'https://introweb.tech/assets/json/1_50-thanksgiving-side-dishes.json',
  'https://introweb.tech/assets/json/2_roasting-turkey-breast-with-stuffing.json',
  'https://introweb.tech/assets/json/3_moms-cornbread-stuffing.json',
  'https://introweb.tech/assets/json/4_50-indulgent-thanksgiving-side-dishes-for-any-holiday-gathering.json',
  'https://introweb.tech/assets/json/5_healthy-thanksgiving-recipe-crockpot-turkey-breast.json',
  'https://introweb.tech/assets/json/6_one-pot-thanksgiving-dinner.json',
];

// Run the init() function when the page has loaded
window.addEventListener('DOMContentLoaded', init);

// Starts the program, all function calls trace back here
async function init() {
  // initialize ServiceWorker
  initializeServiceWorker();
  // Get the recipes from localStorage
  let recipes;
  try {
    recipes = await getRecipes();
  } catch (err) {
    console.error(err);
  }
  // Add each recipe to the <main> element
  addRecipesToDocument(recipes);
}

/**
 * Detects if there's a service worker, then loads it and begins the process
 * of installing it and getting it running
 */
function initializeServiceWorker() {
  // We first must register our ServiceWorker here before any of the code in sw.js is executed.
  // Check if 'serviceWorker' is supported in the current browser
  if ('serviceWorker' in navigator) {
    // Listen for the 'load' event on the window object
    window.addEventListener('load', () => {
      // Register './sw.js' as a service worker
      const registration = navigator.serviceWorker.register('./sw.js').then((registration) => {
        // Once the service worker has been successfully registered, console log that it was successful
        console.log('Service worker registration succeeded:', registration);
      }, /*catch*/ (error) => {
        // In the event that the service worker registration fails, console log that it has failed
        console.error(`Service worker registration failed: ${error}`);
      });
    });
  }
}

/**
 * Reads 'recipes' from localStorage and returns an array of
 * all of the recipes found (parsed, not in string form). If
 * nothing is found in localStorage, network requests are made to all
 * of the URLs in RECIPE_URLs, an array is made from those recipes, that
 * array is saved to localStorage, and then the array is returned.
 * @returns {Array<Object>} An array of recipes found in localStorage
 */
async function getRecipes() {
  // Check local storage to see if there are any recipes
  if (localStorage.getItem('recipes')) {
    // If there are recipes, return them
    return JSON.parse(localStorage.getItem('recipes'));
  }
  // The rest of this method will be concerned with requesting the recipes from the network
  // Create an empty array to hold the recipes that we will fetch
  const recipes = [];
  // Return a new Promise
  return new Promise((resolve, reject) => {
    // Loop through each recipe in the RECIPE_URLS array constant declared above
    RECIPE_URLS.forEach(async (recipeUrl) => {
      try {
        // For each URL in that array, fetch the URL
        const response = await fetch(recipeUrl);
        // For each fetch response, retrieve the JSON from it
        const recipe = await response.json();
        // Add the new recipe to the recipes array
        recipes.push(recipe);
        // Check to see if we have finished retrieving all of the recipes
        if (recipes.length == RECIPE_URLS.length) {
          // Save the recipes to storage
          saveRecipesToStorage(recipes);
          // Pass the recipes array to the Promise's resolve() method
          resolve(recipes);
        }
      } catch (e) {
        // Log any errors from catch using console.error
        console.error(e);
        // Pass any errors to the Promise's reject() function
        reject(e);
      }
    });
  });
}

/**
 * Takes in an array of recipes, converts it to a string, and then
 * saves that string to 'recipes' in localStorage
 * @param {Array<Object>} recipes An array of recipes
 */
function saveRecipesToStorage(recipes) {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

/**
 * Takes in an array of recipes and for each recipe creates a
 * new <recipe-card> element, adds the recipe data to that card
 * using element.data = {...}, and then appends that new recipe
 * to <main>
 * @param {Array<Object>} recipes An array of recipes
 */
function addRecipesToDocument(recipes) {
  if (!recipes) return;
  let main = document.querySelector('main');
  recipes.forEach((recipe) => {
    let recipeCard = document.createElement('recipe-card');
    recipeCard.data = recipe;
    main.append(recipeCard);
  });
}
