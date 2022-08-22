import { useState, useEffect } from "react";
import {parseIngredients, clone, parseDrinks} from './Utils';

function App() {
  const [cocktails, setCocktails] = useState("");
  const [result, setResult] = useState("");
  const [cocktailSelected, setCocktailsSelected] = useState([]);
  const [cocktailsOnList, setCocktailsOnList] = useState("");
  
  const changeHandler = (e) => {
    const letter = e.target.value;
    const url = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=' + letter;
    fetch(url)
    .then((response) => response.json())
    .then((data) => setCocktails(data));
  }
  
  const addOnList = (e) => {
    e.preventDefault();
    const cocktail_id = e.target.attributes.getNamedItem('cocktail-id').value;
    const url = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=' + cocktail_id;
    fetch(url)
    .then((response) => response.json())
    .then((data) => (data.drinks != null && data.length !== 0) ? setCocktailsSelected(current => [...current, data.drinks[0]]) : null);
  }
  
  const removeFromList = (e) => {
    const cocktailId = e.target.getAttribute('cocktail_id');
    if (!cocktailId) {
      return;
    }
    const foundIndex = cocktailSelected.findIndex((cocktail) => cocktail.idDrink === cocktailId);
    if (foundIndex === -1) {
      return;
    }

    var clonedCocktailSelected = clone(cocktailSelected);
    clonedCocktailSelected.splice(foundIndex, 1);
    setCocktailsSelected(clonedCocktailSelected);
  }
  
  useEffect(() => {
    if (cocktailSelected) {
      showCocktails();
    }
  }, [cocktailSelected]);
  
  const showCocktails = () => {
    const data = parseDrinks(cocktailSelected);
    if(data) {
      // let accumulatedCocktail = retriveAccumulatedCocktails(data);
      let cocktailsOnList = data.map((cocktail) => (
        <div className="main-list" key={cocktail.idDrink}>
        <h2 className='main-title'><b>{cocktail.name}</b> ({cocktail.cpt}) </h2>
        {cocktail.ingredients.map((ingredient) => (
          <h2 className='main-ingredient'>{ingredient.name} - {ingredient.quantity} {ingredient.unity} </h2>
        ))}
        <button className='remove-btn' cocktail_id={cocktail.idDrink} onClick={removeFromList}>Remove</button>
        </div>
        ));
        setCocktailsOnList(cocktailsOnList);
      }
    }
    
    const showResult = (e) => {
      e.preventDefault();
      const data = cocktails.drinks;
      if(data) {
        let listCocktails = data.map((cocktail) => (
          <div className="main-card" key={cocktail.idDrink}>
          <img
          src={cocktail.strDrinkThumb}
          alt='cocktails'
          height='200'
          width='200'
          />
          <h2 className='main-title'>{cocktail.strDrink}</h2>
          <button className='add-btn' cocktail-id={cocktail.idDrink} onClick={addOnList}>Add</button>
          </div>
          ));
          setResult(listCocktails);
        }
      }
      
      return (
        <>
        <div className='main-container'>
        <form onSubmit={showResult}>
        <div className='search-container'>
        <input type='search' className='search-field' onChange={changeHandler}/><br/>
        <button type='submit' className='submit-btn'> Search Cocktails</button>
        </div>
        </form>
        </div>
        <div>{result}</div>
        <div>{cocktailsOnList}</div>
        </>
        );
      }
      
      export default App;
      