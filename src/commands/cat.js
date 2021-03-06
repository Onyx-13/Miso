const querystring = require('querystring');
const fetch = require('node-fetch');
const Discord = require('discord.js');

const CAT_API_KEY = "77754d84-55e9-48bd-a31e-853ba386ec6e";
const CAT_API_URL = 'https://api.thecatapi.com/';

const feedLimit = 100;

module.exports = {
    name: "cat",
    description: "Sends a random cat image! Meeeow!",
    aliases: ['pussy', 'kitty'],
    usage: "[options]",

    args: true,
    opts: true,


    async execute(message, args, opts) {    
        let catEmbed;

        if (!opts.length) {
            catEmbed = await getAPIEmbed();
        }
        else if(opts[0] == "reddit" || opts[0] == "r") {
            catEmbed = await getRedditEmbed();    
        }
        else {
            message.channel.send("Sorry, I don't know where you want me to get this from");
            return;
        }

        message.channel.send({ embed: catEmbed });
    }
};

async function getAPIEmbed() {
    const image = await loadAPIImage();
    const breed = image.breeds[0];

    const file = new Discord.MessageAttachment(image.url);

    const embed = {
        title: `Here's a ${breed.name}!`,
        color:"#3282b8",
        image: {
            url: file.attachment
        }
    };
    return embed;
}

async function getRedditEmbed() {
    const feed = await loadRedditFeed("cats", "top", feedLimit);
    let post = feed.data.children[getRandomInt(0, 100)];
    while (post.data.is_self || post.data.is_video || post.data.is_gallery) {
        post = feed.data.children[getRandomInt(0, 100)];
    }
    let url = post.data.url;
    if (url.includes("imgur")) {
        url = url + ".png";
    }
    const file = new Discord.MessageAttachment(url);

    const embed = {
        title: "Here's a cat!",
        description: post.data.title,
        footer: {
            text: "Source: reddit.com/r/cats"
        },
        color: "#FF4500",
        image: {
            url: file.attachment
        }
    };
    return embed;
}

async function loadAPIImage() {
    const header = {
        'X-API-KEY': CAT_API_KEY
    };

    const queryParams = {
        'has_breeds': true,
        'size': "full",
        'limit': 1
    };

    const queryString = querystring.stringify(queryParams);

    try {
        const _url = CAT_API_URL + `v1/images/search?${queryString}`;
        const response = await fetch(_url, { header }).then(images => images.json());
        return response[0];
    }
    catch (imgError) {
        console.error(imgError);
    }
}

async function loadRedditFeed(subreddit, sort, limit) {
    const subUrl = `https://www.reddit.com/r/${subreddit}/${sort}`;
    try {
        return await fetch(`${subUrl}.json?raw_json=1&limit=${limit}`).then(response => response.json());
    }
    catch (imgError) {
        console.error(imgError);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
