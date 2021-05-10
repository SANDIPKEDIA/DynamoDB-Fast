const express = require('express')
const router = express.Router();
const AWS = require('aws-sdk');
require('dotenv').config();

const { response } = require('express');
AWS.config.update({
    "region": process.env.AWS_DEFAULT_REGION,
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'product-inventory';


router.get('/', async (req, res) => {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'productId': req.query.productId
        }
    }
    await dynamodb.get(params).promise().then(response => {
        res.json(response.Item);
    }, error => {
        console.error(error);
        res.status(500).send(error)
    })
})


router.get('/all', async (req, res) => {
    const params = {
        TableName: dynamodbTableName
    }
    try {
        const allProducts = await scanDynamoRecords(params, []);
        const body = {
            products: allProducts
        }
        res.json(body)
    } catch (error) {
        console.error("error comes", error);
        res.status(500).send(error);
    }

})



router.post('/', async (req, res) => {
    const params = {
        TableName: dynamodbTableName,
        Item: req.body
    }
    await dynamodb.put(params).promise().then(() => {
        const body = {
            Operation: 'SAVE',
            Message: 'SUCCESS',
            Item: req.body
        }
        res.json(body)
    }),error=>{
        console.error("error",error);
        res.status(500).send(error)
    }

})


// router.patch('/', async (req, res) => {
//     const params ={
//         TableName: dynamodbTableName,
//         Key:{
//             'productId': req.body.productId
//         },
//         UpdateExpression:`set ${req.body.updateKey} = :value`,
//         ExpressionAttributeValues: {
//             ':value' : req.body.updateValue
//         },
//         ReturnValues:'UPDATED_NEW'
//     }

//     await dynamodb.update(params).promise().then(response=>{
//         const body = {
//             Operation:'UPDATE',
//             Message: 'SUCCESS',
//             UpdatedAttributes : response
//         }
//         res.json(body)
//     },error=>{
//         console.error("error",error);
//         res.status(500).send(error)
//     })
// })



router.put('/', async (req, res) => {
    const params ={
        TableName: dynamodbTableName,
        Item:req.body,
        Key:{
            'productId': req.query.productId
        },

    }

    await dynamodb.put(params).promise().then(response=>{
        const body = {
            Operation:'UPDATE',
            Message: 'SUCCESS',
            UpdatedAttributes : response
        }
        res.json(body)
    },error=>{
        console.error("error",error);
        res.status(500).send(error)
    })
})

// router.delete('/', async (req, res) => {
//     const params ={
//         TableName: dynamodbTableName,
//         Key:{
//             'productId': req.query.productId
//         },
//         ReturnValues : 'ALL_OLD'
//     }
//     await dynamodb.delete(params).promise().then(response=>{
//         const body = {
//             Operation:'DELETE',
//             Message: 'SUCCESS',
//             Item : response
//         }
//         res.json(body,response)
//     },error=>{
//         console.error("error",error);
//         res.status(500).send(error)
//     })

// })


router.delete('/', async (req, res) => {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            'productId': req.query.productId
        }
    }
    await dynamodb.delete(params).promise().then(response => {
        const body = {
            Message: 'Delete Succesfully',
           
        }
        res.json(body);
    }, error => {
        console.error(error);
        res.status(500).send(error)
    })
})


async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamodb.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items)
        if (dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray
    } catch (error) {
        throw new Error(error)
    }
}


module.exports = router