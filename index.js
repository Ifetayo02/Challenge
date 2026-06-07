const http=require('http')
const server= http.createServer((req,res)=>{
    if (req.method ==='GET' && req.url=='/'){
        res.writeHead(200,{'Content-Type':'application/json'})
        res.end(JSON.stringify({message:'Hello World'}))
}else{
    res.writeHead(404,{'Content-Type':'application/json'})
    res.end(JSON.stringify({message:'Not Found'}))
}
});
server.listen(3000,()=>{
    console.log('Server is running on port 3000')
})