require('dotenv').config();
console.log(process.env)
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;
// const key = "12d3473d8c110d2c57a3";
// const secret = "ee63b10d14eca7bf5cfc47667984d34fd0bbed44f21bd8673683beb7a5206e11";
const axios = require('axios');

export const pinJSONToIPFS = async(JSONBody) => {
    console.log("___________key ans secret",__dirname,key,secret)

    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
           
        });
};