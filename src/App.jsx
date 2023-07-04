import { useState } from "react";
import { clone, parseDrinks } from "./Utils";

function App() {
  const [cocktails, setCocktails] = useState("");
  const [cocktailSelected, setCocktailsSelected] = useState([]);

  const changeHandler = (e) => {
    const letter = e.target.value;
    const url =
      "https://www.thecocktaildb.com/api/json/v1/1/search.php?f=" + letter;
    fetch(url)
      .then((response) => response.json())
      .then((data) => setCocktails(data));
  };

  const addOnList = (e) => {
    e.preventDefault();
    const cocktail_id = e.target.id;
    const url =
      "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=" + cocktail_id;
    fetch(url)
      .then((response) => response.json())
      .then((data) =>
        data.drinks != null && data.length !== 0
          ? setCocktailsSelected((current) => [...current, data.drinks[0]])
          : null
      );
  };

  const removeFromList = (e) => {
    const cocktailId = e.target.id;
    if (!cocktailId) {
      return;
    }
    const foundIndex = cocktailSelected.findIndex(
      (cocktail) => cocktail.idDrink === cocktailId
    );
    if (foundIndex === -1) {
      return;
    }

    var clonedCocktailSelected = clone(cocktailSelected);
    clonedCocktailSelected.splice(foundIndex, 1);
    setCocktailsSelected([...clonedCocktailSelected]);
  };

  return (
    <>
      <h2 style={{ textAlign: "center" }}>Cocktails api</h2>
      <div className="main-container">
        <div className="search-container">
          <input
            type="search"
            className="search-field"
            onChange={changeHandler}
          />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "900px" }}>
          {cocktails?.drinks?.map((cocktail) => (
            <div className="main-card" key={cocktail.idDrink}>
              <img
                src={cocktail.strDrinkThumb}
                alt="cocktails"
                height="200"
                width="200"
              />
              <h2 className="main-title">{cocktail.strDrink}</h2>
              <button
                className="add-btn"
                id={cocktail.idDrink}
                onClick={addOnList}
              >
                Add
              </button>
            </div>
          ))}
        </div>
        <div>
          {parseDrinks(cocktailSelected)?.map((cocktail) => (
            <div className="main-list" key={cocktail.idDrink}>
              <h2 className="main-title">
                <b>{cocktail.name}</b> ({cocktail.cpt}){" "}
              </h2>
              {cocktail.ingredients.map((ingredient, key) => (
                <h2 className="main-ingredient" key={key}>
                  {ingredient.name} - {ingredient.quantity} {ingredient.unity}{" "}
                </h2>
              ))}
              <button
                className="remove-btn"
                id={cocktail.idDrink}
                onClick={removeFromList}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
