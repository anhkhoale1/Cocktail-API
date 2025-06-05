import { useState, useEffect } from "react";
import { parseDrinks } from "./Utils";
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API_BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

function App() {
  const [cocktails, setCocktails] = useState({ drinks: [] });
  const [selectedCocktails, setSelectedCocktails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRandomCocktails = async () => {
    setIsLoading(true);
    try {
      const randomCocktails = await Promise.all(
        Array(10).fill().map(() => 
          fetch(`${API_BASE_URL}/random.php`)
            .then(res => res.json())
            .then(data => data.drinks[0])
        )
      );
      setCocktails({ drinks: randomCocktails });
    } catch (error) {
      console.error('Error fetching random cocktails:', error);
      setCocktails({ drinks: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!cocktails.drinks.length && !selectedCocktails.length) {
      fetchRandomCocktails();
    }
  }, [cocktails.drinks.length, selectedCocktails.length]);

  const handleSearch = async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      setCocktails({ drinks: [] });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/search.php?s=${searchTerm}`);
      const data = await response.json();
      setCocktails(data);
    } catch (error) {
      console.error('Error searching cocktails:', error);
      setCocktails({ drinks: [] });
    }
  };

  const handleAddCocktail = async (e) => {
    e.preventDefault();
    const cocktailId = e.currentTarget.id;
    
    try {
      const response = await fetch(`${API_BASE_URL}/lookup.php?i=${cocktailId}`);
      const data = await response.json();
      
      if (data.drinks?.[0]) {
        setSelectedCocktails(current => [...current, data.drinks[0]]);
      }
    } catch (error) {
      console.error('Error adding cocktail:', error);
    }
  };

  const handleRemoveCocktail = (e) => {
    const cocktailId = e.currentTarget.id;
    if (!cocktailId) return;

    setSelectedCocktails(current => 
      current.filter(cocktail => cocktail.idDrink !== cocktailId)
    );
  };

  const renderCocktailCard = (cocktail) => (
    <Grid item xs={12} sm={6} md={4} key={cocktail.idDrink}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
        <CardMedia
          component="img"
          height="180"
          image={cocktail.strDrinkThumb}
          alt={cocktail.strDrink}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>{cocktail.strDrink}</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            id={cocktail.idDrink}
            onClick={handleAddCocktail}
            fullWidth
          >
            Add to List
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderIngredient = (ingredient, key) => (
    <Typography variant="body2" color="text.secondary" key={key}>
      • {ingredient.name}
      {ingredient.quantity && ingredient.quantity !== "0" && ingredient.quantity !== "0 " && ingredient.quantity !== 0 && 
        ` ${ingredient.quantity}${ingredient.unity ? ` ${ingredient.unity}` : ''}`}
    </Typography>
  );

  const renderSelectedCocktail = (cocktail) => (
    <Card key={cocktail.idDrink} sx={{ p: 2, bgcolor: 'grey.50' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {cocktail.name} <Typography variant="caption" color="text.secondary">({cocktail.cpt})</Typography>
          </Typography>
          {cocktail.ingredients.map(renderIngredient)}
        </Box>
        <IconButton
          color="error"
          id={cocktail.idDrink}
          onClick={handleRemoveCocktail}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" align="center" gutterBottom fontWeight={700} color="primary.main">
        Cocktail Explorer
      </Typography>
      
      <Box display="flex" justifyContent="center" mb={4}>
        <TextField
          label="Search cocktails by name..."
          variant="outlined"
          onChange={handleSearch}
          sx={{ width: 320 }}
          helperText="Type a cocktail name to search"
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {isLoading ? (
              <Grid item xs={12}>
                <Typography align="center">Loading suggestions...</Typography>
              </Grid>
            ) : (
              Array.isArray(cocktails?.drinks) && cocktails.drinks.map(renderCocktailCard)
            )}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3, minHeight: 300 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom color="secondary.main">
              Your Cocktail List
            </Typography>
            <Stack spacing={2}>
              {parseDrinks(selectedCocktails)?.map(renderSelectedCocktail)}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
