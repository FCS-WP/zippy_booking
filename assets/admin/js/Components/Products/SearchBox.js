import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Typography,
  Grid2 as Grid,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  ListItemButton,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { BsSearch } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: "relative"
}));

const SuggestionsContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 1000,
  backgroundColor: "#fff",
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  marginTop: theme.spacing(1)
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

const SearchBox = () => {
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const dummyCategories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports"
  ];

  const dummyProducts = [
    "Smartphone",
    "Laptop",
    "T-shirt",
    "Novel",
    "Garden Tools"
  ];

  const filteredCategories = dummyCategories.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredProducts = dummyProducts.filter((product) =>
    product.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleCategoryClick = (category) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setCategorySearch("");
  };

  const handleProductClick = (product) => {
    if (!selectedProducts.includes(product)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch("");
  };

  const handleDeleteCategory = (categoryToDelete) => {
    setSelectedCategories(selectedCategories.filter(category => category !== categoryToDelete));
  };

  const handleDeleteProduct = (productToDelete) => {
    setSelectedProducts(selectedProducts.filter(product => product !== productToDelete));
  };

  const handleCategoryKeyDown = (event) => {
    if (event.key === 'Enter' && filteredCategories.length > 0) {
        handleCategoryClick(filteredCategories[0]);
        event.preventDefault();
    }
  }

  const handleProductKeyDown = (event) => {
    if (event.key === 'Enter' && filteredProducts.length > 0) {
        handleProductClick(filteredProducts[0]);
        event.preventDefault();
    }
  }

  const handleApplyCategories = () => {
    if (selectedCategories.length > 0) {
        console.log("Add categories: ", selectedCategories);
    }
  }

  const handleApplyProducts = () => {
    if (selectedProducts.length > 0) {
        console.log("Add products: ", selectedProducts);
    }
  }

  return (
    <Container disableGutters maxWidth={"xxxl"} className="custom-mui">
      <Box py={4}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <StyledPaper>
              <SearchContainer>
                <TextField
                  fullWidth
                  onKeyDown={handleCategoryKeyDown}
                  label="Search Categories"
                  variant="outlined"
                  placeholder="Enter category name..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  slotProps= {{
                    input: { startAdornment: (
                        <InputAdornment position="start">
                          <BsSearch />
                        </InputAdornment>
                      )}
                  }}
           
                />
                {categorySearch && (
                  <SuggestionsContainer>
                    <List>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                          <ListItemButton
                            key={index} 
                            divider={index !== filteredCategories.length - 1}
                            onClick={() => handleCategoryClick(category)}
                          >
                            <ListItemText primary={category} />
                          </ListItemButton>
                        ))
                      ) : (
                        <ListItemButton>
                          <ListItemText
                            primary="No categories found"
                            sx={{ color: "text.secondary" }}
                          />
                        </ListItemButton>
                      )}
                    </List>
                  </SuggestionsContainer>
                )}
              </SearchContainer>
              <Grid container spacing={3} alignItems={'end'}>
                <Grid size={9} >
                    <ChipContainer>
                        {selectedCategories.map((category, index) => (
                        <Chip
                            key={index}
                            label={category}
                            onDelete={() => handleDeleteCategory(category)}
                        />
                        ))}
                    </ChipContainer>
                </Grid>
                <Grid size={3} justifyContent={'end'} textAlign={'end'} alignItems={'end'}>
                    <Button className="btn-hover-float" onClick={handleApplyCategories} variant="contained" startIcon={<FiPlus />}>
                        Apply
                    </Button>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <StyledPaper>
              <SearchContainer>
                <TextField
                  fullWidth
                  label="Search Products"
                  variant="outlined"
                  placeholder="Enter product name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyDown={handleProductKeyDown}
                  slotProps= {{
                    input: { startAdornment: (
                        <InputAdornment position="start">
                          <BsSearch />
                        </InputAdornment>
                      )}
                  }}
                />
                {productSearch && (
                  <SuggestionsContainer>
                    <List>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                          <ListItemButton 
                            key={index} 
                            divider={index !== filteredProducts.length - 1}
                            onClick={() => handleProductClick(product)}
                          >
                            <ListItemText primary={product} />
                          </ListItemButton>
                        ))
                      ) : (
                        <ListItemButton>
                          <ListItemText
                            primary="No products found"
                            sx={{ color: "text.secondary" }}
                          />
                        </ListItemButton>
                      )}
                    </List>
                  </SuggestionsContainer>
                )}
              </SearchContainer>
              <Grid container spacing={3} alignItems={'end'}>
                <Grid size={9} >
                    <ChipContainer>
                    {selectedProducts.map((product, index) => (
                    <Chip
                        key={index}
                        label={product}
                        onDelete={() => handleDeleteProduct(product)}
                    />
                    ))}
                </ChipContainer>
                </Grid>
                <Grid size={3} justifyContent={'end'} textAlign={'end'} alignItems={'end'}>
                    <Button className="btn-hover-float" onClick={handleApplyProducts} variant="contained" startIcon={<FiPlus />}>
                        Apply
                    </Button>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SearchBox;