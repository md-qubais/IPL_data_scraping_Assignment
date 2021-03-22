let create_files=require("./create_files")
let fs=require("fs")
let request=require("request")
let cheerio=require("cheerio")
let path=require("path")
//https://www.espncricinfo.com/series/ipl-2020-21-1210595
const mkdirsSync = function(dirname) {
    if (fs.existsSync(dirname)) {
       // console.log(dirname+" "+" directory exists")
      return true;
    }
    if (mkdirsSync(path.dirname(dirname))) {
        //console.log(dirname+" crated sucessfully")
      fs.mkdirSync(dirname);
      return true;
    }
}
let cwd=process.cwd();
let dir=path.join(cwd,"ipl2020");
mkdirsSync(dir)
//now here making teams
//.nav-link.active
request("https://www.espncricinfo.com/series/ipl-2020-21-1210595",cb);
function cb(err,response,html){
    if(err){
        console.log(err)
    }else{
        let ch_select=cheerio.load(html)
        let tables_link=ch_select(".jsx-850418440.custom-scroll").find("a")
        let link=ch_select(tables_link[2]).attr("href")
        //.header-title.label 
        link=link.split('/')
        request("https://www.espncricinfo.com/series/ipl-2020-21-1210595"+"/"+(link[link.length-1]),function(err,response,html) {
            if(err){
                console.log(err)
            }else{
                let chselect=cheerio.load(html)
                let tables=chselect(".header-title.label")
                for(let i=1;i<tables.length;i++){
                    let team_name=chselect(tables[i]).text()
                    team_name=team_name.trim()
                    if(team_name=="Punjab Kings"){
                        team_name="Kings XI punjab"
                    }
                    mkdirsSync(path.join(dir,team_name))
                }
            }
            create_files.create("https://www.espncricinfo.com/series/ipl-2020-21-1210595"+"/match-results");
        });
    }
    }