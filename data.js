var users = [];
var tweets = [];
var loginLogs = [];
const wordSecret = "c_twt2021";

const formatDate = (date)=>{

return ("0" + date.getDate()).slice(-2) + "/" + ("0"+(date.getMonth()+1)).slice(-2) + "/" +
        date.getFullYear() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);

}


module.exports ={
    users: users,
    tweets: tweets,
    loginLogs: loginLogs,
    wordSecret: wordSecret,
    formatDate: formatDate,
}
