const axios = require('axios');
const cheerio = require('cheerio');
const { each } = require('cheerio/lib/api/traversing');

const gecko = require('coingecko-api')
const geckoClient = new gecko();


class Token {

    constructor(id) {
        this.id = id;
        this.ticker = "NULL"
        this.name = "nullName"
        this.network = "nullNetwork"
        this.address = "nullAddress"
        this.data = this.getDataById(id);
    }

    async getDataById(id = "based-finance") {
        try {
            const data = await geckoClient.coins.fetch(id, {});

            this.ticker = data["data"]["symbol"];
            this.name = data["data"]["name"];
            this.network = data["data"]["asset_platform_id"];
            this.address = data["data"]["contract_address"];

            return data;
        }
        catch (err) {
            console.log(err)
        }
    }

    async coinList() {
        try {
            const list = await geckoClient.coins.list()
            return list;
        }
        catch (err) {
            console.log(err)
        }
    }


    async currentPrice() {
        const data = await geckoClient.coins.fetch(this.id, {});
        return data["data"]["market_data"]["current_price"]["usd"];
    }

    async dexScreener(network = "fantom", contract = "0xd2573a05aa5d9bbf65d5a4e610f1e4677c4b4d5b") {
        try {
            const data = await axios.get(`https://io9.dexscreener.io/u/trading-history/recent/${network}/${contract}`)
            return data['data'];
        }
        catch {
            console.log("couldn't return Dex data.")
        }
    }

    async returnPairs(query = "btc") {
        try {
            const pairSearch = await axios.get("https://io4.dexscreener.io/u/search/pairs?q=" + query)
            return pairSearch['data']['pairs'];
        }
        catch {
            console.log("couldn't return Pair data.")
        }

    }

}


module.exports = Token
