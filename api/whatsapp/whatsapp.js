let mongoose = require('mongoose')
let express = require('express')
let request = require('request')
const nodemailer = require('nodemailer');
let messageBird = require('messagebird')(`${process.env.whatsapp_key}`);
const uuid = require('uuid')
multerS3 = require('multer-s3')
multer = require('multer')
aws = require('aws-sdk')
var path = require('path')
const ChatSchema = require('../../models/whatsAppChats')
let router = express.Router()
const socket = require('../../socket').getIo()
const axios = require('axios')
const User = require('../../models/user')
const Lead = require('../../models/lead')
const LeadGen = require('../../models/leadGen')
const LeadStatus = require('../../models/leadStatus')
const LeadRemark = require('../../models/leadRemark')
const Management = require('../../models/management')
const Invoice = require('../../models/invoice')
const fun = require('../../api/function')
const event = require('../event')
const whatsAppEvent = require('../whatsapp/whatsappEvent')
let io = undefined
let agentName = undefined
router.post('/get-lead', (req, res, next) => {
  // console.log("Api called")
  res.json({
    "message": "success"
  })
})





router.post('/get-name', (req, res, next) => {
  res.json({
    name: "vinay"
  })
})


/*messageBird.conversations.webhooks.list(100, 0, function (err, response) {
  if (err) {
  return // console.log(err);
  }
  // console.log(response);
  response.items.forEach(item => {
    messageBird.conversations.webhooks.delete(item.id, function (err, response) {
      if (err) {
      return // console.log(err);
      }
      // console.log(response);
    });
  })
});*/

router.get('/get-templates', async (req, res, next) => {
  // console.log('Templates api called...')
  let tem = []
  await axios.get('https://integrations.messagebird.com/v1/public/whatsapp/templates', {
    headers: {
      //"Authorization": "AccessKey l7iGIM4xsgZlf17ShuPzHEhHo",
      "Authorization": "AccessKey yhe6H27Zz3AHtx7V4vz0EqSBy",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br"
    }
  }).then(data => {


    // console.log(data.data[0])
    data.data.forEach(templates => {
      tem.push(templates)
    })
  })
    .catch(err => {
      // console.log("ERROR: ", err)
    })
  res.json({
    templates: tem
  })
})


router.get('/get-chat', async (req, res, next) => {
  // console.log('Whats App get chats...', req.query.contact);
  let user = await ChatSchema.findOne({ contact: req.query.contact }).exec()
  let chat = []
  if (user) {
    chat = user.chat
  }
  res.status(200).json({
    user: user,
    chat: chat
  })
})

router.put('/switch-bot', async (req, res, next) => {
  let data = await ChatSchema.findOne({ contact: req.body.contact }).exec()
  if (!data) {
    return res.json({
      message: 'success'
    })
  } else {
    data.isBot = req.body.switch
    await data.save()
    return res.json({
      message: 'success'
    })
  }
})


let globalCre = undefined
let setMessages = (obj, user) => {
  let agent = ''
  let client = ''
  let media_url = ''
  let type = ''
  let isBot = false
  let isTemplate = false
  if (user == 'agent') {
    if (obj.content.text) {
      agent = obj.content.text
    } else {
      isTemplate = true
      if (obj.content.image) {
        media_url = obj.content.image.url
        var extension = path.extname(media_url)
        type = extension.slice(1)

      } else if (obj.content.hsm.templateName == 'party_statement') {
        //agent = obj.content.hsm.templateName
        media_url = 'https://toppng.com/uploads/preview/pdf-icon-11549528510ilxx4eex38.png'
        // media_url  = obj.content.hsm.components[0].parameters[0].document.url
        // var extension = path.extname(media_url)
        //type = extension


      }
    }

  } else if (user == 'bot') {
    if (obj.content.text) {
      agent = obj.content.text
    } else {
      isTemplate = true
      if (obj.content.image) {
        agent = obj.content.image.caption
      } else if (obj.content.hsm.templateName) {
        agent = obj.content.hsm.templateName
      }

    }
    isBot = true
  } else {
    client = obj.content.text
  }

  // Get CRE from this event
  socket.emit('get-cre')
  let messageData = {
    channelId: obj.channelId,
    conversationId: obj.conversationId,
    agent: agent,
    media_url: media_url,
    type: type,
    agentName: globalCre,
    client: client,
    messageId: obj.id,
    isBot: isBot,
    status: obj.status,
    templateMessage: isTemplate
  }
  // console.log("mess" + messageData);
  return messageData
}

