const cheerio = require('cheerio')
const axios = require('axios')
const https = require("https");
const csv = require("csv-parser");
const fs = require("fs");
var stringify = require("csv-stringify");
var sleep = require('sleep');

var arr = [];
var isbncount = 0;

async function readCVS(){
  fs.createReadStream("data1.csv")
  .pipe(csv())
  .on("data", (row) => {
    isbncount++
    console.log(row.isbn);
    var isbn = row.isbn;
    const url = "https://www.bookdepository.com/search?searchTerm="+isbn+"&search=Find+book"
    return bookdepository(url, isbn);
  })
  .on("end", () => {
    console.log("Total ISBN" + " "+ isbncount);
    console.log("ISBN file successfully processed");
  });

}

async function bookdepository(url , isbn){
  let obj = {};
  console.log(url)
    axios.get(url).then((response) => {
        // Load the web page source code into a cheerio instance
        const $ = cheerio.load(response.data)
      
        const titleElems = $("*[itemprop = 'name']")[0]
        const authorElems = $("*[itemprop = 'name']")[1]
        const descriptionElems = $("*[itemprop = 'description']")[0]
        const lanaguageElems = $("*[itemprop = 'inLanguage']")[0]
        const categoryElems =  $('ol.breadcrumb a')[0]
        const pageElems =  $("*[itemprop = 'numberOfPages']")[0]
        const publishElems =  $("*[itemprop = 'datePublished']")[0]
        const publisherElems =  $("*[itemprop = 'name']")[2]
        const imprintElems =  $("ul.biblio-info li ")[4]
        const typeElems =  $("ul.biblio-info li span")[0]
        const isbnElems =  $("*[itemprop = 'isbn']")
        var titlecontent = $(titleElems).text().trim();
        var authorcontent = $(authorElems).text().trim();
        var descriptioncontent = $(descriptionElems).text().trim().replace(/^\s+|\s+$/gm,'');
        var languagecontent = $(lanaguageElems).text().trim();
        var categorycontent = $(categoryElems).text().trim().replace(/^\s+|\s+$/gm,'');;
        var pagecontent = $(pageElems).text().trim();
        var publishcontent = $(publishElems).text().trim();
        var publishercontent = $(publisherElems).text().trim();
        var imprintcontent = $(imprintElems).text().trim().substring(7).replace(/^\s+|\s+$/gm,'');
        if (imprintcontent.includes("Publication City/Country")){
          console.log("test")
          obj["Publication City/Country"] = imprintcontent;
          obj["Imprint"] = " ";
        }
        else{
          obj["Publication City/Country"] = "No information";
          obj["Imprint"] = imprintcontent;
          console.log("test2")
        }
        var typecontent = $(typeElems).text().trim().substring(0,10).replace(/^\s+|\s+$/gm,'');
        var isbncontent = $(isbnElems).text().trim();
        
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


        arr.push(obj)

        // stringify(arr, { header: true }, (err, output) => {
        //   if (err) throw err;
        //   fs.writeFile("out.csv", output, (err) => {
        //     if (err) throw err;
        //      return ("Details Saved For " + isbn);
        //   });
        // });

        
        console.log("Title:- " + titlecontent);
        console.log("Author:- "+authorcontent)
        console.log("Description:- "+ descriptioncontent) 
        console.log("Language:- " + languagecontent)
        console.log("Category:- " + categorycontent)
        console.log("Pages:- "+ pagecontent)
        console.log("Published date:- "+ publishcontent)
        console.log("Publisher:- "+ publishercontent)
        console.log("Imprint:- "+ imprintcontent)
        console.log("Publication City/Country:- "+ imprintcontent)
        console.log("Type:- "+ typecontent)
        console.log("ISBN:- "+ isbncontent)
      })
}

(async() => {
  await readCVS();
})();
