import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements } from'./views/base';

// Global State
// Search object
// current recipe object
// shopping list object
// liked recipes

const state = {};

const controlSearch = async () => {
    // 1) get query from view
    const query = searchView.getInput();

    if(query) {
        // 2) new search object and add to state
        state.search = new Search(query)

        // 3) Prepare UI for results 
        searchView.clearInput();
        searchView.clearResults();

        // 4) Search for recipes
        await state.search.getResults();

        // 5) render results on UI
        searchView.renderResults(state.search.result)
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})

const search = new Search('pizza');
console.log(search);
search.getResults();
