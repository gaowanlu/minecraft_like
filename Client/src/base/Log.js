let Log = {};
Log.ERROR = (msg1, msg2) => {
    console.error(msg1, msg2);
};
Log.DEBUG = (msg1, msg2) => {
    console.debug(msg1, msg2);
};

module.exports = Log;
