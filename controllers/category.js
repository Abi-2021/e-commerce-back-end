const asyncHandler = require('express-async-handler')
const {Category, Product} = require('../models');

const getCategories = asyncHandler(async (req, res) => {
    // find all categories
    // be sure to include its associated Products
    const categories = await Category.findAll({
        attributes: ['id', 'category_name'],
        include: [{
            model: Product,
            attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
        }]
    });

    res.status(200).json(categories);
});

const getCategory = asyncHandler(async (req, res) => {
    // find one category by its `id` value
    // be sure to include its associated Products
    const categoryId = req.params.id;
    const category = await Category.findOne({
        where: {
            id: categoryId
        },
        attributes: ['id', 'category_name'],
        include: [{
            model: Product,
            attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
        }]
    });

    if (!category) {
        res.status(404);
        throw new Error(`Category id ${categoryId} is not found`);
    }

    res.status(200).json(category);
})

const createCategory = asyncHandler(async (req, res) => {
    // create a new category
    const categoryName = req.body.category_name;
    const category = await Category.create({
        category_name: categoryName
    });

    res.status(201).json(category);
})

const updateCategory = asyncHandler(async (req, res) => {
    // update a category by its `id` value
    const categoryId = req.params.id;
    const category = req.body;

    const updateCategory = await Category.update(category, {
        where: {
            id: categoryId
        }
    });

    if (!updateCategory) {
        res.status(404);
        throw new Error(`Category id ${categoryId} is not found`)
    }

    res.status(200).json(updateCategory);
})

const deleteCategory = asyncHandler(async (req, res) => {
    // delete a category by its `id` value
    const categoryId = req.params.id;

    const wantedCategory = await Category.findOne({
        where: {
            id: categoryId
        }
    });

    if (!wantedCategory) {
        res.status(404);
        throw new Error(`Category id ${categoryId} is not found`)
    }

    // Delete all associated products
    await Product.destroy({
        where: {
            category_id: categoryId
        }
    });

    // Delete category
    await Category.destroy({
        where: {
            id: categoryId
        }
    });
    res.send('ok');
})

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
}