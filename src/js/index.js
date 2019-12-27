import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from'./views/base';

// Global State
// Search object
// current recipe object
// shopping list object
// liked recipes

const state = {};
window.state = state;

const controlSearch = async () => {
    // 1) get query from view
    
    const query = searchView.getInput();

    if(query) {
        // 2) new search object and add to state
        state.search = new Search(query)

        // 3) Prepare UI for results 
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes)

        try {
            // 4) Search for recipes
            await state.search.getResults();
    
            // 5) render results on UI
            clearLoader()
            searchView.renderResults(state.search.result)
        } catch (err) {
            alert('Something wrong with the search ...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


// Recipe Controller
const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '')
    console.log(id);

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe()
        renderLoader(elements.recipe)

        // Highlight selected search item 
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            console.log(state.recipe.ingredients)
            state.recipe.parseIngredients();
    
            // Caculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        } catch(err) {
            alert('error processing recipe!');
        }
    }
}


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// List CONTROLLER

const controlList = () => {
    // create a new list IF there in none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *' )) {
        // Delete from state
        state.list.deleteItem(id);

        // delete from UI
        listView.deleteItem(id);
        
        // handle the count update
    } else if(e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val)
    } 
})


// Hnadling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe)
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe)
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
})

window.l = new List()