let setContactInfo = (obj) => {
  let contactInfo = {
    createdDatetime: obj.createdDatetime,
    displayName: obj.displayName,
    firstName: obj.firstName,
    href: obj.href,
    lastName: obj.lastName,
    msisdn: obj.msisdn,
  }
  return contactInfo
}

let setConversations = (obj) => {
  let conversation = {
    contactId: obj.contactId,
    createdDatetime: obj.createdDatetime,
    lastReceivedDatetime: obj.lastReceivedDatetime,
    status: obj.status
  }
  return conversation
}


router.post('/whats-app/webhook', async (req, res, next) => {
  // console.log("Vinay testing the HSM MESSAGE....", req.body)
  let userContact = ""

  if (req.body.message.from !== "+919560030702") {
    userContact = req.body.message.from

    let body = {
      "phone": userContact,
      "name": req.body.contact.displayName,
      "email": "",
      "company": "CarEager Xpress Gurugram",
      "leadtype": "WhatsApp",
      "category": "WhatsApp",
      "resource_url": "https://www.messagebird.com"
    }
    // console.log("Body of contact...")
    axios.post("http://13.234.81.188:4000/api/whatsapp/whatsapp/lead/add", body)
      .then(res => {
        // console.log("Lead generated")
      })
  }


  let from = '';
  if (req.body.message.from) {
    if (req.body.message.from.length == 13) {
      from = req.body.message.from.slice(3)
    } else if (req.body.message.from.length == 12) {
      from = req.body.message.from.slice(2)
    } else if (req.body.message.from.length == 11) {
      from = req.body.message.from.slice(1)
    }
  }
  let direction = req.body.message.direction
  let origin = req.body.message.origin
  //let from = req.body.message.from.slice(3)
  let to = req.body.message.to.slice(3)




  let conversationObj = req.body.conversation //setConversations(req.body.conversation)
  let contact = req.body.contact //setContactInfo(req.body.contact)


  let time = new Date()

  // console.log('from....', from, to);
  if (direction == 'received') {
    // console.log('received called')
    let getChats = await ChatSchema.findOne({ contact: from }).exec()
    let chat = []
    if (!getChats) {
      let messageObj = setMessages(req.body.message, 'client')
      let newMessageObj = {
        conversation: conversationObj,
        contact: contact,
        message: messageObj
      }

      fun.webNotification('new chat', messageObj, from);
      chat.push(newMessageObj)

      let obj = {
        conversationId: req.body.message.conversationId,
        channelId: 'fe7defba13134d3d81498f5c8f8f0aa8',
        direction: req.body.message.direction,
        origin: req.body.message.origin,
        platform: req.body.message.platform,
        status: req.body.message.status,
        from: req.body.message.from,
        to: req.body.message.to,
        type: req.body.message.type,
        contact: from,
        chat: chat,
        time: time.toLocaleTimeString(),
        start_at: new Date(),
        update_at: new Date()
      }


      let createChat = await ChatSchema.create(obj)
      // console.log("Whatsapp Socket is connected", createChat)
      socket.emit('client-reply', createChat)
      // console.log('socket data', createChat)
    } else {
      let messageObj = setMessages(req.body.message, 'client')
      let newMessageObj = {
        conversation: conversationObj,
        contact: contact,
        message: messageObj,
        time: time.toLocaleTimeString()
      }
      // console.log('from....Sumit', from);
      // console.log('sss2' + messageObj.client, "==" + JSON.stringify(newMessageObj.contact))

      fun.webNotification('new chat', messageObj, from);
      getChats.chat.push(newMessageObj)
      let createChat = await getChats.save()
      // console.log("Whatsapp Socket is connected", createChat)
      socket.emit('client-reply', createChat)
    }
  } else if (direction == 'sent' && origin == 'flows') {
    // console.log('sent called')

    let getChats = await ChatSchema.findOne({ contact: to }).exec()
    let chat = []

    let messageObj = setMessages(req.body.message, 'bot')
    let newMessageObj = {
      conversation: conversationObj,
      contact: contact,
      message: messageObj,
      time: time.toLocaleTimeString()
    }
    if (!getChats) {
      let obj = {
        conversationId: req.body.message.conversationId,
        channelId: 'fe7defba13134d3d81498f5c8f8f0aa8',
        direction: req.body.message.direction,
        origin: req.body.message.origin,
        platform: req.body.message.platform,
        status: req.body.message.status,
        from: req.body.message.from,
        to: req.body.message.to,
        type: req.body.message.type,
        contact: to,
        chat: chat.push(newMessageObj),
        start_at: new Date(),
        update_at: new Date(),
        time: time.toLocaleTimeString()
      }

      let createChat = await ChatSchema.create(obj)
      // console.log("Whatsapp Socket is connected")
      socket.emit('client-reply', createChat)
      // console.log('socket data', createChat)

    } else if (req.body.message.status == 'pending' || req.body.message.status == 'read' ||
      req.body.message.status == 'sent' || req.body.message == 'delivered') {
      let messageObj = setMessages(req.body.message, 'bot')
      let newMessageObj = {
        conversation: conversationObj,
        contact: contact,
        message: messageObj,
        time: time.toLocaleTimeString()
      }
      let isMatched = false
      for (let i = 0; i < getChats.chat.length; i++) {
        if (newMessageObj.message.messageId == getChats.chat[i].message.messageId) {
          // console.log("bot Chat matched here..")
          getChats.chat[i].message = newMessageObj.message
          isMatched = true
        }
      }
      if (!isMatched) {
        getChats.chat.push(newMessageObj)
      }
      getChats.markModified('chat')
      getChats.chat.push(newMessageObj)
      let createChat = await getChats.save()
      // console.log("Whatsapp Socket is connected", createChat)
      socket.emit('client-reply', createChat)
    }
  } else if (direction == 'sent' &&
    origin == 'api' &&
    req.body.message.status == 'pending' || req.body.message.status == 'read' ||
    req.body.message.status == 'sent' || req.body.message == 'delivered') {

    // console.log('api sent and pending called')

    let getChats = await ChatSchema.findOne({ contact: to }).exec()
    let chat = []

    // return vinay
    let messageObj = setMessages(req.body.message, 'agent')
    let newMessageObj = {
      conversation: conversationObj,
      contact: contact,
      message: messageObj,
      time: time.toLocaleTimeString()
    }
    if (!getChats) {
      // console.log('TEsting the new chat')
      // Taking the cre name from this event




      chat.push(newMessageObj)
      let obj = {
        conversationId: req.body.message.conversationId,
        channelId: 'fe7defba13134d3d81498f5c8f8f0aa8',
        direction: req.body.message.direction,
        origin: req.body.message.origin,

        platform: req.body.message.platform,
        status: req.body.message.status,
        messageId: req.body.message.id,
        from: req.body.message.from,
        to: req.body.message.to,
        type: req.body.message.type,
        contact: to,
        chat: chat,
        isBot: false,
        start_at: new Date(),
        update_at: new Date(),
        time: time.toLocaleTimeString()
      }

      let createChat = await ChatSchema.create(obj)
      // console.log("Api chat caled", createChat._id)
      let lead = await Lead.findOne({ contact_no: to }).exec()
      // lead.chat = createChat._id
      socket.emit('get-agent-name')
      // console.log("Before saving the agent name..", agentName)
      lead.save()
      socket.emit('client-reply', createChat)
      // console.log('socket data', createChat)

    } else {
      let isMatched = false
      for (let i = 0; i < getChats.chat.length; i++) {
        if (newMessageObj.message.messageId == getChats.chat[i].message.messageId) {
          // console.log("Chat matched here..")
          getChats.chat[i].message = newMessageObj.message
          isMatched = true
        }
      }
      if (!isMatched) {
        getChats.chat.push(newMessageObj)
      }
      await socket.emit('get-agent-name')
      newMessageObj.message['agentName'] = agentName
      // console.log("Before saving the agent name..", agentName)



      getChats.markModified('chat')
      let createChat = await getChats.save()

      // console.log("Whatsapp Socket is connected", createChat)

      socket.emit('client-reply', createChat)

    }
  }
  res.status(200).json({
    message: "Success"
  })
})


