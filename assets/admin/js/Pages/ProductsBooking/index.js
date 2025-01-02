import React, { useEffect } from 'react'
import SearchBox from '../../Components/Products/SearchBox'
import ListProductsBooking from '../../Components/Products/ListProductsBooking'
import { useState } from 'react'
import { ToastContainer } from 'react-toastify'

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
        <ToastContainer />
    </div>
  )
}

export default ProductsBooking