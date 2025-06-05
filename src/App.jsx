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
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [cocktails, setCocktails] = useState({ drinks: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCocktails, setSelectedCocktails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchRandomCocktails = async () => {
    setIsLoading(true);
    try {
      const randomCocktails = await Promise.all(
        Array(10).fill().map(() => 
          fetch(`${API_BASE_URL}/random.php`)
            .then(res => res.json())
            .then(data => data.drinks?.[0])
            .catch(() => null)
        )
      );
      const validCocktails = randomCocktails.filter(Boolean);
      setSuggestions(validCocktails);
      setCocktails({ drinks: validCocktails });
    } catch (error) {
      console.error('Error fetching random cocktails:', error);
      setSuggestions([]);
      setCocktails({ drinks: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const shouldLoadRandom = !isLoading && 
      suggestions.length === 0 && 
      (!cocktails?.drinks || cocktails.drinks.length === 0) && 
      selectedCocktails.length === 0;
    
    if (shouldLoadRandom) {
      fetchRandomCocktails();
    }
  }, [isLoading, suggestions.length, cocktails?.drinks?.length, selectedCocktails.length]);

  const handleSearch = async (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setCocktails({ drinks: suggestions });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/search.php?s=${term}`);
      const data = await response.json();
      setCocktails({ drinks: data.drinks || [] });
    } catch (error) {
      console.error('Error searching cocktails:', error);
      setCocktails({ drinks: [] });
    } finally {
      setIsLoading(false);
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

    setSelectedCocktails(current => {
      const index = current.findIndex(cocktail => cocktail.idDrink === cocktailId);
      if (index === -1) return current;
      
      const newCocktails = [...current];
      newCocktails.splice(index, 1);
      return newCocktails;
    });
  };

  const renderCocktailCard = (cocktail) => (
    <Grid item xs={12} sm={6} md={4} key={cocktail.idDrink}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: 3,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}>
        <CardMedia
          component="img"
          height="180"
          image={cocktail.strDrinkThumb}
          alt={cocktail.strDrink}
        />
        <CardContent sx={{ flexGrow: 1 }}>
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
    <Card key={cocktail.idDrink} sx={{ 
      p: 2, 
      bgcolor: 'grey.50',
      mb: 2,
      '&:last-child': { mb: 0 }
    }}>
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

  const renderCocktailList = () => (
    <Box sx={{ p: 2 }}>
      <Typography 
        variant="h5" 
        fontWeight={600} 
        gutterBottom 
        color="primary.main"
        sx={{ letterSpacing: '0.02em' }}
      >
        Your Cocktail List
      </Typography>
      <Stack spacing={2}>
        {selectedCocktails.length === 0 ? (
          <Typography color="text.secondary" align="center">
            Your cocktail list is empty. Add some cocktails to get started!
          </Typography>
        ) : (
          parseDrinks(selectedCocktails)?.map(renderSelectedCocktail)
        )}
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        background: `linear-gradient(120deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)`,
        overflow: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
          animation: 'rotate 30s linear infinite',
          zIndex: 0,
          pointerEvents: 'none'
        },
        '@keyframes rotate': {
          '0%': {
            transform: 'rotate(0deg)'
          },
          '100%': {
            transform: 'rotate(360deg)'
          }
        }
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(120deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)`,
          zIndex: -1,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '200%',
            height: '200%',
            top: '-50%',
            left: '-50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
            animation: 'rotate 30s linear infinite',
            pointerEvents: 'none'
          }
        }}
      />
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: { xs: 'space-between', md: 'center' }, 
          alignItems: 'center', 
          mb: 4,
          position: 'relative'
        }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.05em',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Cocktail Explorer
          </Typography>
          {isMobile && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDrawerOpen(true)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#1a237e',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                position: { xs: 'static', md: 'absolute' },
                right: 0
              }}
            >
              See Ingredients
            </Button>
          )}
        </Box>
        
        <Box 
          display="flex" 
          justifyContent="center" 
          mb={4}
        >
          <TextField
            placeholder="Search cocktails by name..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            sx={{
              width: { xs: '100%', sm: 320 },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input': {
                color: '#1a237e',
                '&::placeholder': {
                  color: 'rgba(26, 35, 126, 0.7)',
                  opacity: 1
                }
              },
              '& .MuiFormHelperText-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
            helperText="Type a cocktail name to search"
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {!searchTerm && !isLoading && cocktails.drinks.length > 0 && (
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.03em'
                }}
              >
                Suggestions
              </Typography>
            )}
            <Grid container spacing={3}>
              {isLoading ? (
                <Grid item xs={12}>
                  <Typography align="center" sx={{ color: 'white', opacity: 0.9 }}>
                    Loading suggestions...
                  </Typography>
                </Grid>
              ) : !cocktails?.drinks?.length ? (
                <Grid item xs={12}>
                  <Typography align="center" sx={{ color: 'white', opacity: 0.9 }}>
                    {searchTerm ? 'No cocktails found. Try a different search term.' : 'Loading suggestions...'}
                  </Typography>
                </Grid>
              ) : (
                cocktails.drinks.map(renderCocktailCard)
              )}
            </Grid>
          </Grid>

          {!isMobile && (
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  minHeight: 300,
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {renderCocktailList()}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography 
            variant="h6" 
            fontWeight={600} 
            color="primary.main"
          >
            Your Cocktail List
          </Typography>
          <IconButton 
            onClick={() => setDrawerOpen(false)}
            sx={{ color: 'primary.main' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {selectedCocktails.length === 0 ? (
              <Typography color="text.secondary" align="center">
                Your cocktail list is empty. Add some cocktails to get started!
              </Typography>
            ) : (
              parseDrinks(selectedCocktails)?.map(renderSelectedCocktail)
            )}
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}

export default App;
