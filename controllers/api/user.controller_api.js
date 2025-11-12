const md5=require("md5")
const User=require("../../models/models.user");
const generateHelper=require("../../helpers/generate");
const sendMailHelper=require("../../helpers/sendMail");
const ForgotPassword=require("../../models/models.forgot-password");

module.exports.register = async(req,res)=>{
    req.body.password=md5(req.body.password);

    const existEmail=await User.findOne({
        email:req.body.email,
        deleted:false
    });

    if(existEmail){
        res.json({
            code:400,
            message:"Email đã tồn tại"
        });
    }else{
        const user=new User({
            fullName:req.body.fullName,
            email:req.body.email,
            password:req.body.password
        });
        user.save();
        const token =user.tokenUser;
        res.cookie("tokenUser",token);
        res.json({
            code:200,
            message:"Tạo Tài Khoản Thành Công!",
            tokenUser:token
        });
    }
}

module.exports.login=async(req,res)=>{
    const email=req.body.email;
    const password= req.body.password;

    const user= await User.findOne({
        email:email,
        deleted:false
    });

    if(!user){
        res.json({
            code:400,
            message:"Email không tồn tại!"
        });
        return;
    }
    if(md5(password)!=user.password){
        res.json({
            code:400,
            message:"Sai mật khẩu"
        });
        return;
    }
    const token=user.tokenUser;
    res.cookie("tokenUser",token);
    res.json({
        code:200,
        message:"Đăng nhập thành công!",
        token:token
    });
}

module.exports.forgotPassword=async(req,res)=>{
    const email=req.body.email;
    const user=await User.findOne({
        email:email,
        deleted:false,
    });
    if(!user){
        res.json({
            code:400,
            message:"Email không tồn tại"
        });
        return;
    }
    const otp=generateHelper.generateRandomNumber(8);
    const objectForgotPassword={
        email:email,
        otp:otp,
        expireAt: Date.now()
    }
    //console.log(objectForgotPassword);
    const forgotPassword=new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();


    //Gửi mã OTP
    const subject="Mã OTP xác minh lấy lại mật khẩu";
    const html=`
        Mã OTP để lấy lại mật khẩu của bạn là <b>${otp}</b>
    `
    sendMailHelper.sendMail(email,subject,html);


    res.json({
        code:200,
        message:"Đã gửi mã OTP qua email!"
    });


}

module.exports.otpPassword=async(req,res)=>{
    const email=req.body.email;
    const otp=req.body.otp;

    const result=await ForgotPassword.findOne({
        email:email,
        otp:otp
    });

    if(!result){
        res.json({
            code:400,
            message:"OTP không hợp lệ!"
        });
        return;
    }
    const user=await User.findOne({
        email:email
    });
    const token=user.tokenUser;
    res.cookie("tokenUser",token);
    res.json({
        code:200,
        message:"Xác thực thành công!",
        token:token
    });
}

module.exports.resetPassword=async(req,res)=>{
    const token=req.body.token;
    const password=req.body.password;

    const user= await User.findOne({
        tokenUser:token,
    });
    if(md5(password) === user.password){
        res.json({
            code:400,
            message:"Vui lòng nhập mật khẩu mới khác với mật khẩu cũ."
        });
        return;
    }
    await User.updateOne(
        {
            tokenUser:token,
        },{
            password:md5(password),
        }
    );
    res.json({
        code:200,
        message:"Đổi mật khẩu thành công!"
    });
}