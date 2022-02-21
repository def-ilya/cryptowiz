const axios = require('axios')

const client = require('./client')
const { TWITTER_CONSUMER, TWITTER_BEARER, TWITTER_SECRET } = require('./config.json')




const twitterChannelLoop = async function (handle = "def_ilya", channel) {

    await axios.get(`https://api.twitter.com/2/users/by?usernames=${handle}`, {
        headers: {
            Authorization: `Bearer ${TWITTER_BEARER}`
        }
    })
        .then(async (res) => {

            //we try to get the user's id. if the user doesn't exist, we don't establish the loop. 
            try {

                let _id = res['data']['data'][0]['id']
                console.log(_id)

                let sentTweet = null;

                let loop = setInterval(async () => {

                    await axios.get(`https://api.twitter.com/2/users/${_id}/tweets?tweet.fields=created_at&expansions=author_id&user.fields=created_at&max_results=5`, {
                        headers: {
                            Authorization: `Bearer ${TWITTER_BEARER}`
                        }
                    })
                        .then((res) => {

                            try {
                                lastTweet = res['data']['data'][0]

                                if (lastTweet['id'] != sentTweet) {

                                    //if the user has a tweet that isn't the same as the last one, send it to feed[c] 
                                    console.log(lastTweet)
                                    client.channels.cache.get(channel).send(`**@${handle}** has tweeted:\n \n${lastTweet['text']}`)
                                    sentTweet = lastTweet['id'];
                                }
                            }
                            catch {
                                console.log("No tweets found.")
                            }
                        })

                }, 5000)

                return loop;
            }
            catch {
                console.log("no twitter user found")
            }
        })
}


module.exports = twitterChannelLoop;