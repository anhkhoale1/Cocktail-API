const MAX_LENGTH = 15;
const PREFIX_INGREDIENT = "strIngredient";
const PREFIX_MEASURE = "strMeasure";

export const parseDrinks = (drinks) => {
  const cocktails = [];
  
  for (const apiCocktail of drinks) {
    const existingIndex = cocktails.findIndex(
      (cocktail) => cocktail.idDrink === apiCocktail.idDrink
    );

    if (existingIndex === -1) {
      cocktails.push({
        idDrink: apiCocktail.idDrink,
        name: apiCocktail.strDrink,
        ingredients: parseIngredients(apiCocktail),
        cpt: 1
      });
    } else {
      const newIngredients = parseIngredients(apiCocktail);
      cocktails[existingIndex].ingredients = addIngredients(
        cocktails[existingIndex].ingredients,
        newIngredients
      );
      cocktails[existingIndex].cpt += 1;
    }
  }
  
  return cocktails;
};

const isNumber = (str) => !isNaN(parseFloat(str));

const addIngredients = (existingIngredients, newIngredients) => {
  return existingIngredients.map((element, index) => ({
    name: element.name,
    quantity: element.quantity + newIngredients[index].quantity,
    unity: element.unity,
  }));
};

const parseMeasureQuantity = (strMeasure) => {
  if (!strMeasure?.trim()) {
    return { measure: "", quantity: "" };
  }

  const measure = strMeasure.trim();
  const splittedMeasure = measure.split(" ");
  const result = { measure: "", quantity: "" };

  if (splittedMeasure.length === 0) {
    return result;
  }

  let m = splittedMeasure[splittedMeasure.length - 1];
  while (splittedMeasure.length !== 0 && !isNumber(m)) {
    splittedMeasure.pop();
    result.measure = m + " " + result.measure;
    m = splittedMeasure[splittedMeasure.length - 1];
  }

  // Handle negative numbers properly
  const numbers = splittedMeasure.filter(isNumber);
  if (numbers.length > 0) {
    result.quantity = numbers.reduce((acc, val) => {
      const num = parseFloat(val);
      return acc + num;
    }, 0);
  }
  
  result.measure = result.measure.trim();
  return result;
};

export const parseIngredients = (drink) => {
  const ingredients = [];
  
  for (let index = 1; index <= MAX_LENGTH; index++) {
    const strIngredient = PREFIX_INGREDIENT + index;
    const strMeasure = PREFIX_MEASURE + index;
    
    if (!drink[strIngredient]) continue;

    const ingredient = {
      name: drink[strIngredient],
      quantity: "",
      unity: ""
    };

    if (drink[strMeasure]?.trim()) {
      const parsedMeasure = parseMeasureQuantity(drink[strMeasure]);
      ingredient.quantity = parsedMeasure.quantity;
      ingredient.unity = parsedMeasure.measure;
    }

    ingredients.push(ingredient);
  }

  return ingredients;
};

export const clone = (data) => {
  return data;
};
