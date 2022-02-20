const router = require('express').Router();
const {getTags, getTag, createTag, updateTag, deleteTag} = require('../../controllers/tag')

// The `/api/tags` endpoint

router.route('/')
    .get(getTags)
    .post(createTag);

router.route('/:id')
    .get(getTag)
    .put(updateTag)
    .delete(deleteTag);

module.exports = router;
