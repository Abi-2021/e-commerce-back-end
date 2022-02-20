const asyncHandler = require('express-async-handler')
const {Product, Category, Tag, ProductTag} = require('../models');

const getProducts = asyncHandler(async (req, res) => {
    // find all products
    // be sure to include its associated Category and Tag data
    const products = await Product.findAll({
        attributes: [
            'id',
            'product_name',
            'price',
            'stock'
        ],
        include: [
            {
                model: Category,
                attributes: ['category_name']
            },
            {
                model: Tag,
                attributes: ['tag_name']
            }
        ]
    });

    res.status(200).json(products);
})
const getProduct = asyncHandler(async (req, res) => {
    // find a single product by its `id`
    // be sure to include its associated Category and Tag data
    const productId = req.params.id;

    const product = await Product.findOne({
        where: {
            id: productId
        },
        attributes: [
            'product_name',
            'price',
            'stock'
        ],
        include: [
            {
                model: Category,
                attributes: ['category_name']
            },
            {
                model: Tag,
                attributes: ['tag_name']
            }
        ]
    });

    if(!product){
        res.status(404);
        throw new Error(`Product id ${productId} is not found`);
    }
    res.status(200).json(product);
})
const createProduct = (req, res) => {
    /* req.body should look like this...
  {
    product_name: "Basketball",
    price: 200.00,
    stock: 3,
    tagIds: [1, 2, 3, 4]
  }
*/
    Product.create(req.body)
        .then((product) => {
            // if there's product tags, we need to create pairings to bulk create in the ProductTag model
            if ( req.body.tagIds !== undefined && req.body.tagIds.length) {
                const productTagIdArr = req.body.tagIds.map((tag_id) => {
                    return {
                        product_id: product.id,
                        tag_id,
                    };
                });
                return ProductTag.bulkCreate(productTagIdArr);
            }
            // if no product tags, just respond
            res.status(200).json(product);
        })
        .then((productTagIds) => res.status(200).json(productTagIds))
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
};

const updateProduct = (req, res) => {
    // update product data
    Product.update(req.body, {
        where: {
            id: req.params.id,
        },
    })
        .then((product) => {
            // find all associated tags from ProductTag
            return ProductTag.findAll({where: {product_id: req.params.id}});
        })
        .then((productTags) => {
            // get list of current tag_ids
            const productTagIds = productTags.map(({tag_id}) => tag_id);
            // create filtered list of new tag_ids
            const tagIds = req.body.tagIds !== undefined ? req.body.tagIds : [];
            const newProductTags = tagIds
                .filter((tag_id) => !productTagIds.includes(tag_id))
                .map((tag_id) => {
                    return {
                        product_id: req.params.id,
                        tag_id,
                    };
                });
            // figure out which ones to remove
            const productTagsToRemove = productTags
                .filter(({tag_id}) => !tagIds.includes(tag_id))
                .map(({id}) => id);

            // run both actions
            return Promise.all([
                ProductTag.destroy({where: {id: productTagsToRemove}}),
                ProductTag.bulkCreate(newProductTags),
            ]);
        })
        .then((updatedProductTags) => res.json(updatedProductTags))
        .catch((err) => {
             console.log(err);
            res.status(400).json(err);
        });
}


const deleteProduct = asyncHandler(async (req, res) => {
    // delete one product by its `id` value
    const productId = req.params.id;

    const deletedProduct = await Product.findOne({
        where: {
            id: productId
        }
    });

    if(!deletedProduct){
        res.status(404);
        throw new Error(`Product id ${productId} is not found`);
    }

    await Product.destroy({
        where: {
            id: productId
        }
    })
    res.send('OK');
});

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}