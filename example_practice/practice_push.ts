export class Website {
    constructor(private url: string) {}
    generateLink(name: string, id: string) {
        return this.url + name + id;
    }
}

export class User {
    constructor(private username: string) {}
    generateLink(website: Website, id: string) {
        return website.generateLink(this.username, id);
    }
}

export class BlogPost {
    constructor(private author: User, private id: string) {}
    generateLink(website: Website) {
        return this.author.generateLink(website, this.id);
    }
}

export const generatePostLink = (website: Website, post: BlogPost) => {
    return post.generateLink(website);
};
