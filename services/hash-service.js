const crypto=require('crypto');
class HashService{

    async hashOtp(data){

        //crypto.createHmac('encrypting technique','secret key').update("encrypting data").digest('hex')
      return  crypto.createHmac('sha256',process.env.Hash_SECRET).update(data).digest('hex')
    }
}
module.exports = new HashService();