import './App.css';
import Api from "./utils/Api";
import md5 from 'md5';
import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import Filter from './components/Filter/Filter';

function App() {

  const apiUrl = 'http://api.valantis.store:40000/';
  const [products, setProducts] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [isPreviousDisabled, setIsPreviousDisabled] = useState(true);


  const api = new Api({
    url: apiUrl
  });

  // Функция для формирования авторизационной строки
  function generateAuthString(password) {
    const currentDay = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return md5(`${password}_${currentDay}`);
  }

  // Функция для выполнения запроса к API
  async function requestToServer(action, params, password) {

    //опции
    const authString = generateAuthString(password);
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth': authString
      },
      body: JSON.stringify({ action, params })
    };

    //запрос
    try {
      const response = await api.sendRequest(requestOptions);
      return response.result;
    } catch (error) {
      console.error('Error:', error.message);
      const response = await api.sendRequest(requestOptions);
      return response.result;
    }
  }

  // Получение всех Id товаров
  async function getAllProductIds() {
    const productIds = await requestToServer('get_ids', { offset: 0 }, 'Valantis');
    const uniqueProductsId = [];
    productIds.forEach(productId => {
      if (!uniqueProductsId.includes(productId)) {
        uniqueProductsId.push(productId);
      }
    });
    return uniqueProductsId;
  }

  // Получение подробной информации о товаре по его идентификатору
  async function getProductDetails(productIds) {
    const products = await requestToServer('get_items', { ids: productIds }, 'Valantis');
    if (!products) {
      return [];
    }
    const uniqueProducts = [];
    const uniqueProductsId = [];
    products.forEach(product => {
      if (!uniqueProductsId.includes(product.id)) {
        uniqueProducts.push(product);
        uniqueProductsId.push(product.id)
      }
    });
    return uniqueProducts;
  }

  const itemsPerPage = 50;
  useEffect(() => {
    const getProductDetails1 = async function () {
      setIsLoading(true);
      const offset = itemOffset;
      if (productIds.length >= 0) {
        const productDetails = await getProductDetails(productIds.slice(offset, offset + itemsPerPage));
        setProducts(productDetails);
      }
      setIsLoading(false);
    }
    getProductDetails1();
  }, [itemOffset, productIds]);

  useEffect(() => {
    getAllProductIds()
      .then(async productIds => {
        setProductIds(productIds);
      });
  }, []);

  const [pageCount, setPageCount] = useState(Math.ceil(productIds.length / itemsPerPage));

  const handlePageClick = (e) => {
    const newPage = e.selected;
    const newOffset = newPage * itemsPerPage;
    setCurrentPage(newPage);
    setItemOffset(newOffset);
    setIsNextDisabled(newPage >= pageCount - 1); // Обновляем состояния доступности кнопок
    setIsPreviousDisabled(newPage === 0);
  };

  // Вычисление количества страниц для пагинации
  useEffect(() => {
    const newPageCount = Math.ceil(productIds.length / itemsPerPage);
    setCurrentPage(0); // Сбрасываем текущую страницу в начало после фильтрации
    setPageCount(newPageCount); // Устанавливаем количество страниц
  }, [productIds.length, itemsPerPage]);



  //фильтрация
  async function filterBrands(brandName) {
    const brandsAfterFilter = await requestToServer('filter', { brand: brandName }, 'Valantis');
    return brandsAfterFilter;
  }

  async function filterPrices(productPrice) {
    const pricesAfterFilter = await requestToServer('filter', { price: productPrice }, 'Valantis');
    return pricesAfterFilter;
  }

  async function filterProductName(productName) {
    const productNamesAfterFilter = await requestToServer('filter', { product: productName }, 'Valantis');
    return productNamesAfterFilter;
  }

  // общая фильтрация
  const applyFilter = async (appliedFilters) => {
    let filteredPrice = [];
    let filteredProducts = [];
    let filteredBrands = [];
    const data = [];

    if (appliedFilters.price) {
      filteredPrice = await filterPrices(appliedFilters.price);
      data.push(filteredPrice);
    }

    if (appliedFilters.product) {
      filteredProducts = await filterProductName(appliedFilters.product);
      data.push(filteredProducts);
    }

    if (appliedFilters.brand) {
      filteredBrands = await filterBrands(appliedFilters.brand);
      data.push(filteredBrands);
    }

    if (data.length === 0) {
      getAllProductIds()
        .then(async productIds => {
          setProductIds(productIds);
        });
    } else {
      const result = data.reduce((a, b) => a.filter(c => b.includes(c)));
      setProductIds(result);
    }
  }

  return (
    <div className="App">
      <h1 className='App__header'>Онлайн магазин</h1>
      <div className='main__container'>
        <Filter
          handleFilter={applyFilter}
        />
        <div className='product__list-container'>
          {isLoading ? (<span className='loader'></span>) : (
            <div className='product__list'>
              {products.length > 0 ?
                products?.map((product, index) => (
                  <div key={index} className="product__item">
                    <h3 className='product__header'>{product.product}</h3>
                    <p className='product__brand'>Бренд: {product.brand ? product.brand : "-"}</p>
                    <p className='product__price'>Цена: {product.price}</p>
                  </div>
                ))
                : <p className="product-notfound-list">По вашему запросу ничего не найдено.</p>
              }
            </div>
          )}
          <div className='pagination-container'>
            <ReactPaginate
              className={`react-pagination ${isNextDisabled ? 'next-disabled' : ''} ${isPreviousDisabled ? 'previous-disabled' : ''}`}
              breakLabel="..."
              nextLabel="Вперед"
              onPageChange={handlePageClick}
              pageRangeDisplayed={4}
              marginPagesDisplayed={1}
              forcePage={currentPage}
              pageCount={pageCount}
              previousLabel="Назад"
              renderOnZeroPageCount={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
