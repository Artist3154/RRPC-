/**
"dependencies": { "mqtt": "2.18.8" }
*/
const crypto = require('crypto');
const mqtt = require('mqtt');
//设备身份三元组+区域 

const deviceConfig = {
    productKey: "a1a98ZXukT4",
    deviceName: "Tx8pisfnYhYZYwEV8JHm",
    deviceSecret: "44uRCeUGpBlrD6HlEdGMdBVhQVRS46n0",
    regionId: "cn-shanghai"
};

const url = `tcp://${deviceConfig.productKey}.iot-as-mqtt.${deviceConfig.regionId}.aliyuncs.com:1883`;
//2.建立连接
const client = mqtt.connect(url, makeMqttOptions(deviceConfig));
//3.监听RRPC指令
client.subscribe(`/ext/rrpc/+/this/is/my/topic`)
client.on('message', function(topic, message) {
    console.log("topic=" + topic)
    console.log("payloadJson=" + message)
    //4.响应RRPC指令
    if (topic.indexOf(`/ext/rrpc/`) > -1) {
        client.publish(topic, JSON.stringify({ current:"10A", msg: "rrpc ok" }));
    }

})
/*
  生成MQTT连接参数
*/
function makeMqttOptions() {

    const params = {
        productKey: deviceConfig.productKey,
        deviceName: deviceConfig.deviceName,
        timestamp: Date.now(),
        clientId: Math.random().toString(36).substr(2),
    }
    //CONNECT参数
    const options = {
        keepalive: 60, //60s
        clean: false, //cleanSession保持持久会话
        protocolVersion: 4 //MQTT v3.1.1
    }
    //1.生成clientId，username，password
    options.password = signHmacSha1(params, deviceConfig.deviceSecret);
    options.clientId = `${params.clientId}|securemode=3,signmethod=hmacsha1,timestamp=${params.timestamp},ext=1|`;
    options.username = `${params.deviceName}&${params.productKey}`;

    return options;
}

/*
  生成基于HmacSha1的password
  参考文档：https://help.aliyun.com/document_detail/73742.html?#h2-url-1
*/
function signHmacSha1(params, deviceSecret) {

    let keys = Object.keys(params).sort();
    // 按字典序排序
    keys = keys.sort();
    const list = [];
    keys.map((key) => {
        list.push(`${key}${params[key]}`);
    });
    const contentStr = list.join('');
    return crypto.createHmac('sha1', deviceSecret).update(contentStr).digest('hex');
}