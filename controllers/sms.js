const plivo = require('plivo');
const config = require('../config/index');

// const p = plivo.RestAPI({
//     authId: config.PLIVO_AUTH_ID,
//     authToken: config.PLIVO_AUTH_TOKEN
// });

let client = new plivo.Client(config.PLIVO_AUTH_ID, config.PLIVO_AUTH_TOKEN);

module.exports.sendOtp = async (user) => {
    const otpCode = Math.floor(1000 + Math.random() * 9000);
    console.log(`OTP - ${otpCode} generated for mobilenumber - ${user.mobileNumber}`);
    user.otpCode = otpCode;
    user.otpGeneratedTime = new Date();
    try {
        await user.save();
        console.log('User saved successfully!');
        let text = 'SMA verification code: ' + otpCode;
        console.log(`Sending OTP to mobilenumber - ${user.mobileNumber}`);
        return sendSMS(user.mobileNumber, text);
    } catch (err) {
        console.log(err.toString());
        return;
    }
};

const sendSMS = (mobileNumber, text) => {
    return new Promise((resolve, reject) => {
        let reciever = '91' + mobileNumber;

        console.log(`sending message to ${mobileNumber}`);

        // p.send_message({
        //     src: 'SMA',
        //     dst: reciever,
        //     text,
        //     type: 'sms',
        //     log: false
        // }, (status, res) => {
        //     return resolve({
        //         status,
        //         res
        //     });
        // });
        client.messages.create(
            'SMA',
            reciever,
            text
        ).then((message) => {return resolve(message);})
    });
}