# cryptowiz
A powerful Discord bot, currently scraping data from Dexscreener and using Coingecko's API. 

This bot is a work in progress for the Alphux community.
As per the admin's wishes, it has been made available for use to the public domain.

Better commenting and a refactor is on the books. 

COMMANDS LIST
Github killed formatting. Sad.

/getprice id:query

 * Gets the price of a given token pair. \n
@param id - A search query - This is plugged into DexScreener and scraped for the best match. \n

/pricealert id:query price:price

 * Sets a price alert when a given token pair exceeds a price. \n
@param id - Query to pass into Dex. This will return the first token pair from a list, and track that. A quote token may be specified. \n
@param price - The threshold price for the token to exceed. The command automatically determines relativity to the current price. \n
@note Polling is done at a 5s interval for every time the command is used. This opens the bot up to spam. The bot does not currently track a maximum number of price alerts or permissions. The loop is automatically killed once the price alert is triggered however. \n
@todo Implement file IO to "store" the bot's price alerts between launches.  Currently it is just storing in memory. Multiple contact points - Ie, txt messages/Telegram? \n

/search phrase:phrase type:type

 * Returns a list of tokens from CoinGecko with info on ID, symbol, and name. To be depreciated.
@param phrase - The phrase to search for - This is used in aligment with the "type" parameter, and uses CoinGecko's API to list every coin, then search either "name" or "symbol". 
@param type - What to search for the phrase in. "ticker" specifies the "symbol" keyword, while "name" specifies the name. Returns positive if the phrase has an index in the search category.  
@note "overflow" value is hardcoded at 500 chars - Command will automatically cut off once the message body reaches 500 chars (but not before finishing "building" existing token) and start to count excess. This will be outputted as "And X others".

/setstatus id:query

 * Sets the bot's status to a token pair's price, updated at 2s interval. 
@param query - A search query, handled in the same capacity as getprice. This search query returns a token, and market data for that token is used as the bot's status.
@note As this bot is intended for a private Discord community, it does not currently handle role-checking or authentication for this (or any!) commands. Feel free to submit a pull request to add in this functionality - I will not be implementing this unless requested by stakeholders/if I view it as a problem.

/getinfo id:id

 * Retrieves token name, ticker, ATH, current price, network, address, and website from CoinGecko
@param id - The "ID" of a token to pass into CoinGecko. This does not do fuzziness, as the bot currently plugs the ID directly into CoinGecko's API, formats the data, and spits it out. Just the name, symbol, or part of the ID will currently not work. The /search command is intended to ease use of this command. To be depreciated. 
@todo Fuzziness and Dexscreener/Contract implementation - Puts search query into DexScreener, outputs base token's contract & network, then uses that with CoinGecko. However, this will not work with lower mcap coins - Better solution will need research. Potentially using info from contract's compiled code to mark it as a fork off xyz?


