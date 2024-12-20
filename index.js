const baseUrl = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

const cocktailName = document.getElementById('cocktail-name');
const cocktailImg = document.getElementById('cocktail-img');
const newCocktailBtn = document.getElementById('new-cocktail');
const seeMoreBtn = document.getElementById('see-more');

let currentCocktail = null;

async function getRandomCocktail() {
    try {
        const response = await fetch(baseUrl);
        const data = await response.json();
        currentCocktail = data.drinks[0];
        cocktailName.textContent = currentCocktail.strDrink;
        cocktailImg.src = currentCocktail.strDrinkThumb;

        // Återställ knappen "Add to Favorites"
        addBtn.textContent = "Add to Favorites";
        addBtn.style.backgroundColor = "#4CAF50";

    } catch (error) {
        console.error("Error fetching cocktail:", error);
    }
}


newCocktailBtn.addEventListener('click', () => getRandomCocktail());    
  
seeMoreBtn.addEventListener('click', () => {
    if (seeMoreBtn.textContent === "See More" && currentCocktail) {
        displayDrinkDetails(currentCocktail);
        seeMoreBtn.textContent = "See Less";
    } else if (seeMoreBtn.textContent === "See Less" && currentCocktail) {
        const detailsSection = document.getElementById('details');
        detailsSection.innerHTML = "";
        seeMoreBtn.textContent = "See More";
    }
});

const addBtn = document.getElementById('add-favorite');

addBtn.addEventListener('click', () => {
    if (addBtn.textContent === "Add to Favorites" && currentCocktail) {
        saveFavoriteCocktails(currentCocktail);
        addBtn.textContent = "Remove from Favorites";
        addBtn.style.backgroundColor = "red";
    } else if (addBtn.textContent === "Remove from Favorites" && currentCocktail) {
        removeFavoriteCocktails(currentCocktail.idDrink);
        addBtn.textContent = "Add to Favorites";
        addBtn.style.backgroundColor = "#4CAF50";
    }
});



function displayDrinkDetails(drink) {
    const detailsSection = document.querySelector('.active #details');
    const detailsHtml = `
        <p><strong>ID:</strong> ${drink.idDrink}</p>
        <p><strong>Categori:</strong> ${drink.strCategory}</p>
        <p><strong>Alkohol:</strong> ${drink.strAlcoholic}</p>
        <p><strong>Glass:</strong> ${drink.strGlass}</p>
        <p><strong>Instructions:</strong> ${drink.strInstructions}</p>
        <p><strong>Ingredients:</strong></p>
        <ul>${getIngredientsList(drink)}</ul>
    `;
    detailsSection.innerHTML = detailsHtml;
}

function getIngredientsList(drink) {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingredient) {
            ingredients.push(`<li>${measure ? measure + ' ' : ''}${ingredient}</li>`);
        }
    }
    return ingredients.join('');
}

// Navigation
const homeLink = document.getElementById('home-link');
const homeSection = document.getElementById('home');
const searchLink = document.getElementById('search-link');
const searchSection = document.getElementById('search');


homeLink.addEventListener('click', () => showSection(homeSection));
searchLink.addEventListener('click', () => showSection(searchSection));


// Show initial section
function showSection(section) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    section.classList.add('active');
}


// search Form
const searchForm = document.getElementById('search-form');
const searchResults = document.getElementById('search-results');
const pagination = document.createElement('div');
pagination.id = 'pagination';
document.getElementById('search').appendChild(pagination);

