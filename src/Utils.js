const MAX_LENGTH = 15;
const PREFIX_INGREDIENT = "strIngredient";
const PREFIX_MEASURE = "strMeasure";

export const parseDrinks = (drinks) => {
  var cocktails = [];
  for (const apiCocktail of drinks) {
    var cocktail = { idDrink: "", name: "", ingredients: [], cpt: 0 };

    const foundIndex = cocktails.findIndex(
      (cocktail) => cocktail.idDrink === apiCocktail.idDrink
    );
    if (foundIndex === -1) {
      cocktail.idDrink = apiCocktail.idDrink;
      cocktail.name = apiCocktail.strDrink;
      cocktail.ingredients = parseIngredients(apiCocktail);
      cocktail.cpt = 1;
      cocktails.push(cocktail);
    } else {
      const newIngredients = parseIngredients(apiCocktail);
      cocktails[foundIndex].ingredients = addIngredients(
        cocktails[foundIndex].ingredients,
        newIngredients
      );
      cocktails[foundIndex].cpt += 1;
    }
  }
  return cocktails;
};

function isNumber(str) {
 if (isNaN(parseFloat(str))) {
    return false;
  }
  return true; 
}

function addIngredients(existingIngredients, newIngredients) {
  var resIngredients = [];
  existingIngredients.forEach((element, index) => {
    resIngredients.push({
      name: element.name,
      quantity: element.quantity + newIngredients[index].quantity,
      unity: element.unity,
    });
  });
  return resIngredients;
}

function parseMeasureQuantity(strMeasure) {
  // 1 1/2 oz => 1,5 oz
  // 1,5 oz => [1, 1/2, oz] => oz => [1, 1/2], res.measure = oz
  var res = { measure: "", quantity: 0 };
  if (strMeasure == null) return res;

  var measure = strMeasure.trim();
  var splittedMeasure = measure.split(" ");

  if (splittedMeasure.length === 0) return res;

  var m = splittedMeasure[splittedMeasure.length - 1];
  while (splittedMeasure.length !== 0 && !isNumber(m)) {
    splittedMeasure.pop();
    res.measure = m;
    m = splittedMeasure[splittedMeasure.length - 1];
  }

  res.quantity = splittedMeasure.reduce(
    (acc, val) => (isNumber(val) ? eval(acc) + eval(val) : eval(acc)),
    0
  );
  res.measure = res.measure.trim();
  return res;
}

export const parseIngredients = (drink) => {
  let ingredients = [];
  for (let index = 1; index <= MAX_LENGTH; index++) {
    const strIngredient = PREFIX_INGREDIENT + index;
    const strMeasure = PREFIX_MEASURE + index;
    let ingredient = { name: "", quantity: 0, unity: "" };
    if (drink[strIngredient] != null) {
      ingredient.name = drink[strIngredient];
    }
    if (drink[strMeasure] != null) {
      var parsedMeasure = parseMeasureQuantity(drink[strMeasure]);
      ingredient.quantity = parsedMeasure.quantity;
      ingredient.unity = parsedMeasure.measure;
    }
    if (ingredient.name.length !== 0) {
      ingredients.push(ingredient);
    }
  }

  return ingredients;
};

export const clone = (data) => {
  return data;
};
