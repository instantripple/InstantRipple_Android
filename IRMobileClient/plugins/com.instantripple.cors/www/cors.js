var exec = require('cordova/exec');

var cors = {
    get: function (url, callback, browserAgent) {
        if (typeof (window.tinyHippos) == "undefined") {
            exec(function (res) {
                var err = null;
                if (res.substr(0, 3) == 'ERR') {
                    err = "cors error: " + res.substr(3);
                    res = null;
                } else {
                    res = { body: JSON.parse(res) };
                }
                callback(err, res);
            }, null, "CorsProvider", "get", [url]);
        } else {
            browserAgent.get(url, callback);
        }
    },
    post: function (url, data, callback, browserAgent) {
        if (typeof (window.tinyHippos) == "undefined") {
            exec(function (res) {
                var err = null;
                if (res.substr(0, 3) == 'ERR') {
                    err = "cors error: " + res.substr(3);
                    res = null;
                } else {
                    res = { body: JSON.parse(res) };
                }
                callback(err, res);
            }, null, "CorsProvider", "post", [url, data]);
        } else {
            browserAgent.post(url).send(data).end(callback);
        }
    }
};

module.exports = cors;