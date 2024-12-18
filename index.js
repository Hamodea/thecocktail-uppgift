const baseUrl = "https://www.thecocktaildb.com/api/json/v1/1/random.php";



const cocktailName = document.getElementById('cocktail-name');
const cocktailImg = document.getElementById('cocktail-img');
const newCocktailBtn = document.getElementById('new-cocktail');
const seeMoreBtn = document.getElementById('see-more');

let currentdrink = null;
async function getRandomDrinks() {
    try {
        const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
        const data = await res.json();
        const drink = data.drinks[0];
        currentdrink = drink;
        cocktailName.textContent = drink.strDrink;
        cocktailImg.src = drink.strDrinkThumb;
    } catch (error) {
        console.log(error);
    }

}   


async function getDrinkDetalis() {
    if (!currentdrink) return;
    const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${currentdrink.strDrink}`);
    const data = await res.json();
    if (!data || !data.drinks) return;
    const drink = data.drinks[0];
    const detailsSection = document.getElementById('details');
    const detalisHtml = `
    <p><strong>ID:</strong> ${drink.idDrink}</p>
    <p><strong>Category:</strong> ${drink.strCategory}</p>
    <p><strong>Alcoholic:</strong> ${drink.strAlcoholic}</p>
    <p><strong>Glass:</strong> ${drink.strGlass}</p>
    <p><strong>Instructions:</strong> ${drink.strInstructions}</p>
    <p><strong>Ingredinet:</strong></p>
    <ul>
    ${getIngredientsList(drink)}
    </ul>
  `;
  detailsSection.innerHTML = detalisHtml;
  addFavoriteButton(drink);
}

function getIngredientsList(drink) {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingredient) {
            ingredients.push(`<li>${ingredient} - ${measure || 'to taste'}</li>`);
        }
    }
    return ingredients.join('');
}

seeMoreBtn.addEventListener('click', () => {
    if(seeMoreBtn.textContent === "See More" && currentdrink) {
        getDrinkDetalis(currentdrink);
        seeMoreBtn.textContent = "Hide Details";
    } else {
        const detailsSection = document.getElementById('details');
        detailsSection.innerHTML = "";
        seeMoreBtn.textContent = "See More";
    }
});

newCocktailBtn.addEventListener('click', getRandomDrinks);


const searchForm = document.getElementById('search-form');
const searchResults = document.getElementById('search-results');
const paginationContainer = document.createElement('div');
paginationContainer.id = 'pagination';
document.getElementById("search").appendChild(paginationContainer);


let currentPage = 1;
let resultsPerPage = 10;
let allResults = [];

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hämta värden från alla fält
    const name = document.getElementById('search-name').value.trim();
    const ingredient = document.getElementById('search-ingredient').value.trim();
    const category = document.getElementById('search-category').value.trim();
    const glass = document.getElementById('search-glass').value.trim();

    // Rensa sökresultaten
    searchResults.innerHTML = '';

    // Validera att endast ett fält används
    const inputs = [name, ingredient, category, glass].filter(value => value !== '');
    if (inputs.length !== 1) {
        alert('Fyll endast i ETT fält för att söka!');
        return;
    }

    let url = '';

    // Bygg URL beroende på vilket fält som är ifyllt
    if (name) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`;
    } else if (ingredient) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`;
    } else if (category) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${category}`;
    } else if (glass) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?g=${glass}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.drinks) {
            searchResults.innerHTML = '<li>No results found</li>';
            paginationContainer.innerHTML = '';
            return;
        }

        // Spara alla resultat och visa första sidan
        allResults = data.drinks;
        currentPage = 1;
        renderResults();

    } catch (error) {
        console.error('Error fetching data:', error);
        searchResults.innerHTML = '<li>Error fetching results. Please try again.</li>';
    }
});

