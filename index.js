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


// Search cocktails
// const searchForm = document.getElementById('search-form');
// const searchInput = document.getElementById('search-input');
// const searchResults = document.getElementById('search-results');
// let currentDrink = null;

// searchForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const query = searchInput.value.trim();
//     if (!query) return; // Exit if the input is empty
//     const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${query}`);
//     const data = await res.json();
//     searchResults.innerHTML = '';
//     if (!data.drinks) {
//         searchResults.innerHTML = '<li>No results found</li>';
//         return;
//     }
//     data.drinks.forEach(drink => {
//         const li = document.createElement('li');
//         li.innerHTML = `
//         <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="result-thumb">
//         <span>${drink.strDrink}</span>
//     `;
//         li.addEventListener('click', () => {
//             displayDetailsInSearch(drink);
//         });
//         searchResults.appendChild(li);
//     });
// });

const searchForm = document.getElementById('search-form');
const searchResults = document.getElementById('search-results');

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
            return;
        }

        // Visa sökresultaten
        data.drinks.forEach(drink => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" style="width: 100px; height: 100px; border-radius: 10px;">
                <strong>${drink.strDrink}</strong>
            `;
            li.addEventListener('click', () => {
                displayDetailsInSearch(drink);
            })
            searchResults.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        searchResults.innerHTML = '<li>Error fetching results. Please try again.</li>';
    }
});




// Funktion för att visa detaljer i söksektionen
function displayDetailsInSearch(drink) {
    const detailsHTML = `
        <div class="cocktail-details">
            <h2>${drink.strDrink}</h2>
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
            <h3>Details</h3>
            <p><strong>Category:</strong> ${drink.strCategory}</p>
            <p><strong>Glass:</strong> ${drink.strGlass}</p>
            <p><strong>Instructions:</strong> ${drink.strInstructions}</p>
            <p><strong>Ingredients:</strong></p>
            <ul>
                ${getIngredientsList(drink)}
            </ul>
        </div>
    `;

    // Lägg till detaljerna under sökresultaten
    searchResults.innerHTML = detailsHTML;
}


const searchLink = document.getElementById('search-link');
const searchSection = document.getElementById('search');
const homeLink = document.getElementById('home-link');
const homeSection = document.getElementById('home');

homeLink.addEventListener('click', () => showSection(homeSection));
searchLink.addEventListener('click', () => showSection(searchSection));
function showSection(section) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    section.classList.add('active');
}


getRandomDrinks();

