let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');

request('https://www.github.com/topics',cb);

function cb(err, response, html){

    extractHTML(html);
}
let gitTopics = [];

function extractHTML(html){
    let $ = cheerio.load(html);
    let topicUrlTags = $('.no-underline.d-flex.flex-column.flex-justify-center');

    for(let i = 0; i < topicUrlTags.length ; i++){
        let topicUrl = "https://www.github.com"+$(topicUrlTags[i]).attr('href');
        gitTopics.push({
            "topicUrl" : topicUrl,
            "repos" : [],
        })
    
        request(topicUrl,fetchRepos.bind(this,i));
    }
}

let topicCounts = 0;
let repoCounts = 0;
let totalRepos = 0;

function fetchRepos(index,err,res,html){
    topicCounts++;
    let $ = cheerio.load(html); 
    let repoAnchorTags = $(".text-bold.wb-break-word"); 
    totalRepos += repoAnchorTags.length < 8 ? repoAnchorTags.length : 8;
    for(let i = 0; i < 8 && i < repoAnchorTags.length ;i++){
        
        

        let repoUrl = "https://www.github.com"+$(repoAnchorTags[i]).attr('href');
        gitTopics[index].repos.push({
            repoUrl: repoUrl,
            issues: [],
        })

        request(repoUrl + "/issues",fetchIssues.bind(this,index,i));
    }
    
}function fetchIssues(topicIndex, repoIndex, err, res, html){
    repoCounts++;
    let $ = cheerio.load(html);
    let issueAnchorTags = $(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
   

    for(let i = 0; i < 8 && i < issueAnchorTags.length ;i++){
       
        
        gitTopics[topicIndex].repos[repoIndex].issues.push({
            issueName : $(issueAnchorTags[i]).text(),
            issueURL : "https://www.github.com"+$(issueAnchorTags[i]).attr("href"),
        })
    }
    console.log(repoCounts,totalRepos);
    if(topicCounts == 3 && repoCounts == totalRepos){
        fs.writeFileSync("temp.json",JSON.stringify(gitTopics));
    }
}


