import React, { useEffect } from 'react'
import SearchBox from '../../Components/Products/SearchBox'
import ListProductsBooking from '../../Components/Products/ListProductsBooking'
import { useState } from 'react'

const ProductsBooking = () => {
  const [dataCategories, setDataCategories] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);

  const getAllCategory = () => {
    
  }
  const updateCategories = () => {

  }

  const updateProducts = () => {

  }
  
  useEffect(()=>{
    getAllCategory();
  }, [])

  return (
    <div className='products-booking-page'>
        <SearchBox />
        <ListProductsBooking />
    </div>
  )
}

export default ProductsBooking