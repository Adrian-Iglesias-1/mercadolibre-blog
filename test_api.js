async function testSearchAPI() {
  const query = 'auriculares';
  const url = `http://localhost:3000/api/products?q=${encodeURIComponent(query)}`;
  console.log(`Testing API: ${url}`);
  
  // Since I can't easily fetch from localhost here, I'll simulate the route logic
  const { getMLProducts } = require('./lib/mercadolibre');
  
  try {
    const products = await getMLProducts(query);
    console.log(`Found ${products.length} products`);
    if (products.length > 0) {
      console.log('First product:', products[0].title);
    } else {
      console.log('No products found');
    }
  } catch (e) {
    console.error('API Error:', e);
  }
}

testSearchAPI();
