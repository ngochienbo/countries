/*
*D1. Function to clear currently displayed cards
  - Input: none
  - Deletes all existing cards
*2. Function to fetch API data
  - Input: search string
  - Return: parsed JSON data, limited only to desired fields
NOT NEEDED 3. Function to parse API data
  - Input: unparsed API data, array of desired fields
  - If desired fields empty, return all
  - Return: parsed JSON data, limited only to desired fields
N4. Function Apply filter to last search results
  - Return: new parsed JSON data object
N5. Function to render HTML cards
  - Input: parsed JSON data, limited only to desired fields
  - Return: Array of template string populated with data
*D6. Function to convert border country names
  - Input: Array of country codes
  - Return: Array of country names
*D7. Function to populate cards section with rendered cards
  - Input: array of template strings populated with data

A. Control function
  - Input: search string, type of query (new search, or apply filter)
  - If new search:
    - Fetch and parse
  - If both applying new filter or a new search:
    - Clear display
    - Apply filter to last search result
    - Render HTML and populate

B. Onload
  - Calls fetch on all countries
  1. Function to create object of country codes
    - Input: Unparsed data of all countries
    - Call parse function
    - Return: Object of country codes and country names
  - Assign the country object to global object
  2. Function to display 8 random countries (initCountryDisplay)
    - Pick 8 random entries from the countries object
    - Calls function to render HTML cards
    - Calls function to populate cards

C. Function to update global filter settings (on filter click)
  - Identify which filter was clicked
  - Toggle global setting for that filter
  - Call control function to rerender section
  - Toggle highlight

D. Back button handler
  - Implements a stack to keep track of navigation history (choosing a country from
    selection screen, or clicking through border countries)
  - For clicks originating from the selection screen, the selected card gets
    toggled history-main class in addition to detail-on
  - For clicks originating from detail view (clicks on border countries) a new query
    is run and a new HTML card created with class detail-on and a data-history attribute
    which increments with the size of the stack.
  - For each subsequent navigation, the previous detail-on card is hidden.
  - The stack keeps track of which item was of the first type and which item was of the
    second type, so that when it's popped it will treat the detail-on cards differently
  - When popping the stack, the cards with data-history will be deleted and the previous
    one will be redisplayed. If instead the card with class history-main is popped,
    it will only have detail-on toggled off and other small hidden cards display restored
    to initial.


*/

// Global variables
const filterString = '?fields=name;nativeName;population;region;subregion;capital;topLevelDomain;currencies;languages;borders';
const APIRoot = "https://restcountries.eu/rest/v2/";
const currentFilters = {
  Africa: false,
  Americas: false,
  Asia: false,
  Europe: false,
  Oceania: false
};
const countryCodes = {};
let currentResults = [];


const fetchData = (searchStr) => {
  let queryType, queryStr;
  if (searchStr === '' || searchStr === undefined) {
    queryType = 'all';
    searchStr = '';
  } else {
    queryType = 'name/';
  }
  queryStr = APIRoot + queryType + searchStr + filterString;

  return fetch(queryStr)
  .then(response => {
    return response.json();
  })
  .then(unparsed => {
    return unparsed;
  })
  .catch(error => {
    console.log(error);
  });
}

// Clear all present cards from the country card display section
const clearDisplay = () => {
  const display = document.querySelector('.cards');
  display.innerHTML = '';
}

// Convert an array of country codes into full names
const convertCountryCodes = (codes) => {
  return codes.map((code) => countryCodes[code]);
}

// Populate the display section with rendered HTML cards
const populateDisplay = (cardsStr) => {
  const display = document.querySelector('.cards');
  let combinedStr = '';

  // Concatenate all the card strings together
  cardsStr.forEach((cardStr) => {
    combinedStr += cardStr;
  });

  // Insert the concatenated string into the display section
  display.innerHTML += combinedStr;
}

// Filter results based on filter options
const filterData = () => {
  let filterResults = [];
  for (let i = 0; i < currentResults.length; i++) {
    let currentCountry = currentResults[i];
    let region = currentCountry.region;
    if (currentFilters[region]) {
      filterResults.push(currentCountry);
    }
  }
  if (filterResults.length === 0) {
    filterResults = currentResults.slice();
  }
  return filterResults;
}



//Create HTML templates for displaying results
const renderHTML = (filterResults) => {
  let templateArr = [];
  for (let i = 0; i < filterResults.length; i++) {
    let country = filterResults[i];
    let currencies = country.currencies;
    let languages = country.languages;
    let currenciesStr = '';
    let languagesStr = '';
    let bordersArr =[];
    let bordersStr ='';

    // Map loops through the array (currencies, languages, borders),
    // returns all items and join them into a string delimited by ', '

    currenciesStr = currencies.map(curr => curr.name).join(', ');
    languagesStr = languages.map(lang => lang.name).join(', ');
    bordersArr = convertCountryCodes(country.borders);
    bordersStr = bordersArr.map(border => {return `<button class="country">${border}</button>
            `}).join('');

    let template =`<section class="card">
      <img class="flag" src="https://restcountries.eu/data/deu.svg">
      <div class="info">
        <header class="name">
          ${filterResults[i].name}
        </header>
        <div class="stats">
          <div class="native-name detail">
            <p>
              Native Name:
              <span>${filterResults[i].nativeName}</span>
            </p>
          </div>
          <div class="pop">
            <p>
              Population:
              <span>${filterResults[i].population}</span>
            </p>
          </div>
          <div class="reg">
            <p>
              Region:
              <span>${filterResults[i].region}</span>
            </p>
          </div>
          <div class="sub-reg detail">
            <p>
              Sub Region:
              <span>${filterResults[i].subregion}</span>
            </p>
          </div>
          <div class="cap">
            <p>
              Capital:
              <span>${filterResults[i].capital}</span>
            </p>
          </div>
          <div class="dom detail">
            <p>
              Top Level  Domain:
              <span>${filterResults[i].topLevelDomain}</span>
            </p>
          </div>
          <div class="cur detail">
            <p>
              Currencies:
              <span>${currenciesStr}</span>
            </p>
          </div>
          <div class="lan detail">
            <p>
              Languages:
              <span>${languagesStr}</span>
            </p>
          </div>
        </div>
        <div class="border-countries detail">
          <span>Border Countries:</span>
          <div class="countries">
            ${bordersStr}          </div>
        </div>
      </div>
    </section>`

    templateArr.push(template);
  }
  return templateArr;
}
