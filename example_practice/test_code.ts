// import * as pull_based from "./practice_pull";
// import * as push_based from "./practice_push";

const pull_based = require("./practice_pull");
const push_based = require("./practice_push");

const based = push_based;
// const based = pull_based;

const website = new based.Website("http://google.com");
const user = new based.User("Son");
const blogPost = new based.BlogPost(user, "342");

const link = based.generatePostLink(website, blogPost);
console.log(link);
