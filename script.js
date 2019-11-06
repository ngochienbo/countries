/*
D1. Function to clear currently displayed cards
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
D6. Function to convert border country names
  - Input: Array of country codes
  - Return: Array of country names
D7. Function to populate cards section with rendered cards
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


*/

// Global variables
const filterString = '?fields=name;nativeName;population;region;subregion;capital;topLevelDomain;currencies;languages;borders';
const APIRoot = "https://restcountries.eu/rest/v2/";
const currentFilters = {
  Africa: false,
  America: false,
  Asia: false,
  Europe: false,
  Oceania: false
};
const countryCodes = {};
let currentResults = {};


const fetchData = (searchStr) => {
  let queryType, queryStr;
  if (searchStr === '' || searchStr === undefined) {
    queryType = 'all';
    searchStr = '';
  } else {
    queryType = 'name/';
  }
  queryStr = APIRoot + queryType + searchStr + filterString;
  fetch(queryStr)
  .then((response) => {
    return response.json();
  })
  .then((unparsed) => {
    return unparsed;
  })
  .catch((error) => {
    console.log(error);
  });
}