/*messageBird.conversations.webhooks.list(100, 0, function (err, response) {
  if (err) {
  return // console.log(err);
  }
  // console.log(response);
});*/

//  messageBird.conversations.webhooks.create({
//    'events': [
//      'message.created',
//      'message.updated'
//    ],
//    'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
//    'url': 'https://c8b945ffad10.ngrok.io/api/whatsapp/whats-app/webhook'
//  }, function (err, response) {
//    if (err) {aa
//      return // console.log(err);
//    }
//    // console.log(response);
//  });




socket.on('connect', io => {
  // console.log("Whatsapp Socket is connected")
  io = io

  io.on('agent-name-send', res => {
    agentName = res.name
    // console.log("Agent name...", res)
  })

  io.on('send-message', async data => {
    // console.log("message Send to gaurav.")


    var params = {
      'to': '+91' + data.phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'text',
      'content': {
        'text': data.message
      }
    };
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        // return // console.log(err);
      }
      // console.log(response);
    });
  })

  io.on('cre', async data => {
    globalCre = data.name
  })

  // Socket to get all the users of whatsapp
  io.on('get-users', async data => {
    // console.log("Get User data.....", data)
    let getUser = undefined
    let filter = []
    if (data.query) {
      var specification = {};
      specification['$match'] = {
        $or: [
          { 'name': { $regex: data.queryValue, $options: 'i' } },
          { 'contact_no': { $regex: data.queryValue, $options: 'i' } },
        ]
      }
      filter.push(specification)

      getUser = await Lead.aggregate(filter)
        .allowDiskUse(true)
        .limit(10)
        .skip(10 * data.userLimit)
        .exec()
      // getUser = await Lead.find({}).limit(10)
    } else {

      getUser = await Lead.find({}).limit(10).skip(data.userLimit * 10)
        .populate({ path: "chat" })
        .populate({ path: "user" })
        .exec()
    }

    if (getUser.length) {
      let userObject = {
        users: getUser,
        responseCode: '200'
      }
      socket.emit('user-update', userObject)
    } else {
      let userObject = {
        users: getUser,
        responseCode: '404'
      }
      socket.emit('user-update', userObject)
    }
  })

  io.on('single-user-chat', async (contact_no) => {
    let getUser = await ChatSchema.findOne({ contact: contact_no }).exec()

    // console.log("Single user called!")

    if (getUser) {
      let userObj = {
        user: getUser,
        responseCode: '200'
      }

      //Change to be made by vinay
      socket.emit('single-user-chat', userObj)

      // console.log("User data single", userObj.user)
    } else {
      let userObj = {
        user: getUser,
        responseCode: '404'
      }
      socket.emit('single-user-chat', userObj)
    }
  })

  // whatsapp event

  io.on('send-hsm', async data => {
    whatsAppEvent.templateChatInit(data.phone)
    // console.log("Template event called!")
  })

  io.on('hsm-send', async data => {
    // console.log("Templates called", data.templateName, data.phone, data.HsmContent)
    var params = {
      'to': '+91' + data.phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': data.templateName,
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: data.HsmContent,
        }
      }
    }
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return // console.log(err);
      }
      // console.log(response);
    });
  })

})


