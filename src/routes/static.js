const express = require('express');
const path = require('path');
const router = express.Router();

const staticOptions = {
	maxAge: '7d',
	etag: true,
	lastModified: true,
	index: false
};

const publicDirectory = path.join(__dirname, '..', '..', 'public');

// Cache static assets while allowing ETag validation and normal reloads.
router.use(express.static(publicDirectory, staticOptions));

module.exports = router;



