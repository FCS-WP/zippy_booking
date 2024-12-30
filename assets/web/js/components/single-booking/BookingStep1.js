import React, { useEffect, useState } from "react";
import { webApi } from "../../api";
import { toast } from "react-toastify";
import CustomLoader from "../CustomLoader";

const BookingStep1 = ({ handleNextStep }) => {
  const [isloading, setIsloading] = useState(false);
  const [categorySelected, setCategorySelected] = useState({});
  const [productSelected, setProductSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeProduct, setActiveProduct] = useState(-1);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const getCategories = async () => {
    setIsloading(true);
    const spCategories = await webApi.getSupportCategories();
    const response = spCategories.data;
    if (response.status == "success") {
      setCategories(response.data.categories);
    }

    if (response.data.categories.length == 0) {
      toast.error("No data: Categories.");
    }

    response.data.categories[0].subcategories.length > 0
      ? handleLoadProducts(response.data.categories[0].subcategories[0])
      : handleLoadProducts(response.data.categories[0]);

    setIsloading(false);
  };

  const handleLoadProducts = (category) => {
    const productInCategory = category.subcategory_id
      ? category.subcategory_products
      : category.products_in_category;
    setProducts(productInCategory);
    if (productInCategory.length == 0) {
      toast.error("No data: Products.");
    }
  };

  const x1000 = (number) => {
    return parseInt(number) * 1000;
  };

  useEffect(() => {
    getCategories();
  }, []);

  const clearSelectedProduct = () => {
    setProductSelected(null);
    setActiveProduct(-1);
  };

  const handleSelectCategory = (category, index) => {
    setCategorySelected(category);
    if (activeCategory != index) {
      setActiveCategory(index);
      handleLoadProducts(category);
      clearSelectedProduct();
    }
  };

  const handleSelectProduct = (product, index) => {
    setProductSelected(product);
    setActiveProduct(index);
  };

  const handleSubmitStep1 = () => {
    if (!productSelected) {
      toast.warn("Please fill in all the required information.");
      return;
    }
    handleNextStep(1, productSelected);
  };

  return (
    <>
      <div className="booking-step-1">
        {isloading ? (
          <CustomLoader />
        ) : (
          <>
            <div>
              <h4>Field</h4>
              <div className="list-category">
                {categories &&
                  categories.map((category, index) => {
                    if (category.subcategories.length > 0) {
                      return category.subcategories.map(
                        (subCategory, subIndex) => (
                          <div
                            key={x1000(index) + subIndex}
                            className={`category-item ${
                              activeCategory == x1000(index) + subIndex
                                ? "active"
                                : ""
                            } `}
                            role="button"
                            onClick={() =>
                              handleSelectCategory(
                                subCategory,
                                x1000(index) + subIndex
                              )
                            }
                          >
                            {subCategory.subcategory_name}
                          </div>
                        )
                      );
                    } else {
                      return (
                        <div
                          key={x1000(index)}
                          className={`category-item ${
                            activeCategory == x1000(index) ? "active" : ""
                          } `}
                          role="button"
                          onClick={() =>
                            handleSelectCategory(category, x1000(index))
                          }
                        >
                          {category.category_name}
                        </div>
                      );
                    }
                  })}
              </div>
            </div>
            <div>
              <h4>Field Selection</h4>
              <div className="list-product">
                {products.length != 0 &&
                  products.map((product, index) => (
                    <div
                      key={index}
                      role="button"
                      onClick={() => handleSelectProduct(product, index)}
                      className={`product-item ${
                        activeProduct == index ? "active" : ""
                      }`}
                    >
                      <h5 className="product-title">{product.product_name}</h5>
                      <span className="product-price">
                        price: ${product.product_price}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <div className="text-end">
                <span
                  role="button"
                  onClick={() => handleSubmitStep1()}
                  className="next-step-btn"
                  id="next-step-btn"
                >
                  Continue
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BookingStep1;