router.get('/payment/code', async (req, res, next) => {
  // console.log("Your  payment link code is called...", req.query.phone.slice(2))
  let phone = req.query.phone.slice(2)
  //let phone = req.body.phone;
  let user = await User.findOne({ contact_no: phone })
  let business = "5bfec47ef651033d1c99fbca"

  whatsAppEvent.qrCodeWhatsApp(user, business)


  // var params = {
  //   'to': '+919717837769', //+ phone,
  //   'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
  //   'type': 'image',
  //   content: {
  //     'image': {
  //       "url": "https://i.ibb.co/DfPwb5W/google-pay.jpg",
  //       "caption": "Pay using our Google pay UPI Id"
  //     }
  //   }
  // }
  // await messageBird.conversations.start(params, function (err, response) {
  //   if (err) {
  //     return // console.log(err);
  //   }
  //   // console.log(response);
  // });
})

router.get('/payment/link', async (req, res, next) => {
  // console.log("Your  payment link is called...", req.query.phone.slice(2))
  let phone = req.query.phone.slice(2);
  let business = "5bfec47ef651033d1c99fbca"
  //let phone = req.body.phone;
  let user = await User.findOne({ contact_no: phone })
  let invoice = await Invoice.findOne({ user: mongoose.Types.ObjectId(user._id) }).exec()

  if (invoice) {
    if (invoice.due) {

      // whatsAppEvent.invoiceSend(user._id, invoice, business )


      // console.log("invoice" + invoice.due.due);
      return res.json({
        "due": invoice.due.due


      })
    } else {
      // console.log("invoice else " + invoice.due);
      // whatsAppEvent.invoiceSend(user._id, invoice, business )
      return res.json({
        "due": invoice.due.due
      })
    }
  } else {
    // console.log("invoice else " + "have no invoice yet");

    return res.json({
      "due": "0",
      "message": "have no invoice yet"
    })
  }
})

