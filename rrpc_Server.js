const co = require('co');
const RPCClient = require('@alicloud/pop-core').RPCClient;

var http = require("http");
        //创建服务器，参数是一个回调函数，表示如果有请求进来，要做什么

const options = {
    accessKey:"LTAIyh1aepAMWsap",
    accessKeySecret: "mrBO2WHVwkceX6PzmiRkefWXwtGDRF"
};

//1.初始化client
const client = new RPCClient({
    accessKeyId: options.accessKey,
    secretAccessKey: options.accessKeySecret,
    endpoint: 'https://iot.cn-shanghai.aliyuncs.com',
    apiVersion: '2018-01-20'
});
//2.构造RRPC参数
const params = {
    ProductKey: "a1a98ZXukT4",
    DeviceName: "Tx8pisfnYhYZYwEV8JHm",
    RequestBase64Byte: Buffer.from("Hello World").toString('base64'),
    Timeout: 6000,
    Topic:'/this/is/my/topic'
};

co(function*() {
    try {
        //3.发起API调用
        const response = yield client.request('RRpc', params);

        console.log(JSON.stringify(response));
        
        
        var server = http.createServer(function(req,res){
            //req表示请求，request;  res表示响应，response
            //设置HTTP头部，状态码是200，文件类型是html，字符集是utf8
            res.writeHead(200,{"Content-type":"text/html;charset=UTF-8"});
            res.end(JSON.stringify(response));
        });

        //运行服务器，监听3000端口（端口号可以任改）
        server.listen(3001,"127.0.0.1");
    } catch (err) {
        console.log(err);
    }
});