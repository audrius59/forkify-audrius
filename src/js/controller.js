import * as model from './model';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultView from './views/resultsView';
import bookmarksView from './views/bookmarksView';
import paginationView from './views/paginationView';
import addRecipeView from './views/addRecipeView';
import { MODAL_CLOSE_AFTER_MS } from './config';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    resultView.update(model.getSearchResultsPage());

    bookmarksView.update(model.state.bookmarks);

    await model.loadRecipe(id);
    const { recipe } = model.state;

    recipeView.render(recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearcResults = async () => {
  try {
    resultView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);

    resultView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = (goToPage) => {
  resultView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search);
};

const controlServings = (newServings) => {
  model.updateServings(newServings);

  recipeView.update(model.state.recipe);
};

const controlAddBookmark = () => {
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else if (model.state.recipe.bookmarked) {
    model.removeBookmark(model.state.recipe.id);
  }
  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async (recipe) => {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(recipe);

    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_AFTER_MS);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = () => {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearcResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