router.get('/get/client', async (req, res, next) => {
  // console.log("Get Client called...")
  let phone = req.query.phone.slice(2)
  let chat = await User.findOne({ contact_no: phone }).exec()
  if (chat && Object.keys(chat).length) {
    return res.json({
      'name': chat.name,
      'exist': "true"
    })
  } else {
    return res.json({
      'exist': "false"
    })
  }
})

router.put('/set/name', async (req, res, next) => {
  // console.log("Data", req.body.name)
  let phone = req.body.phone.slice(2)
  let chat = await ChatSchema.findOne({ contact: phone }).exec()
  chat.name = req.body.name
  await chat.markModified('name')
  await chat.save()
  res.json({
    'message': 'success'
  })
})


router.post('/send-lead-mail', async (req, res, next) => {
  // console.log("Send mail called..")
  let date = new Date()
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'care@autroid.com',
      pass: 'launch@2021'
    }
  });

  let mail = {
    from: 'Autroid Care <care@autroid.com>',
    to: "care@autroid.com",
    // to: "abhinav@autroid.com",
    //subject: '[URGENT] ' + d.type + ' - ' + d.updated_at,
    subject: '[New Lead] ' + "Autroid Website" + ' - ' + req.body.name + ' - ' + req.body.contact + ' - ' + req.body.bname,
    html: '<table><tr><th style="text-align: left">Customer Name </td><td>' + req.body.name + '</th></tr><tr><th style="text-align: left">Customer Contact No. </th><td>' + req.body.contact + '</td></tr><tr><th>Request Time </th><td>' + moment(date).tz('Asia/Kolkata').format('lll') + '</td></tr><tr><td><a target="_blank" href="http://maps.google.com/maps?z=12&t=m&q=loc:' + "1" + '+' + "0" + '">Click For Location</a></td></tr></table>'
  };

  transporter.sendMail(mail, (error, info) => {
    if (error) {
      // console.log(error);
      // console.log(info)
    }
  });

  res.json({
    responseCode: "200",
    message: "Lead generated"
  })
})

