// Controller for Database Old page
const { getOldDate, getOldDateByYear, searchByName, getYearsAvailable } = require("../models/oldDb-model");
const databaseOldController = {};

databaseOldController.buildPage = async (req, res) => {
    try {
        const year = req.query.year;
        const search = req.query.search;
        const years = await getYearsAvailable();
        
        let patients = [];
        let selectedYear = null;
        let searchTerm = null;
        let searchMode = false;

        if (search && search.trim()) {
            // Search mode: find by name
            patients = await searchByName(search.trim());
            searchTerm = search.trim();
            searchMode = true;
        } else if (year) {
            // Year mode: fetch data for specific year
            const yearInt = parseInt(year);
            if (!isNaN(yearInt) && years.includes(yearInt)) {
                patients = await getOldDateByYear(yearInt);
                selectedYear = yearInt;
            }
        }
        
        res.render('databaseOld', { 
            title: 'Database Old', 
            user: req.user, 
            patients: patients,
            years: years,
            selectedYear: selectedYear,
            searchTerm: searchTerm,
            searchMode: searchMode
        });

    } catch (error) {
        console.error('Error rendering databaseOld page:', error);
        res.status(500).send('Internal Server Error');
    }
  
};

module.exports = databaseOldController;