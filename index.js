const cheerio = require('cheerio')
const axios = require('axios')
const csv = require("csv-parser");
const fs = require("fs");
const xlsl = require("xlsx");

var arr = [];
var isbncount = 0;

(async() => {
    fs.createReadStream("data1.csv")
    .pipe(csv())
    .on("data", (row) => {
      
      isbncount++
      console.log(row.isbn);
      var isbn = row.isbn;

      const url = "https://www.bookdepository.com/search?searchTerm="+isbn+"&search=Find+book"
      const resultData = bookdepository(url, isbn);
      
      var arrayData = resultData.then(function (result){
        arr.push(result);
        return arr
      })

      arrayData.then( function (arrayResult){
        const wb = xlsl.utils.book_new();
        const ws = xlsl.utils.json_to_sheet(arrayResult);
        xlsl.utils.book_append_sheet(wb,ws);
        xlsl.writeFile(wb,"links.xlsx");
      })

    })
    .on("end", () => {
      console.log("Total ISBN" + " "+ isbncount);
      console.log("ISBN file successfully processed");
    });
})();

async function bookdepository(url , isbn){
  let obj = {};

  const objectReturn =  await axios.get(url).then((response) => {
        // Load the web page source code into a cheerio instance
        const $ = cheerio.load(response.data)

        const titleElems = $("*[itemprop = 'name']")[0]
        const authorElems = $("*[itemprop = 'author']")
        const descriptionElems = $("*[itemprop = 'description']")
        const lanaguageElems = $("*[itemprop = 'inLanguage']")
        const categoryElems =  $('ol.breadcrumb a')[0]
        const pageElems =  $("*[itemprop = 'numberOfPages']")[0]
        const publishElems =  $("*[itemprop = 'datePublished']")
        const publisherElems =  $("*[itemprop = 'publisher']")
        const imprintElems =  $("ul.biblio-info li ")[4]
        const typeElems =  $("ul.biblio-info li span")[0]
        const originElems =  $("ul.biblio-info li")[4]
        const isbnElems =  $("*[itemprop = 'isbn']")
        const imageElems =  $(".item-img-content")

        var titlecontent = $(titleElems).text().trim();
        var authorcontent = $(authorElems).text().trim();
        var descriptioncontent = $(descriptionElems).text().trim().replace(/^\s+|\s+$/gm,'');
        var languagecontent = $(lanaguageElems).text().trim();
        var categorycontent = $(categoryElems).text().trim().replace(/^\s+|\s+$/gm,'');;
        var pagecontent = $(pageElems).text().trim();
        var publishcontent = $(publishElems).text().trim();
        var publishercontent = $(publisherElems).text().trim();
        var imagecontent = $(imageElems).find('img').attr('src');
        
        if($(imprintElems).text().trim().includes("Imprint")){
          var imprintcontent = $(imprintElems).text().trim().substring(7).replace(/^\s+|\s+$/gm,'');
        } else{
          var imprintcontent = "No information"
        }
        var typecontent = $(typeElems).text().trim().substring(0,10).replace(/^\s+|\s+$/gm,'');
        var isbncontent = $(isbnElems).text().trim();
        if($(originElems).text().trim().includes("Publication City/Country")){
          var origincontent = $(originElems).text().trim().substring(26).replace(/^\s+|\s+$/gm,'');
        } else{
          const originElems =  $("ul.biblio-info li")[5]
          var origincontent = $(originElems).text().trim().substring(26).replace(/^\s+|\s+$/gm,'');
        }
        
        obj["ISBN"] = isbn;
        obj["Author"] = authorcontent;
        obj["Title"] = titlecontent;
        obj["Description"] = descriptioncontent;
        obj["Language"] = languagecontent;
        obj["Category"] = categorycontent;
        obj["Pages"] = pagecontent;
        obj["Published Date"] = publishcontent;
        obj["Publisher"] = publishercontent;
        obj["Type"] = typecontent;
        obj["ISBN-13"] = isbncontent;
        obj["Publication City/Country"] = origincontent;
        obj["Imprint"] = imprintcontent;
        obj["Image"] = imagecontent;

        console.log("Title:- " + titlecontent);
        console.log("Author:- "+ authorcontent)
        console.log("Description:- "+ descriptioncontent) 
        console.log("Language:- " + languagecontent)
        console.log("Category:- " + categorycontent)
        console.log("Pages:- "+ pagecontent)
        console.log("Published date:- "+ publishcontent)
        console.log("Publisher:- "+ publishercontent)
        console.log("Imprint:- "+ imprintcontent)
        console.log("Publication City/Country:- "+ origincontent)
        console.log("Type:- "+ typecontent)
        console.log("ISBN:- "+ isbncontent)
        console.log("Image:- "+ imagecontent)

        return obj;
      })
      return objectReturn;
}
