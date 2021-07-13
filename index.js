const cheerio = require('cheerio')
const axios = require('axios')
const csv = require("csv-parser");
const fs = require("fs");
const xlsl = require("xlsx");

var arr = [];
var isbnCount = 0;
var keyCount = 0;

(async() => {
    fs.createReadStream("data1.csv")
    .pipe(csv())
    .on("data", (row) => {
      isbnCount++
      console.log(row.isbn);
      var isbn = row.isbn;

      const url = "https://www.bookdepository.com/search?searchTerm="+isbn+"&search=Find+book"
      const resultData = bookDepository(url, isbn);
      
      var arrayData = resultData.then(function (result){
        arr.push(result);
        return arr
      })

      fileWrite =  arrayData.then( function (arrayResult){
        console.log("Writing to file " + arrayResult[keyCount].ISBN + " " + arrayResult[keyCount].Title);
        const excelResult =  excelWrite(arrayResult);
        return excelResult;
      })

      fileWrite.then( function(data1) {
        console.log(data1)
        keyCount++
      } )

    })
    .on("end", () => {
      console.log("Total ISBN " + isbnCount);
      console.log("ISBN file successfully processed");
    });
})();

async function bookDepository(url , isbn){
  let obj = {};

  const objectReturn =  await axios.get(url).then((response) => {
        // Load the web page source code into a cheerio instance
        const $ = cheerio.load(response.data)

        const titleElem = $("*[itemprop = 'name']")[0]
        const authorElem = $("*[itemprop = 'author']")[0]
        const descriptionElem = $("*[itemprop = 'description']")
        const languageElem = $("*[itemprop = 'inLanguage']")
        const categoryElem =  $('ol.breadcrumb a')[0]
        const pageElem =  $("*[itemprop = 'numberOfPages']")[0]
        const publishElem =  $("*[itemprop = 'datePublished']")
        const publisherElem =  $("*[itemprop = 'publisher']")
        const imprintElem =  $("ul.biblio-info li ")[4]
        const typeElem =  $("ul.biblio-info li span")[0]
        const originElem =  $("ul.biblio-info li")[4]
        const isbnElem =  $("*[itemprop = 'isbn']")
        const imageElem =  $(".item-img-content")

        var titleContent = $(titleElem).text().trim().toUpperCase();
        var authorContent = $(authorElem).text().trim().toUpperCase();;
        var descriptionContent = $(descriptionElem).text().toUpperCase().trim().replace(/^\s+|\s+$/gm,'');
        var languageContent = $(languageElem).text().trim().toUpperCase();
        var categoryContent = $(categoryElem).text().trim().toUpperCase().replace(/^\s+|\s+$/gm,'');;
        var pageContent = $(pageElem).text().trim().toUpperCase();
        var publishContent = $(publishElem).text().trim().toUpperCase();
        var publisherContent = $(publisherElem).text().trim().toUpperCase();
        var imageContent = $(imageElem).find('img').attr('src');
        
        if($(imprintElem).text().trim().includes("Imprint")){
          var imprintContent = $(imprintElem).text().trim().substring(7).replace(/^\s+|\s+$/gm,'').toUpperCase();
        } else{
          var imprintContent = "NO INFORMATION"
        }
        var typeContent = $(typeElem).text().trim().substring(0,10).replace(/^\s+|\s+$/gm,'').toUpperCase();
        var isbnContent = $(isbnElem).text().trim().toUpperCase();
        if($(originElem).text().trim().includes("Publication City/Country")){
          var originContent = $(originElem).text().trim().substring(26).replace(/^\s+|\s+$/gm,'').toUpperCase();
        } else{
          const originElem =  $("ul.biblio-info li")[5]
          var originContent = $(originElem).text().trim().substring(26).replace(/^\s+|\s+$/gm,'').toUpperCase();
        }
        
        obj["ISBN"] = isbn;
        obj["Author"] = authorContent;
        obj["Title"] = titleContent;
        obj["Description"] = descriptionContent;
        obj["Language"] = languageContent;
        obj["Category"] = categoryContent;
        obj["Pages"] = pageContent;
        obj["Published Date"] = publishContent;
        obj["Publisher"] = publisherContent;
        obj["Type"] = typeContent;
        obj["ISBN-13"] = isbnContent;
        obj["Publication City/Country"] = originContent;
        obj["Imprint"] = imprintContent;
        obj["Image"] = imageContent;

        // console.log("Title:- " + titleContent);
        // console.log("Author:- "+ authorContent)
        // console.log("Description:- "+ descriptionContent) 
        // console.log("Language:- " + languageContent)
        // console.log("Category:- " + categoryContent)
        // console.log("Pages:- "+ pageContent)
        // console.log("Published date:- "+ publishContent)
        // console.log("Publisher:- "+ publisherContent)
        // console.log("Imprint:- "+ imprintContent)
        // console.log("Publication City/Country:- "+ originContent)
        // console.log("Type:- "+ typeContent)
        // console.log("ISBN:- "+ isbnContent)
        // console.log("Image:- "+ imageContent)

        return obj;
      })
      return objectReturn;
}

async function excelWrite(arrayResult){

  const wb = xlsl.utils.book_new();
  const ws = xlsl.utils.json_to_sheet(arrayResult);
  xlsl.utils.book_append_sheet(wb,ws);
  xlsl.writeFile(wb,"links.xlsx");
  return "Done";
}
