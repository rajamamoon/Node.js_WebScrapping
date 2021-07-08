const cheerio = require('cheerio')
const axios = require('axios')
const https = require("https");
const csv = require("csv-parser");
const fs = require("fs");
var stringify = require("csv-stringify");
var sleep = require('sleep');

var arr = [];
var isbncount = 0;

fs.createReadStream("data1.csv")
  .pipe(csv())
  .on("data", (row) => {
    isbncount++
    console.log(row.isbn);
    var isbn = row.isbn;
    const url = "https://www.bookdepository.com/search?searchTerm="+isbn+"&search=Find+book"
    bookdepository(url);
  })
  .on("end", () => {
    console.log("Total ISBN" + " "+ isbncount);
    console.log("ISBN file successfully processed");
  });

function bookdepository(url){
    axios.get(url).then((response) => {
        console.log(url)
        // Load the web page source code into a cheerio instance
        const $ = cheerio.load(response.data)
      
        // The pre.highlight.shell CSS selector matches all `pre` elements
        // that have both the `highlight` and `shell` class
        const titleElems = $("*[itemprop = 'name']")[0]
        const authorElems = $("*[itemprop = 'name']")[1]
        const descriptionElems = $("*[itemprop = 'description']")[0]
        const lanaguageElems = $("*[itemprop = 'inLanguage']")[0]
        const categoryElems =  $('ol.breadcrumb a')[0]
        const pageElems =  $("*[itemprop = 'numberOfPages']")[0]
        const publishElems =  $("*[itemprop = 'datePublished']")[0]
        const publisherElems =  $("*[itemprop = 'name']")[2]
        const imprintElems =  $("ul.biblio-info li ")[4]
        const typeElems =  $("ul.biblio-info li ")[4]
        const isbnElems =  $("ul.biblio-info li ")[8]
        var titlecontent = $(titleElems).text().trim();
        var authorcontent = $(authorElems).text().trim();
        var descriptioncontent = $(descriptionElems).text().trim().replace(/^\s+|\s+$/gm,'');
        var languagecontent = $(lanaguageElems).text().trim();
        var categorycontent = $(categoryElems).text().trim().replace(/^\s+|\s+$/gm,'');;
        var pagecontent = $(pageElems).text().trim();
        var publishcontent = $(publishElems).text().trim();
        var publishercontent = $(publisherElems).text().trim();
        var imprintcontent = $(imprintElems).text().trim().substring(7).replace(/^\s+|\s+$/gm,'');
        var typecontent = $(typeElems).text().trim().substring(7).replace(/^\s+|\s+$/gm,'');
        var isbncontent = $(isbnElems).text().trim().substring(7).replace(/^\s+|\s+$/gm,'');
        console.log("Title:- " + titlecontent);
        console.log("Author:- "+authorcontent)
        console.log("Description:- "+ descriptioncontent) 
        console.log("Language:- " + languagecontent)
        console.log("Category:- " + categorycontent)
        console.log("Pages:- "+ pagecontent)
        console.log("Published date:- "+ publishcontent)
        console.log("Publisher:- "+ publishercontent)
        console.log("Imprint:- "+ imprintcontent)
        console.log("Type:- "+ typecontent)
        console.log("ISBN:- "+ isbncontent)
      })
}