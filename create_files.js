let request=require("request")
let cheerio=require("cheerio")
let fs=require("fs")
let path=require("path")
let url;
let arr=[];



function create(link){
    url=link
    request(link,cb)
}


function cb(err,response,html){
    let ch_select=cheerio.load(html)
    let cols=ch_select(".col-md-8.col-16 .match-info-link-FIXTURES");
    for(let i=0;i<cols.length;i++){
       let link ="https://www.espncricinfo.com"+ch_select(cols[i]).attr("href");
       arr.push(link);
    }
    for(let i=0;i<arr.length;i++){
        request(arr[i],cb1)
    }
}
function cb1(err,resp,html){
    if(err){
        console.log(err)
        return
    }let chSelector = cheerio.load(html);
    let bothMatches = chSelector(".event .teams>.team");
    let myTeam;
    for (let i = 0; i < bothMatches.length; i++) {
        let isLossing = chSelector(bothMatches[i]).hasClass("team-gray");
        if (isLossing == false) {
            let myTeamElem = chSelector(bothMatches[i]).find(".name-detail a");
            myTeam = myTeamElem.text();
        }
    }
    let colInnings = chSelector(".Collapsible");
    let bothInningsTeamName = chSelector(".Collapsible .header-title.label");
    for (let j = 0; j < bothInningsTeamName.length; j++) {
        let teamName = chSelector(bothInningsTeamName[j]).text();
        let teamFirstName = teamName.split("INNINGS")[0];
        teamFirstName = teamFirstName.trim();
        if (teamFirstName == myTeam) {
            let winTeamInning = chSelector(colInnings[j]);
            printTeamStats(winTeamInning, chSelector)
            
        }
    }
}
function printTeamStats(winTeamInning, chSelector) {
    
    let allRows = chSelector(winTeamInning).find(".table.batsman tbody tr");
    let my_team
    let team_names=chSelector(".match-info.match-info-MATCH .teams .team .name-link");
      

    for (let j = 0; j < allRows.length; j++) {
        let eachbatcol = chSelector(allRows[j]).find("td");
        if (eachbatcol.length == 8) {
            if(chSelector(team_names[0]).hasClass(".team.team-gray")){
                my_team=chSelector(team_names[0]).text()
            }else{
                my_team=chSelector(team_names[1]).text();
            }
            let playerName = chSelector(eachbatcol[0]) .text();
            let player_arr=playerName.split(" ")
            playerName=player_arr[0]+player_arr[1];
            let runs = chSelector(eachbatcol[2]).text();
            let balls=chSelector(eachbatcol[3]).text()
            let fours=chSelector(eachbatcol[4]).text()
            let sixes=chSelector(eachbatcol[5]).text()
            let strike_rate=chSelector(eachbatcol[6]).text()
            let opponent=chSelector(".team.team-gray .name-link").text()
            let venue_date=chSelector(".match-info.match-info-MATCH .description").text().split(",");
            let a={
                Name:playerName,
                team_name:my_team,
                runs:runs,
                balls:balls,
                fours:fours,
                sixes:sixes,
                strike_rate:strike_rate,
                b:{
                    opponent_name:opponent,
                    venue:venue_date[1],
                    date:venue_date[2]
                }
            }
            
            let filePath=path.join(path.join(process.cwd(),"ipl2020"),my_team);
            filePath=path.join(filePath,playerName+".json")
            if(fs.existsSync(filePath)) {
                let contentInFile = fs.readFileSync(filePath);
                let arr = JSON.parse(contentInFile);
                arr.push(a);
                fs.writeFileSync(filePath, JSON.stringify(arr,null,4));
              }else{
                    let arr1 = [];
                    arr.push(a);
                    let contentInEmptyFile = JSON.stringify(arr,null,4);
                    fs.writeFileSync(filePath, contentInEmptyFile);
              }     
        }
    }
}

module.exports={
    create:create
}