router.post('/whatsapp/lead/add', async function (req, res, next) {
  var contact_no = req.body.phone;
  if (contact_no) {
    if (contact_no.length == 13) {
      contact_no = contact_no.slice(3)
    } else if (contact_no.length == 12) {
      contact_no = contact_no.slice(2)
    } else if (contact_no.length == 11) {
      contact_no = contact_no.slice(1)
    }
    var getUser = await User.findOne({ contact_no: contact_no }).exec();

    var user = null;
    var name = req.body.name;
    var email = req.body.email;
    var business_name = req.body.company;  //CarEager Xpress Gurugram
    var businessId = "";
    var pickup_date = undefined
    var pickup_address = undefined;
    if (req.body.date) {
      pickup_date = req.body.date
      pickup_address = req.body.address; /* [req.body.longitude,req.body.latitude],  [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];*/


    }
    var source = "WhatsApp";

    if (getUser) {
      user = getUser._id;
      name = getUser.name;
      email = getUser.email;
      contact = getUser.contact_no;
    }
    var business_record = await User.findOne({ "account_info.type": "business", "name": business_name }).exec();
    if (business_record) {
      businessId = business_record._id;
    }
    else {
      businessId = "5bfec47ef651033d1c99fbca";
    }
    // businessId=business_record._id;
    // console.log(businessId)

    var checkLead = await Lead.findOne({ contact_no: contact_no, business: businessId, "remark.status": { $in: ["Open", "Follow-Up",] } }).sort({ updated_at: -1 }).exec();

    var status = await LeadStatus.findOne({ status: "Open" }).exec();

    if (checkLead) {
      Lead.findOneAndUpdate({ _id: checkLead._id }, {
        $set: {
          type: req.body.leadtype,
          // pickup_address: pickup_address,
          // pickup_date: pickup_date,
          follow_up: {
            date: null,
            time: "",
            created_at: new Date(),
            updated_at: new Date(),
          },
          remark: {
            status: status.status,
            resource: req.body.resource_url,
            customer_remark: "",
            assignee_remark: "",
            pickup_date: req.body.date,
            pickup_address: req.body.address,/*[req.body.longitude,req.body.latitude] [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]*/
            resource: req.body.resource_url,
            color_code: status.color_code,
            created_at: new Date(),
            updated_at: new Date()
          },
          source: req.body.category,
          updated_at: new Date(),
          // business:businessId
        }
      }, { new: true }, async function (err, doc) {

        LeadRemark.create({
          lead: checkLead._id,
          type: req.body.leadtype,
          source: source,
          resource: req.body.resource_url,
          status: status.status,
          customer_remark: source,
          assignee_remark: source,
          assignee: checkLead.assignee,
          color_code: status.color_code,
          created_at: new Date(),
          updated_at: new Date()
        }).then(function (newRemark) {
          Lead.findOneAndUpdate({ _id: checkLead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
          })
        });


        // event.assistance(checkLead, req.headers['tz'])

        // var json = ({
        //     responseCode: 200,
        //     responseMessage: "Pre: "+checkLead._id,
        //     responseData: {}
        // });

        // console.log("fdsdfd" + checkLead._id);
        res.status(200).json({
          lead: checkLead._id
        })
      });
    }
    else {
      var data = {}
      var manager = businessId;

      var status = await LeadStatus.findOne({ status: "Open" }).exec();
      //for this business find all CREs
      //         //for each CRE find count of leads'
      //         //add this info into managers array
      //         //trying to sort this arraywith maximum lead assign to CRE on top
      //         //Create a lead and assign lead to the  CRE having least no of leads
      var managers = [];
      await Management.find({ business: businessId, role: "CRE" })
        .cursor().eachAsync(async (a) => {
          // var d = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open', 'Follow-Up'] } }).count().exec();


          var open = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Open',] } }).count().exec();
          var follow_up = await Lead.find({ business: businessId, assignee: a.user, 'remark.status': { $in: ['Follow-Up'] }, 'follow_up.date': { $lte: new Date() } }).count().exec();
          var d = open + follow_up;
          managers.push({
            user: a.user,
            count: d
          })
        });

      if (managers.length != 0) {
        managers.sort(function (a, b) {
          return a.count > b.count;
        });

        manager = managers[0].user;
      }

      var data = {
        user: user,
        business: businessId,
        name: name,
        contact_no: contact_no,
        email: email,
        assignee: manager,
        contacted: false,
        priority: 3,
        pickup_address: pickup_address,
        pickup_date: pickup_date,
        follow_up: {

        },
        type: req.body.leadtype,
        geometry: [0, 0],
        source: source,
        remark: {
          status: status.status,
          customer_remark: "",
          assignee_remark: "",
          assignee: manager,
          pickup_address: req.body.address, /* [req.body.longitude,req.body.latitude ] [parseFloat(req.body.longitude), parseFloat(req.body.latitude)] , */
          pickup_date: req.body.date,
          resource: req.body.resource_url,
          color_code: status.color_code,
          created_at: new Date(),
          updated_at: new Date(),
        },

        created_at: new Date(),
        updated_at: new Date(),
      }

      await Lead.create(data).then(async function (lead) {
        var count = await Lead.find({ _id: { $lt: lead._id }, business: businessId }).count();
        var lead_id = count + 10000;

        Lead.findOneAndUpdate({ _id: lead._id }, { $set: { lead_id: lead_id } }, { new: true }, async function (err, doc) {
        })
        var status = await LeadStatus.findOne({ status: "Open" }).exec();
        LeadRemark.create({
          lead: lead._id,
          type: "Booking",
          source: "WhatsApp",
          status: status.status,
          customer_remark: "WhatsApp",
          assignee_remark: "WhatsApp",
          assignee: manager,
          resource: req.query.resource_url,
          color_code: status.color_code,
          created_at: new Date(),
          updated_at: new Date()
        }).then(function (newRemark) {
          Lead.findOneAndUpdate({ _id: lead._id }, { $push: { remarks: newRemark._id } }, { new: true }, async function (err, doc) {
          })
        });
        // console.log(pickup_address);
        // event.assistance(lead, req.headers['tz'])
        // console.log("heerrrrrrrr");
        var activity = "Lead";
        fun.webNotification(activity, lead);
        if (pickup_address) {
          await whatsAppEvent.whatsappLeadCre(lead._id, businessId);
        }
        await whatsAppEvent.leadGenerate(lead._id, businessId);
        event.leadCre(lead._id, businessId);
        await whatsAppEvent.leadCre(lead._id, businessId);
        // console.log("gdfgf" + lead._id);
        res.status(200).json({
          lead: lead._id
        })
      });
    }
  }
})
router.post("/send-message", async (req, res, next) => {
  let body = req.body.body
  // console.log("Data...", req.body.body.length)
  let length = req.body.body.length

  for (let i = 0; i < length; i++) {
    let leads = await LeadGen.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.body[i].id) },
      { 'remark.status': "contacted" }).exec()

    await whatsAppEvent.leadGenerate(req.body.body[i].mobile,

      req.body.body[i].assignee)
  }

  res.json({
    "responseCode": "200",
    "responseMessage": "success"
  })
})
router.get('/payment/code/req', async (req, res, next) => {
  var business = "60e96e61a73fa5369453e35e"
  var business = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
  // console.log("api called..");
  // console.log("link " + business.business_info.party_statements);
  var params = {
    'to': '+919717837769',
    'type': 'hsm',
    'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
    'content': {
      'hsm': {
        'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
        'templateName': 'party_statement',
        'language': {
          'policy': 'deterministic',
          'code': 'en'
        },
        'components': [

          {
            "type": "header",
            'parameters': [
              {
                "type": "document",
                "document": {
                  //"url": 'http://www.africau.edu/images/default/sample.pdf',
                  'url': `${business.business_info.party_statements}`,
                  // 'url' :'https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/RizeBear+Distribution+Private+Limited.pdf',
                  "caption": `${business.name}.pdf`
                }
              }
            ]
          },
          {
            "type": "body",
            'parameters': [
              {
                'type': 'text',
                'text': business.name,
              },

            ]
          }
        ]
      }
    }
  }

  await messageBird.conversations.start(params, function (err, response) {
    if (err) {
      return // console.log(err);
    }
    // console.log(response);
  });

})

