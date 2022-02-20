const asyncHandler = require('express-async-handler')
const {Tag, Product, ProductTag} = require('../models');

const getTags = asyncHandler(async (req, res) => {
    // find all tags
    // be sure to include its associated Product data
    const tags = await Tag.findAll({
        attributes: ['id', 'tag_name'],
        include: [{
            model: Product,
            attributes: ['id', 'product_name', 'price', 'stock']
        }]
    });

    res.status(200).json(tags);
});

const getTag = asyncHandler(async (req, res) => {
    // find a single tag by its `id`
    // be sure to include its associated Product data
    const tagId = req.params.id;
    const tag = await Tag.findOne({
        where: {
            id: tagId
        },
        attributes: ['id', 'tag_name'],
        include: [{
            model: Product,
            attributes: ['id', 'product_name', 'price', 'stock']
        }]
    });

    if (!tag) {
        res.status(404);
        throw new Error(`Tag id ${tagId} is not found`);
    }

    res.status(200).json(tag);
})

const createTag = asyncHandler(async (req, res) => {
    // create a new tag
    const tagName = req.body.tag_name;
    const tag = await Tag.create({
        tag_name: tagName
    });

    res.status(201).json(tag);
})

const updateTag = asyncHandler(async (req, res) => {
    // update a tag's name by its `id` value
    const tagId = req.params.id;
    const tag = req.body;

    const updateTag = await Tag.update(tag, {
        where: {
            id: tagId
        }
    });

    if (!updateTag) {
        res.status(404);
        throw new Error(`Tag id ${tagId} is not found`)
    }

    res.send('OK')
})

const deleteTag = asyncHandler(async (req, res) => {
    // delete on tag by its `id` value
    const tagId = req.params.id;

    const wantedTag = await Tag.findOne({
        where: {
            id: tagId
        }
    });

    if (!wantedTag) {
        res.status(404);
        throw new Error(`Tag id ${tagId} is not found`)
    }
    // Delete associated Product data
    await ProductTag.destroy({
        where: {
            tag_id: tagId
        }
    })

    await Tag.destroy({
        where: {
            id: tagId
        }
    })

    res.send('OK')
})

module.exports = {
    getTags,
    getTag,
    createTag,
    updateTag,
    deleteTag
}