let currentPage = 1;
let cocktailsPerPage = 10;
let allResults = [];

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    currentPage = 1;
    const searchName = document.getElementById('search-name').value;
    const searchIngredient = document.getElementById('search-ingredient').value;
    const searchCategory = document.getElementById('search-category').value;
    const searchGlass = document.getElementById('search-glass').value;
    let url = '';

    // Bygg URL beroende på vilket faltet som är ifyllt
    if (searchName) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchName}`;
    } else if (searchIngredient) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchIngredient}`;
    } else if (searchCategory) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${searchCategory}`;
    } else if (searchGlass) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?g=${searchGlass}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.drinks) {
            searchResults.innerHTML = '<li>No results found</li>';
            pagination.innerHTML = '';
            return;
        }

        // Spara alla resultat och visa första sidan
        allResults = data.drinks;
        currentPage = 1;
       displaySearchResults();

    } catch (error) {
        console.error('Error fetching data:', error);
        searchResults.innerHTML = '<li>Error fetching results. Please try again.</li>';
    }
});


function displaySearchResults() {
    searchResults.innerHTML = '';
    pagination.innerHTML = '';

    const start = (currentPage - 1) * cocktailsPerPage;
    const end = start + cocktailsPerPage;
    const pageResults = allResults.slice(start, end);

    pageResults.forEach(drink => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
            <p><strong>${drink.strDrink}</strong></p>
            <button class="add-to-favorites" data-id="${drink.idDrink}">Add to Favorites</button>
        `;
        li.addEventListener('click', () => fetchDrinkDetails(drink));
        searchResults.appendChild(li);

        // Add event listener for "Add to Favorites" button
        const addToFavoritesBtn = li.querySelector('.add-to-favorites');
        addToFavoritesBtn.addEventListener('click', () => {
            if (addToFavoritesBtn.textContent === "Add to Favorites") {
                saveFavoriteCocktails(drink);
                addToFavoritesBtn.textContent = "Remove from Favorites";
                addToFavoritesBtn.style.backgroundColor = "red";
            } else if (addToFavoritesBtn.textContent === "Remove from Favorites") {
                removeFavoriteCocktails(drink.idDrink);
                addToFavoritesBtn.textContent = "Add to Favorites";
                addToFavoritesBtn.style.backgroundColor = "#4CAF50";
            }
        });
    });

    renderPaginationButtons();
}

function renderPaginationButtons() {
    const totalPages = Math.ceil(allResults.length / cocktailsPerPage);

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            currentPage--;
            displaySearchResults();
        });
        pagination.appendChild(prevButton);
    }

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pagination.appendChild(pageInfo);

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            currentPage++;
            displaySearchResults();
        });
        pagination.appendChild(nextButton);
    }
}

async function fetchDrinkDetails(drink) {
    try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
        const data = await response.json();

        if (!data.drinks || data.drinks.length === 0) {
            searchResults.innerHTML = '<p>Details not found</p>';
            return;
        }
        const details = data.drinks[0];
        displayDrinkDetails(details);
    } catch (error) {
        console.error("Error fetching drink details:", error);
        return null;
    }
}


//favorit Section
const favoritesLink = document.getElementById('favorites-link');
const favoritesSection = document.getElementById('favorites');
const favoriteList = document.getElementById('favorites-list');

favoritesLink.addEventListener('click', () => {
    showSection(favoritesSection);
    displayFavoriteCocktails();
});

let favoriteCocktails = JSON.parse(localStorage.getItem('favoriteCocktails')) || [];

function saveFavoriteCocktails(currentCocktail) {
    const index = favoriteCocktails.findIndex(cocktail => cocktail.idDrink === currentCocktail.idDrink);
    if (index === -1) {
        favoriteCocktails.push(currentCocktail);
        alert(`${currentCocktail.strDrink} added to favorites`)
    } else {
        alert(`${currentCocktail.strDrink} is already in favorites`)
    }
    localStorage.setItem('favoriteCocktails', JSON.stringify(favoriteCocktails));
    styleFavoriteSection();

}

function removeFavoriteCocktails(cocktailId) {
    const index = favoriteCocktails.findIndex(cocktail => cocktail.idDrink === cocktailId);
    if (index !== -1) {
        const cocktailName = favoriteCocktails[index].strDrink;
        favoriteCocktails.splice(index, 1);
        localStorage.setItem('favoriteCocktails', JSON.stringify(favoriteCocktails));
        alert(`${cocktailName} removed from favorites`)
        displayFavoriteCocktails();
        styleFavoriteSection();
    }
}

function displayFavoriteCocktails() {
    favoriteList.innerHTML = '';
    favoriteCocktails.forEach(cocktail => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
            <p><strong>${cocktail.strDrink}</strong></p>
            <button class="remove-favorite" data-id="${cocktail.idDrink}">Remove</button>
        `;
        favoriteList.appendChild(li);

        const removeFavoriteBtn = li.querySelector('.remove-favorite');
        removeFavoriteBtn.addEventListener('click', () => {
            removeFavoriteCocktails(cocktail.idDrink);
        });

    });
}


// style favorit Section
function styleFavoriteSection() {
    favoritesLink.style.transition = 'color 0.3s ease'; // Add smooth transition for color
    if (favoriteCocktails.length > 0) {
        favoritesLink.style.color = 'red';
    } else {
        favoritesLink.style.color = ''; // Reset to default color
    }
}


document.addEventListener('DOMContentLoaded', () => {
    styleFavoriteSection();
    getRandomCocktail();
});
