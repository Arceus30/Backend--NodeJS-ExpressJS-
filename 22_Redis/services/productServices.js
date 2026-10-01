let products = [
    {
        id: 1,
        name: "Keyboard",
        price: 2000,
    },
    {
        id: 2,
        name: "Mouse",
        price: 1000,
    },
];
let nextId = 3;

async function getProductsFromDatabase() {
    console.log("Querying database...");
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    return products;
}

async function getAllProducts() {
    console.log("DATABASE: get all products");
    return products;
}

async function getProductById(id) {
    console.log(`DATABASE: get product ${id}`);

    return products.find((product) => product.id === id) || null;
}

async function createProduct(name, price) {
    const product = {
        id: nextId++,
        name,
        price,
    };
    products.push(product);
    console.log(`DATABASE: created product ${product.id}`);
    return product;
}

async function updateProduct(id, name, price) {
    const product = products.find((product) => product.id === id);
    if (!product) {
        return null;
    }
    product.name = name;
    product.price = price;
    console.log(`DATABASE: updated product ${id}`);
    return product;
}

async function deleteProduct(id) {
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
        return false;
    }
    products.splice(index, 1);
    console.log(`DATABASE: deleted product ${id}`);
    return true;
}

module.exports = {
    getProductsFromDatabase,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
