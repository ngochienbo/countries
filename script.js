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
*N4. Function Apply filter to last search results
  - Return: new parsed JSON data object
*N5. Function to render HTML cards
  - Input: parsed JSON data, limited only to desired fields
  - Return: Array of template string populated with data
*D6. Function to convert border country names
  - Input: Array of country codes
  - Return: Array of country names
*D7. Function to populate cards section with rendered cards
  - Input: array of template strings populated with data

*A. Search function
  - Input: search string
  - Fetch and parse
  - Filter

*B. Onload
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

*C. Function to update global filter settings (on filter click)
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

E. Detail view

*/

// Global variables
const filterString = '?fields=name;nativeName;population;region;subregion;capital;topLevelDomain;currencies;languages;borders;alpha3Code;flag';
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
const historyStack = (() => {
  let index;
  return {
    push: () => {
      if (index === undefined) {
        index = 0;
      } else {
        index += 1;
      }
      return index;
    },
    pop: () => {
      if (index === 0) {
        index = undefined;
        return 0;
      } else if (index === undefined) {
        return undefined;
      } else {
        index -= 1;
        return index + 1;
      }
    }
  }
})();

const fetchData = (searchStr, searchType) => {
  let queryType, queryStr, fullNameFilter = '';
  if (searchType === 'partial') {
    queryType = 'name/';
  } else if (searchType === 'full') {
    queryType = `name/`;
    fullNameFilter = '&fullText=true';
  } else if (searchStr === '' || searchStr === undefined) {
    queryType = 'all';
    searchStr = '';
  }
  queryStr = APIRoot + queryType + searchStr + filterString + fullNameFilter;

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

//Create HTML templates for displaying results
const renderHTML = (results, historyIndex) => {
  let templateArr = [];
  for (let i = 0; i < results.length; i++) {
    let country = results[i];
    let currencies = country.currencies;
    let languages = country.languages;
    let currenciesStr = '';
    let languagesStr = '';
    let bordersArr =[];
    let bordersStr ='';
    let historyIndexStr;
    if (historyIndex === undefined) {
      historyIndexStr = '';
    } else {
      historyIndexStr = ` data-history="${historyIndex}"`;
    }

    // Map loops through the array (currencies, languages, borders),
    // returns all items and join them into a string delimited by ', '

    currenciesStr = currencies.map(curr => curr.name).join(', ');
    languagesStr = languages.map(lang => lang.name).join(', ');
    bordersArr = convertCountryCodes(country.borders);
    bordersStr = bordersArr.map(border => {return `<button class="country">${border}</button>
            `}).join('');

    let template =`<section class="card"${historyIndexStr} data-region="${results[i].region}">
      <img class="flag" src="${results[i].flag}">
      <div class="info">
        <header class="name">
          ${results[i].name}
        </header>
        <div class="stats">
          <div class="native-name detail">
            <p>
              Native Name:
              <span>${results[i].nativeName}</span>
            </p>
          </div>
          <div class="pop">
            <p>
              Population:
              <span>${results[i].population}</span>
            </p>
          </div>
          <div class="reg">
            <p>
              Region:
              <span>${results[i].region}</span>
            </p>
          </div>
          <div class="sub-reg detail">
            <p>
              Sub Region:
              <span>${results[i].subregion}</span>
            </p>
          </div>
          <div class="cap">
            <p>
              Capital:
              <span>${results[i].capital}</span>
            </p>
          </div>
          <div class="dom detail">
            <p>
              Top Level  Domain:
              <span>${results[i].topLevelDomain}</span>
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

/*********************************************
 * On Load
 */

window.addEventListener('load', function() {

  // Fetch data for all countries then populate countryCodes
  fetchData()
  .then(countries => {
    countries.forEach(count => countryCodes[count.alpha3Code] = count.name);
    let randomNum = 8;
    for (let i = 0; i < randomNum; i++) {
      currentResults.push(countries[Math.round(Math.random() * 250)]);
    }
    populateDisplay(renderHTML(currentResults));

    document.querySelector('.cards').addEventListener('click', displayNextBorderCountry);
  })
  .catch(error => {
    console.log(error);
  });


})

const displayNextBorderCountry = (borderCountry) => {
  let target = borderCountry.target;
  if (target.matches('button.country')) {
    let searchStr = target.innerHTML;
    fetchData(searchStr, 'full')
    .then(country => {
      let index = historyStack.push();
      populateDisplay(renderHTML(country, index));
      
      let newCard = document.querySelector(`.card[data-history="${index}"]`);
      console.log(newCard);
      newCard.dataset.history =  index;
      newCard.classList.add('detail-on');
      document.querySelector(`.card[data-history="${index - 1}"]`).style.display = 'none';
    })
    .catch(error => {
      console.log(error);
    })
  }
}

// Toggle display for cards in the display area according to global filter settings
const applyFilterToDisplay = () => {
  const regions = Object.keys(currentFilters);
  const cards = document.querySelectorAll('.cards > .card');

  // Hide all the cards
  cards.forEach(card => card.style.display = 'none');

  // If at least one filter is on (true)
  if (Object.values(currentFilters).includes(true)) {
    // Loop through regions and for those that are true show cards for that region
    regions.forEach(region => {
      // Find all cards for this region
      const regionCards = document.querySelectorAll(`.cards > [data-region="${region}"]`);

      // If the display option for this region is on then show cards
      if (currentFilters[region]) {
        regionCards.forEach((card) => card.style.display = '');
      }
    });
  // Else no filters are on so display all the cards
  } else {
    cards.forEach(card => card.style.display = ''); //Setting display to initial causes buggy behavior
  }
}

// Toggle detail view for selected card, while hiding all others
// Also toggle some UI elements accordingly
const toggleDetailView = (card) => {
  card.classList.toggle('detail-on');

  let otherCards = document.querySelectorAll('.card:not(.detail-on)');
  let newDisplayType = '';

  // If after toggling, the card is in detail view then hide other cards
  if (card.classList.contains('detail-on')) {
    newDisplayType = 'none';
  // Else we are turning off detail view for chosen card so redisplay other cards
  } else {
    newDisplayType = '';
  }

  otherCards.forEach(otherCard => otherCard.style.display = newDisplayType);
}

// Toggle detail view on from main search result screen
document.querySelector('.cards').addEventListener('click', function(e) {
  let target = e.target;
  if (target.matches('.flag')) {
    let card = target.closest('.card');

    // Toggle detail view only if not already in detail mode
    // This only allows toggling it on from this event listener, toggling it off
    // is performed through the back button.
    if (!card.classList.contains('detail-on')) {
      let index = historyStack.push();  
      card.dataset.history = index;
      toggleDetailView(card);
    }
  }
});


//Toggle filter dropdown menu
document.addEventListener('click', function(e) {
  let target = e.target;
  if (target.matches('.dropdown-menu input, .dropdown-menu i')) {
    document.querySelector('.dropdown-menu').classList.toggle('show-filters');
  } else if (target.matches('.dropdown-menu-options, .dropdown-menu-options *')) /* do nothing */ ;
  else {
    document.querySelector('.dropdown-menu').classList.remove('show-filters');
  }
  console.log(e.target);
})


//Select filter options
document.querySelector('.dropdown-menu-options').addEventListener('click', function(e) {
  let targetFilter = e.target;
  let region = targetFilter.dataset.region;
  console.log(targetFilter);
  if (region) {
    targetFilter.classList.toggle('filter-on');
    if (targetFilter.classList.contains('filter-on')) {
      currentFilters[region] = true;
    } else {
      currentFilters[region] = false;
    }
  }
  applyFilterToDisplay();
})

//Search function
document.addEventListener('keypress', function(e) {
  let searchbar = document.querySelector('[name="search"]');
  let searchStr = '';
  if (e.keyCode === 13 && document.activeElement === searchbar) {
    searchStr = searchbar.value;
    clearDisplay();
    fetchData(searchStr, 'partial')
    .then(countries => {
      currentResults = countries;
      populateDisplay(renderHTML(currentResults));
      applyFilterToDisplay();
    })
    .catch(error => {
      console.log(error);
    });
    searchbar.value = '';
  }
})


//Back button

document.querySelector('.back-history').addEventListener('click', function() {
  let index = historyStack.pop();
  let currentCard = document.querySelector(`.card[data-history="${index}"]`);
  let prevCard = document.querySelector(`.card[data-history="${index - 1}"]`);
  if (index === 0) {
    toggleDetailView(currentCard);
    currentCard.removeAttribute('data-history');
    applyFilterToDisplay();
  } else if (index > 0) {
    currentCard.remove();
    prevCard.style.display ='';
  }  
})