// Funktion för att rendera sökresultat på aktuell sida
function renderResults() {
    searchResults.innerHTML = '';
    paginationContainer.innerHTML = '';

    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const pageResults = allResults.slice(start, end);

    pageResults.forEach(drink => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
            <p><strong>${drink.strDrink}</strong></p>
        `;
        li.addEventListener('click', () => displayDetailsInSearch(drink));
        searchResults.appendChild(li);
    });

    renderPaginationButtons();
}

// Funktion för att skapa pagineringsknappar
function renderPaginationButtons() {
    const totalPages = Math.ceil(allResults.length / resultsPerPage);

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            currentPage--;
            renderResults();
        });
        paginationContainer.appendChild(prevButton);
    }

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationContainer.appendChild(pageInfo);

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            currentPage++;
            renderResults();
        });
        paginationContainer.appendChild(nextButton);
    }
}




// Funktion för att visa detaljer i söksektionen
async function displayDetailsInSearch(drink) {
    try {
        // Hämta fullständig information baserat på idDrink
        const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
        const data = await res.json();
        
        if (!data.drinks || data.drinks.length === 0) {
            searchResults.innerHTML = '<p>Details not found</p>';
            return;
        }

        const fullDrink = data.drinks[0];
        const detailsHTML = `
            <div class="cocktail-details">
                <h2>${fullDrink.strDrink}</h2>
                <img src="${fullDrink.strDrinkThumb}" alt="${fullDrink.strDrink}">
                <h3>Details</h3>
                <p><strong>Category:</strong> ${fullDrink.strCategory}</p>
                <p><strong>Glass:</strong> ${fullDrink.strGlass}</p>
                <p><strong>Instructions:</strong> ${fullDrink.strInstructions}</p>
                <p><strong>Ingredients:</strong></p>
                <ul>
                    ${getIngredientsList(fullDrink)}
                </ul>
            </div>
        `;

        // Lägg till detaljerna under sökresultaten
        searchResults.innerHTML = detailsHTML;
    } catch (error) {
        console.error('Error fetching drink details:', error);
        searchResults.innerHTML = '<p>Error fetching drink details. Please try again.</p>';
    }
}


const searchLink = document.getElementById('search-link');
const searchSection = document.getElementById('search');
const homeLink = document.getElementById('home-link');
const homeSection = document.getElementById('home');
const favoritesLink = document.getElementById('favorites-link');
const favoritesSection = document.getElementById('favorites');

homeLink.addEventListener('click', () => showSection(homeSection));
searchLink.addEventListener('click', () => showSection(searchSection));

function showSection(section) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    section.classList.add('active');
}


// Variabler
favoritesLink.addEventListener('click', () => showSection(favoritesSection));
const favoritesList = document.getElementById('favorites-list');
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Ladda favoriter från LocalStorage

// Funktion för att spara till favoriter
function toggleFavorite(cocktail) {
    const index = favorites.findIndex(fav => fav.idDrink === cocktail.idDrink);
    if (index === -1) {
        favorites.push(cocktail); // Lägg till i favoriter
        alert(`${cocktail.strDrink} added to favorites!`);
    } else {
        favorites.splice(index, 1); // Ta bort från favoriter
        alert(`${cocktail.strDrink} removed from favorites!`);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites)); // Uppdatera LocalStorage
    updateFavoriteButton(cocktail.idDrink);
}

// Funktion för att uppdatera "Favorite" knappen
function updateFavoriteButton(cocktailId) {
    const isFavorite = favorites.some(fav => fav.idDrink === cocktailId);
    document.getElementById('favorite-btn').textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
}

// Visa favoriter i favoritsidan
function displayFavorites() {
    favoritesList.innerHTML = ''; // Rensa listan
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<li>No favorites added yet.</li>';
        return;
    }
    favorites.forEach(drink => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" width="100">
            <span>${drink.strDrink}</span>
            <button onclick="removeFavorite('${drink.idDrink}')">Remove</button>
        `;
        favoritesList.appendChild(li);
        console.log(favorites);
    });
}

// Ta bort en favorit
function removeFavorite(cocktailId) {
    favorites = favorites.filter(fav => fav.idDrink !== cocktailId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

// Visa favoritsidan
favoritesLink.addEventListener('click', () => {
    showSection(favoritesSection);
    displayFavorites();
});

// Lägg till Favorite-knapp där detaljer visas
function addFavoriteButton(cocktail) {
    const detailsDiv = document.getElementById('details');
    detailsDiv.innerHTML += `
        <button id="favorite-btn">${favorites.some(fav => fav.idDrink === cocktail.idDrink) ? 'Remove from Favorites' : 'Add to Favorites'}</button>
    `;
    document.getElementById('favorite-btn').addEventListener('click', () => toggleFavorite(cocktail));
}


getRandomDrinks();