router.post('/upload-media', async (req, res, next) => {
  // var phone = '9717837769';
  // console.log("SS" + phone)



  // console.log("hgf" + whatsapp.contact);


  var s3 = new aws.S3({
    accessKeyId: config.IAM_USER_KEY,
    secretAccessKey: config.IAM_USER_SECRET,
    Bucket: config.BUCKET_NAME

  });

  var file_type = "";




  var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: config.BUCKET_NAME + '/whatsappMediaChats',
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      // contentDisposition: 'attachment',
      key: function (req, file, cb) {
        var extArray = file.mimetype.split("/");
        var extension = extArray[extArray.length - 1];
        var filename = uuidv1() + '.' + extension;

        if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'pdf' || extension == 'doc' || extension == 'docx' || extension == 'xls' || extension == 'xlsx') {
          cb(null, filename);
          // console.log("Sumit" + extension);
        }
        else {
          // console.log("Sumit" + extension);
          var params = {
            Bucket: config.BUCKET_NAME + "/whatsappMediaChats",
            Key: filename,

          };

          s3.deleteObject(params, async function (err, data) {
            // console.log(err);
            var json = ({
              responseCode: 422,
              responseMessage: "Invalid extension",
              responseData: {}
            });
            res.status(422).json(json)
          });
        }
      }
    })
  }).array('media', 1);

  upload(req, res, async function (error) {

    if (error) {
      // console.log(error)
      var json = ({
        responseCode: 400,
        responseMessage: "Error occured",
        responseData: {}
      });
      res.status(400).json(json)
    }


    else {



      media_url = []
      // console.log("Phone  = " + req.body.phone)
      var whatsapp = await ChatSchema.findOne({ contact: req.body.phone }).exec();
      if (whatsapp) {
        whatsapp.media_url.push('https://s3.ap-south-1.amazonaws.com/' + config.BUCKET_NAME + "/whatsappMediaChats/" + req.files[0].key)
        // whatsapp.media_url.push(data)
        await whatsapp.save()


        var dataUrl = whatsapp.media_url.slice(-1)[0]

        var extension = path.extname(dataUrl)
        // console.log("fdsfdsfds", ext);

        if (extension == '.png' || extension == '.jpg' || extension == '.jpeg' || extension == '.gif') {
          // console.log(" whatsapp.contact_no = " + whatsapp.contact_no)
          var params = {
            'to': '+91' + whatsapp.contact, //+ phone,
            'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
            "type": "image",
            content: {
              'image': {
                // "url": "https://i.ibb.co/DfPwb5W/google-pay.jpg",
                'url': `${dataUrl}`,
                "caption": "Shared by Ruchi"
              }
            }
          }




          // var params = {
          //   'to': '+919717837769',
          //   'type': 'hsm',
          //   'channelId': "fe7defba13134d3d81498f5c8f8f0aa8",
          //   'content': {
          //     'hsm': {
          //       'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          //       'templateName': 'party_statement',
          //       'language': {
          //         'policy': 'deterministic',
          //         'code': 'en'
          //       },
          //       'components': [

          //         {
          //           "type": "header",
          //           'parameters': [
          //             {
          //               "type": "image",
          //               "image": {

          //               'url' : `${dataUrl}`,
          //              //'url' : 'https://careager.s3.ap-south-1.amazonaws.com/whatsappMediaChats/5_6163500974267696247.docx',

          //                "caption":`shared by Ruchi`, 
          //                //"caption":`ss.pdf`
          //               }
          //             }
          //           ]
          //         },
          //         {
          //           "type": "body",
          //           'parameters': [
          //             {
          //               'type': 'text',
          //               'text': 'Sumit',
          //             },

          //           ]
          //         }
          //       ]
          //     }
          //   }
          // }


          await messageBird.conversations.start(params, function (err, response) {
            if (err) {
              return // console.log(err);
            }
            // console.log(response);
          });



        }

        if (extension == '.pdf') {

          var params = {
            'to': '+91' + whatsapp.contact,
            'type': 'hsm',
            'channelId': "fe7defba13134d3d81498f5c8f8f0aa8",
            'content': {
              'hsm': {
                'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
                'templateName': 'party_statement',
                'language': {
                  'policy': 'deterministic',
                  'code': 'en'
                },
                'components': [

                  {
                    "type": "header",
                    'parameters': [
                      {
                        "type": "document",
                        "document": {

                          'url': `${dataUrl}`,
                          //'url' : 'https://careager.s3.ap-south-1.amazonaws.com/whatsappMediaChats/5_6163500974267696247.docx',

                          "caption": `Shared by Ruchi`,
                          //"caption":`ss.pdf`
                        }
                      }
                    ]
                  },
                  {
                    "type": "body",
                    'parameters': [
                      {
                        'type': 'text',
                        'text': 'Sumit',
                      },

                    ]
                  }
                ]
              }
            }
          }

          await messageBird.conversations.start(params, function (err, response) {
            if (err) {
              return // console.log(err);
            }
            // console.log(response);
          });

        }
        res.status(200).json({
          responseCode: 200,
          responseMessage: "File has been Sent",

        })
      }
      else {

        res.status(400).json({
          responseCode: 400,
          responseMessage: "Chat not Found",


        })

      }
    }


  });





})

module.exports = router