const express = require("express");
const app = express();
const port = process.env.PORT || 3000;


const productRouter = require('./routes/product');

app.use(express.json());
app.use('/product',productRouter);

app.get('/',(req,res)=>{
    res.send('success')
})

app.get('/health',(rq,res)=>{
res.send()
})


app.listen(port,()=>{
    console.log("server is running on "+port);
})