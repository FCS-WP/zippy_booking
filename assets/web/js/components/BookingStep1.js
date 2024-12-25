import React, { useEffect, useState } from "react";
import { webApi } from "../api";
import { generateOauthParams } from "../helper/oauth";

const BookingStep1 = ({ handleNextStep }) => {
  const [categorySelected, setCategorySelected] = useState({});
  const [productSelected, setProductSelected] = useState({});
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeProduct, setActiveProduct] = useState(-1);
  const [wooCategories, setWooCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const keys = {
    oauth_consumer_key: 'ck_3db429d3298df0c779072f665ef65b85eb3f3e8d',
    oauth_consumer_secret: 'cs_40b254f2067a918f5f40f3fd13e7dd8b7d24cbc6'
  };

  const config = {
    "duration":"30",
    "weekdays":["1","2","3","5"],
    "open_at": "07:00",
    "close_at": "23:00",
    "available_categories": [26, 27]
  };
  

  const getWooCategories = async () => {
    const params = generateOauthParams('http://localhost:86/wp-json/wc/v3/products/categories', keys)
    const categories = await webApi.getWooCategories(params);
    const availableArr = categories.data.filter((item, index)=> {
      return config['available_categories'].includes(item.id); 
    })
    setWooCategories(availableArr);
    getProductByCategoryID(availableArr[0].id);
  }

  const getProductByCategoryID = async (category_id) => {
    const params = generateOauthParams('http://localhost:86/wp-json/wc/v3/products', {
      ...keys,
      category: category_id,
    });
    const wooProducts = await webApi.getWooProductsByCategoryID(params);
    setProducts(wooProducts.data);
    clearSelectedProduct();
  }


  useEffect(() => {

  }, []);

  const clearSelectedProduct = () => {
    setProductSelected(null);
    setActiveProduct(-1);
  };

  const handleSelectCategory = (category, index) => {
    setCategorySelected(category);
    if (activeCategory != index) {
      setActiveCategory(index);
      getProductByCategoryID(category.id);
    }
  };

  const handleSelectProduct = (product, index) => {
    setProductSelected(product);
    setActiveProduct(index);
  };

  const handleSubmitStep1 = () => {
    if (!productSelected) {
        console.log('Select a service please!')
        return;
    }
    const data = {
      product: productSelected,
    }
    handleNextStep(1, data);
  }

  return (
    <>
      <div className="booking-step-1">
        <div>
          <h4>Field</h4>
          <div className="list-category">
            {wooCategories &&
              wooCategories.map((item, index) => (
                <div
                  key={index}
                  className={`category-item ${
                    activeCategory == index ? "active" : ""
                  } `}
                  role="button"
                  onClick={() => handleSelectCategory(item, index)}
                >
                  {item.name}
                </div>
              ))}
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
                  <h5 className="product-title">{product.name}</h5>
                  <span className="product-price">price: ${product.price}</span>
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
      </div>
    </>
  );
};

export default BookingStep1;
