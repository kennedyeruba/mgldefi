import { Button ,Card,Input,Row, Col,Checkbox,Form  } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { List, message, Avatar, Skeleton, Divider } from 'antd';
import { MailOutlined ,SafetyOutlined,LockOutlined,TeamOutlined ,EyeTwoTone,EyeInvisibleOutlined} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import openNotification from "../helpers/notification";
import RegCard from '../component/RegCard';
import {SERVER_URL} from "../../constants/env";
import Wallet from "../../utils/wallet";
const wallet = new Wallet();

function AccountReg(props) {
  const [form] = Form.useForm();
  const [email, setEmail] = useState("");
  const [password,setPassword]=useState("");
  const [verificationCode,setVerificationCode]=useState(0);
  const [inviteCode,setInviteCode]=useState(0);
  const[hasAcceptedTerms,setAcceptedTerms] = useState(false);
  const [message,setMessage]=useState("");
  const[isValidated,setValidate]=useState(false);
  
  const [t,i18n] = useTranslation();

  const changeState = async () => {}

  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const verifyEmail = async () => {
    const response = await axios.post(`${SERVER_URL}users/emailverify`, {
      email: email,
      locale: (localStorage.getItem('locale') || "Mn")
    });

    if (response.data.response) {
      openNotification(t('Success'), t("E-mail sent successfully"), true, false);
      setMessage({ style: 'text-green-500', val: 1, data: t("E-mail successfully verified!") });
    }
    else {
      openNotification(t('Fail!'), t("E-mail not verified!"), false, false);
      setMessage({ style: 'text-red-500', val: 0, data: t("E-mail not verified!") });
    }
  }

  const register = async () => {
    try {
      await form.validateFields();

      const response = await axios.post(`${SERVER_URL}users/signup`,{
        email:email,
        email_verify:verificationCode,
        password:password,
        confirm_password:password,
        country:props.country.title,
        invite_code:inviteCode,
        locale: (localStorage.getItem('locale') || "Mn")
      });

      if(!response.data.response){
        openNotification(t('Fail!'),response.data.message,false);
        setMessage({style:'text-red-500',val:false,data:t("Account failed!")});
        return;
      }

      openNotification(t('Success'),t("Account successfully created!"),true,goMain)
      setMessage({style:'text-green-500',val:true,data:t("Account successfully created!")})

      localStorage.setItem("userInfo", JSON.stringify(response.data.data.userInfo));
      localStorage.setItem("jwtToken", JSON.stringify(response.data.data.token));

      if(response.data.data.keyPair){
        localStorage.setItem("privateKey",wallet.decrypt(response.data.data.keyPair[0].privateKey));
        localStorage.setItem("publicKey",JSON.stringify(response.data.data.keyPair[0].publicKey));
      }
    } catch(err) {
      console.log("[Registration Form Error]: ", err);
    }
  }

  const goMain=()=>{
      window.location.href="/walletMain";
  }

  const hasErrors = fieldsError => {
    console.log("error", fieldsError[0].errors.length);

    if(fieldsError[0].errors.length>0) return false;
    verifyEmail();
  }

  return (
      <RegCard className={props.className} cardClassName='w-full h-full rounded-none flex flex-col flex-wrap justify-center items-center'>
          <Row className="text-xl font-bold py-4 text-gray-900">
            {t("Create MGL Account")}
          </Row>
          
          <Form form={form}
            name="basic"
            initialValues={{ remember: true }}
            autoComplete="off"
            onValuesChange={changeState}
            onFinish={onFinish}
            validateTrigger = "onSubmit"

          >
            <Form.Item
              validateTrigger = "onBlur"
              name={[ 'email']}
              rules={[
                { type: 'email',message:t('Invalid Email Address') },
                { required: true, message: t('Please input your E-mail!') },
                { max:50,message:t('Please input less than 50 characters') }
              ]}
            >
              <Input  
                placeholder= {t("E-mail address")} 
                prefix={<MailOutlined className="m-2"/> } 
                className=" rounded-lg  bg-gray-200 text-black "
                onChange={(e)=>setEmail(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              validateTrigger = "onBlur"
              name="Verification"
              rules={[
                { required: true, message: t('Please input your E-mail Verification Code!') },
                { len:4,message:t('Please input should be 4 characters') }
              ]}
            >
              <Input 
                placeholder={t('E-mail verification code')} 
                prefix={<SafetyOutlined className="m-2"/>}
                suffix={<a onClick={ ()=>hasErrors(form.getFieldsError()) }  className="bg-gray-800 text-md  text-white  rounded-xl py-1 px-4">{t("Send")}</a>} 
                className="rounded-lg  bg-gray-200"
                onChange={(e)=>setVerificationCode(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              validateTrigger = "onBlur"
              name="password"
              rules={[
                { required: true, message: t('Please input your password!') },
                {min:8,message:t('Please input more than 8 characters')}]}
            >
              <Input.Password 
              placeholder={t("enter password here")} 
              prefix={<LockOutlined className="m-2"/> }
              className="rounded-lg  bg-gray-200"
              onChange={(e)=>setPassword(e.target.value)}/>
            </Form.Item>

            <Form.Item
              validateTrigger = "onChange"
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: t('incorrect password!') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t("The passwords that you entered do not match!")));
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder={t("confirm password")} 
                prefix={<LockOutlined className="m-2"/>} 
                className="rounded-lg  bg-gray-200"
              />
            </Form.Item>

            <Form.Item
              name="inviteCode"
              rules={[{max:10}
              ]}>
               <Input 
              placeholder={t("Invite Code(Optional)")} 
              prefix={<TeamOutlined className="m-2"/>} 
              className="rounded-lg  bg-gray-200"
              onChange={(e)=>setInviteCode(e.target.value)}/>
            </Form.Item>

            <Form.Item 
              name="check" 
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error(t("Should accept agreement"))),
                },
              ]}>
              <Checkbox onChange={(e) => setAcceptedTerms(e.target.checked)} >{t("I have read and agree to MGL's Terms of Service")}</Checkbox>
            </Form.Item>
         
            <Form.Item className="mt-2">
              <button  
                type="submit"
                onClick={register}
                className={ "w-full bg-gray-800 text-lg font-bold text-white  rounded-lg py-2" }
              >
                {t("Create Account")}
              </button>
            </Form.Item>
          </Form>
          <div className="text-center">
            {t("Already registered?")}<Link to="/login" onClick={props.stepLogIn} className="myAnchor text-md ml-2">{t("Log In")}</Link>
          </div>
        </RegCard>
  );
}

export default AccountReg;
