let mongoose = require('mongoose')
let express = require('express')
let request = require('request')
const whatsapp_key = `${process.env.whatsapp_key}`;
let messageBird = require('messagebird')(`${process.env.whatsapp_key}`);
const uuid = require('uuid')
const ChatSchema = require('../../models/whatsAppChats')
let router = express.Router()
let Booking = require('../../models/booking')
let Address = require('../../models/address')
let User = require('../../models/user')
let Package = require('../../models/package')
let Car = require('../../models/car')
const axios = require('axios')
const Lead = require('../../models/lead')
const UserPackage = require('../../models/userPackage')
const BusinessPlan = require('../../models/businessPlan')
const Invoice = require('../../models/invoice')
const VendorOrders = require('../../models/vendorOrders');
const Management = require('../../models/management');
const Parchi = require('../../models/parchi')



let events = {
  leadGenerate: async (leadId, business) => {
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId
    let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(leadId) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
      .populate({ path: 'assignee', select: 'name contact_no' }).exec()
    var websitelink = getChannel.socialite.website;
    var AndroidAppLink = getChannel.socialite.androidAppLink;
    var IosAppLink = getChannel.socialite.iosAppLink;
    var AndroidLink = undefined;
    var iosLink = undefined;
    var webLink = undefined;
    if (AndroidAppLink) {
      AndroidLink = AndroidAppLink
    } else {
      AndroidLink = "."
    }
    if (IosAppLink) {
      iosLink = IosAppLink
    }
    else {
      iosLink = "."
    }
    if (websitelink) {
      webLink = websitelink
    }
    else {
      webLink = "."
    }

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]

    let date = new Date().getDate()
    let month = new Date().getMonth()
    month = months[month]
    let year = new Date().getFullYear()
    let time = new Date().toLocaleTimeString()

    let todayDate = date + " - " + month + " - " + year

    let id = Math.floor(Math.random() * 90000) + 10000;
    // console.log("Details .......", date, month, year)
    //assigneeUser.name.toString()
    //let month = date.getDate()
    // console.log("Date", date)
    var params = {
      'to': '+91' + lead.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "newlead",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: getChannel.name.toString() },
            { default: "Google" },
            { default: id.toString() },
            { default: lead.assignee.name.toString() },
            { default: todayDate },
            { default: time.toString() },
            { default: webLink.toString() },
            { default: AndroidLink.toString() },
            { default: iosLink.toString() },
            { default: getChannel.name.toString() },
          ],
        }
      }
    }
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return // console.log(err);
      }
      // console.log(response);
    });
  },


  templateChatInit: async (phone) => {
    //let assigneeUser = await User.findOne({_id: mongoose.Types.ObjectId(assignee)}).exec()
    let user = await Lead.findOne({ contact_no: phone }).exec()
    let assigneeUser = await User.findOne({ _id: mongoose.Types.ObjectId(user.assignee) }).exec()
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]

    let date = new Date().getDate()
    let month = new Date().getMonth()
    month = months[month]
    let year = new Date().getFullYear()
    let time = new Date().toLocaleTimeString()

    let todayDate = date + " - " + month + " - " + year

    let id = Math.floor(Math.random() * 90000) + 10000;
    // console.log("Details .......", date, month, year)
    //assigneeUser.name.toString()
    //let month = date.getDate()
    // console.log("Date", date)
    var params = {
      'to': '+91' + phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "query_autoreply",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: "Google" },
            { default: id.toString() },
            { default: assigneeUser.name.toString() },
            { default: todayDate },
            { default: time.toString() }
          ],
        }
      }
    }
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return // console.log(err);
      }
      // console.log(response);
    });
  },

  partsLink: async (phone, business, partsLink) => {
    let user = await User.findOne({ _id: business }).exec()
    // console.log("Parts Link called")
    var params = {
      'to': '+91' + phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "parts_link",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: user.name },
            { default: partsLink }
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
  },

  androidUserReg: async (id, phone) => {
    // console.log("ID and phone...", id, phone)


    var params = {
      'to': '+91' + phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "new_reg",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: id.toString() },
            { default: "250" }
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
  },
bookingWhatsApp: async (id) => {
    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .populate({ path: 'car', select: 'registration_no title' }).exec()

    var getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(booking.business) }).exec()

    if (getChannel) {


      var channelId = getChannel.whatsAppChannelId
      // console.log("cccc " + channelId);
      var websitelink = getChannel.socialite.website;
      var AndroidAppLink = getChannel.socialite.androidAppLink;
      var IosAppLink = getChannel.socialite.iosAppLink;
      var AndroidLink = undefined;
      var iosLink = undefined;
      var webLink = undefined;

      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]

      var date = new Date().getDate()
      var month = new Date().getMonth()
      month = months[month]
      var year = new Date().getFullYear()
      var time = new Date().toLocaleTimeString()

      var todayDate = date + " - " + month + " - " + year

      let address = await Address.findOne({ user: mongoose.Types.ObjectId(booking.user._id) }).exec()
      let advisor = await User.findOne({ _id: mongoose.Types.ObjectId(booking.advisor) }).exec()
     
      let addressFound = undefined
      let convenience = undefined
      let time_slot = undefined

      if (AndroidAppLink) {
        AndroidLink = AndroidAppLink
      } else {
        AndroidLink = "."
      }
      if (IosAppLink) {
        iosLink = IosAppLink
      }
      else {
        iosLink = "."
      }
      if (websitelink) {
        webLink = websitelink
      }
      else {
        webLink = "."
      }

      // if (package) {
      //   packageName = package.name
      // } else {
      //   packageName = "No Package Selected"
      // }
      if (booking.convenience) {
        convenience = booking.convenience
      } else {
        convenience = "No Convenience"
      }
      if (address) {
        addressFound = address.address
      } else {
        // console.log("Addresss not found")
        addressFound = "No address entered"
      }

      if (booking.time_slot) {
        time_slot = booking.time_slot
      } else {
        time_slot = "No Time Slot Selected"
      }
      console.log("Booking Date = " + booking.date.toDateString())
      console.log("Channel Name  = " + getChannel.name)
      console.log("advisor.name  = " + advisor.name)
      console.log("addressFound  = " + addressFound)
      console.log("webLink  = " + webLink.toString())
      console.log("AndroidLink.toString()  = " + AndroidLink.toString())
      console.log("iosLink.toString()  = " + iosLink.toString())

      var params = {
        'to': '+91' + booking.user.contact_no,
        'channelId': channelId,
        'type': 'hsm',
        content: {
          'hsm': {
            'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
            'templateName': "booking",
            'language': {
              'policy': 'deterministic',
              'code': 'en'
            },
            params: [
              { default: booking.user.name.toString() },
              { default: booking.booking_no.toString() },
              { default: convenience.toString() },
              { default: booking.date.toDateString() },
              { default: time_slot.toString() },
              { default: booking.car.title.toString() },
              { default: booking.car.registration_no.toString() },
              { default: getChannel.name },
              { default: advisor.name },
              { default: "Advisor" },
              { default: addressFound },
              { default: addressFound },
              { default: webLink.toString() },
              { default: AndroidLink.toString() },
              { default: iosLink.toString() },

            ]
          }
        }
      }
      console.log("params = " + JSON.stringify(params, null, '\t'))
      await messageBird.conversations.start(params, function (err, response) {
        if (err) {
          console.log("err= " + err);
        }
        console.log("Res= " + response);
      });
    }
  },


  referralWhatsAppEventAgent: async (name, phone) => {
    // console.log("ID and phone...", name, phone)


    var params = {
      'to': '+91' + phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "referral_added",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: name.toString() }
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
  },

  referralWhatsAppEventUser: async (name, phone) => {
    // console.log("ID and phone...", name, phone)


    var params = {
      'to': '+91' + phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "refer_earn",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: name.toString() }
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
  },

  //not in use (replaced)..
  carReady: async (phone, carId, business) => {
    // console.log("ID and phone...", phone)
    var getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    var channelId = getChannel.whatsAppChannelId
    let car = await Car.findOne({ _id: mongoose.Types.ObjectId(carId) }).exec()

    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "car_ready",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: car.registration_no.toString() },
            { default: car.title.toString() }
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
  },

  //repalced "surveyor_assigned"
  sendEstimate: async (phone, carId, business) => {
    // console.log("ID and phone...", phone)
    var getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    var channelId = getChannel.whatsAppChannelId;
    let car = await Car.findOne({ _id: mongoose.Types.ObjectId(carId) }).exec()
    var appLink = undefined;



    if (getChannel.socialite.androidAppLink) {
      // console.log("in if...");
      appLink = getChannel.socialite.androidAppLink;
    }
    else {
      appLink = "."
    }

    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "sendestimate",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: car.title.toString() },
            { default: car.registration_no.toString() },
            { default: appLink.toString() },

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
  },


  insuranceClaimIntimated: async (phone, carId, business) => {
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId
    // console.log("ID and phone...", phone)
    let car = await Car.findOne({ _id: mongoose.Types.ObjectId(carId) }).exec()


    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "claim_intimated",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: car.title.toString() }
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
  },


  jobApproval: async (phone, carId) => {


    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "job_approval",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: car.title.toString() }
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
  },


  //fixed by sumit:)
  insuranceSurveyor: async (phone, carId, business) => {
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId
    // console.log("phone and ID...", phone, carId)
    let car = await Car.findOne({ _id: mongoose.Types.ObjectId(carId) }).exec()


    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "insurance_surveyor",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: car.title.toString() }
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
  },


  //recently not in use...
  // qcUpdate: async ( phone, carId) => {
  // console.log("ID and phone...", phone)

  //   var params = {
  //     'to': '+91'+phone,
  //     'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
  //     'type': 'hsm',
  //     content: {
  //     'hsm': {
  //       'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
  //       'templateName': "qc_update",
  //       'language': {
  //         'policy': 'deterministic',
  //         'code': 'en'
  //       },
  //     }
  //     }
  //   }

  //   await messageBird.conversations.start(params, function (err, response) {
  //     if (err) {
  //       return // console.log(err);
  //     }
  //     // console.log(response);
  //   });
  // },


  //sumit...
  serviceComplete: async (phone, business) => {
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId
    // console.log("ID and phone...", phone)

    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "service_completed",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
        }
      }
    }

    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return // console.log(err);
      }
      // console.log(response);
    });
  },

  // newPackage: async (phone, business) => {
  // console.log("ID and phone...", phone)



  //   var params = {
  //     'to': '+91' + phone,
  //     'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
  //     'type': 'hsm',
  //     content: {
  //       'hsm': {
  //         'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
  //         'templateName': "qc_update",
  //         'language': {
  //           'policy': 'deterministic',
  //           'code': 'en'
  //         },
  //       }
  //     }
  //   }

  //   await messageBird.conversations.start(params, function (err, response) {
  //     if (err) {
  //       return // console.log(err);
  //     }
  //     // console.log(response);
  //   });
  // },


  payment_received: async (phone, carId) => {
    // console.log("ID and phone...", phone)



    let car = await Car.findOne({ _id: mongoose.Types.ObjectId(carId) }).exec()

    var params = {
      'to': '+91' + phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "payment_received",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: car.title.toString() }
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
  },


  agentRegister: async (phone, referral_code) => {
    // console.log("ID and phone...", phone)
    let agentCode = referral_code

    var params = {
      'to': '+91' + phone,
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "agent_registration",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: "10%" },
            { default: "1-Year" },
            { default: agentCode.toString() }
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
  },

  //TODO : updated by sumit..
  //replaced template..
  jobInit: async (b) => {
    // console.log("ID and phone...", b)
    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(b._id) }).exec()
    let jobUser = await User.findOne({ _id: mongoose.Types.ObjectId(b.user) }).exec()
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(b.business) }).exec()

    // .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' }).exec()
    let channelId = getChannel.whatsAppChannelId
    let AndroidAppLink = getChannel.socialite.androidAppLink;
    let IosAppLink = getChannel.socialite.iosAppLink;
    var AndroidLink = undefined;
    var iosLink = undefined;


    // console.log("****** " + applink);
    if (AndroidAppLink) {
      AndroidLink = AndroidAppLink
    } else {
      AndroidLink = "."
    }
    if (IosAppLink) {
      iosLink = IosAppLink
    }
    else {
      iosLink = "."
    }
    let car = await Car.findOne({ _id: mongoose.Types.ObjectId(b.car) }).exec()

    var params = {
      'to': '+91' + jobUser.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "jobinit",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: car.title.toString() },
            { default: car.registration_no.toString() },
            { default: booking.booking_no.toString() },
            { default: AndroidLink.toString() },
            { default: iosLink.toString() },
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
  },

  invoiceGenerate: async (phone, totalAmount, business) => {
    // console.log("ID and phone...", phone)
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId

    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "invoice",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: totalAmount.toString() }
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
  },

  estimateApproval: async (phone, car, business) => {
    // console.log("ID and phone...", phone)
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId
    let getCar = await Car.findOne({ _id: mongoose.Types.ObjectId(car) }).exec()

    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "surveyor_assigned",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: getCar.title.toString() },
            { default: getCar.registration_no.toString() }
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
  },


  testingWhats: async () => {

    let hsmTemplate = {
      "default": "CarEager",
      "default": "id",
      "default": "assignee",
      "default": "date",
      "default": "time"
    }


    var params = {
      'to': '+91' + "7895933824",
      'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "query_autoreply",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: hsmTemplate,
        }
      }
    }
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return // console.log(err);
      }
      // console.log(response);
    });




  },
  // Business Registration made by sumit...
  autroidBusinessReg: async (name, phone) => {
    //let getChannel = await User.findOne({_id: mongoose.Types.ObjectId(business)})
    // let channelId = getChannel.whatsAppChannelId
    // console.log("ID ", channelId)


    var params = {
      'to': '+91' + phone,
      'channelId': "4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2",
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "new_business_reg",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [

            { default: name.toString() },
            { default: phone.toString() }
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
  },


  //WelcomeOnBoarding made by sumit :)

  welOnBoard: async (id, phone) => {
    // let getChannel = await User.findOne({_id: mongoose.Types.ObjectId(business)}).exec()
    // let channelId = getChannel.whatsAppChannelId

    // console.log("ID and phone...", id, phone)


    var params = {
      'to': '+91' + phone,
      'channelId': "4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2",
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "welcome_on_board",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [

            { default: phone.toString() },

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
  },
  // maade by sumit ...
  workStart: async (phone, carId, business) => {
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId

    // console.log("ID and phone...", phone, carId)

    let car = await Car.findOne({ _id: mongoose.Types.ObjectId(carId) }).exec()

    var params = {
      'to': '+91' + phone,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "work_started",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: car.registration_no.toString() },
            { default: car.title.toString() }
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

  },

  // made by sumit...
  bookingCancel: async (id, business) => {
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId

    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info' })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .populate({ path: 'car', select: 'registration_no title' }).exec()




    var params = {
      'to': '+91' + booking.user.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "bookcan",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [


            { default: booking.business.name },
            { default: booking.booking_no.toString() },
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
  },




  //made by sumit..

  paymentDone: async (id, amount, business) => {
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId

    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })

      .populate({ path: 'user', select: 'name contact_no address _id' }).exec()

    // console.log("ID and phone...", amount)


    var params = {
      'to': '+91' + booking.user.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "payment",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: amount.toString() }
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
  },

  // made by sumit :)


  newPack: async (id, package, packageCost, business) => {


    var booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
      .populate({ path: 'business', populate: { path: 'user', select: "_id id name contact_no email" } })

      .populate({ path: 'car', select: '_id id title registration_no fuel_type' })

      .exec();
    // console.log("----" + business);

    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId


    var params = {
      'to': '+91' + booking.user.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "newpack",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: booking.user.name.toString() },
            { default: booking.car.title.toString() },
            { default: booking.car.registration_no.toString() },
            { default: package.toString() },
            { default: packageCost.toString() },
            { default: booking.business.name },
            { default: booking.business.contact_no },



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
  },

  // made by sumit but not working..

  // insuranceReminder : async () => {

  //   var params = {
  //     'to': '+91'+booking.user.contact_no,
  //     'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
  //     'type': 'hsm',
  //     content: {
  //     'hsm': {
  //       'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
  //       'templateName': "insurance",
  //       'language': {
  //         'policy': 'deterministic',
  //         'code': 'en'
  //       },
  //       params:[



  //       ]
  //     }
  //     }
  //   }

  //   await messageBird.conversations.start(params, function (err, response) {
  //     if (err) {
  //       return // console.log(err);
  //     }
  //     // console.log(response);
  //   });
  // },







  //made by sumit.
  leadCre: async (leadId, business) => {
    // let assigneeUser = await User.findOne({_id: mongoose.Types.ObjectId(assignee)}).exec()
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId;
    let getPhone = getChannel.contact_no;

    let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(leadId) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
      .populate({ path: 'assignee', select: 'name contact_no' }).exec()

    var name = "Name Not Found";
    if (lead.name) {
      name = lead.name
    }
    var source = "website"
    if (lead.source) {
      source = lead.source
    }
    // console.log("Name  = " + name)
    // console.log("source=" + source)
    // console.log("lead.contact_no= " + lead.contact_no)

    // console.log(lead.assignee.contact_no);
    var params = {
      'to': '+91' + lead.assignee.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "leadcreat",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [

            { default: source.toString() },
            { default: name.toString() },
            { default: lead.contact_no.toString() },

          ]
        }
      }
    }

    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        // return  // console.log(err);
      }
      // console.log(response);
    });
  },

  whatsappLeadCre: async (leadId, business) => {


    // let assigneeUser = await User.findOne({_id: mongoose.Types.ObjectId(assignee)}).exec()
    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId;
    // let getPhone = getChannel.contact_no;

    let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(leadId) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
      .populate({ path: 'assignee', select: 'name contact_no' }).exec()

    var name = "Name Not Found";
    if (lead.name) {
      name = lead.name
    }


    // console.log("leasfdsfds" + lead.assignee.contact_no);
    // console.log(lead.remark.pickup_date);
    // console.log(lead.remark.pickup_address);
    var params = {
      'to': '+91' + lead.assignee.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "whatsapp_cre",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [


            { default: name.toString() },
            { default: lead.contact_no.toString() },
            { default: lead.source.toString() },
            { default: lead.remark.pickup_date.toString() },
            { default: lead.remark.pickup_address.toString() },



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


  },








  //sumit..
  changePlan: async (plan, planName, businessPhone) => {
    var params = {
      'to': '+91' + businessPhone,
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "changeplan",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [

            { default: plan.toString() },
            { default: planName.toString() },

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
  },
  //sumit....
  employeeWel: async (userContactNo, business) => {

    var businessName = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();

    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId;




    var params = {
      'to': '+91' + userContactNo,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "newemployee",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [

            { default: businessName.name.toString() },
            { default: userContactNo.toString() },

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
  },


  estiamteBooking: async (id, business) => {


    var businessName = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();

    let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
    let channelId = getChannel.whatsAppChannelId;

    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info' })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .populate({ path: 'car', select: 'registration_no title' })
      .exec()

    // console.log(booking);

    let advisor = await User.findOne({ _id: mongoose.Types.ObjectId(booking.advisor) }).exec()
    let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(booking.lead) })
      .populate({ path: 'assignee', select: 'name' })
      .exec()
    var assigneeName = lead.assignee.name;
    // console.log(assigneeName);



    var params = {
      'to': '+91' + advisor.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "estiamtebooking",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [

            { default: booking.user.name.toString() },
            { default: booking.car.title.toString() },
            { default: booking.car.registration_no.toString() },
            { default: assigneeName.toString() },
            { default: advisor.name.toString() },

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




  },










  /* 
  confirmBooking: async (id ,business) => {
    
    
          var businessName = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
      
          let getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec()
          let channelId = getChannel.whatsAppChannelId;
    
          let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
          .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info' })
          .populate({ path: 'user', select: 'name contact_no address _id' })
          .populate({ path: 'car', select: 'registration_no title' })
          .exec()
    
          
          let advisor = await User.findOne({ _id: mongoose.Types.ObjectId(booking.advisor) }).exec()
         let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(booking.lead) })
         .populate({ path: 'assignee', select: 'name' })
         .exec()
        // console.log( "fdsdffdgfdg"+lead.assignee.name);
          // console.log(manager);
    
      
          var params = {
            'to': '+91' + advisor.contact_no,
            'channelId': channelId,
            'type': 'hsm',
            content: {
              'hsm': {
                'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
                'templateName': "bookingconfirm",
                'language': {
                  'policy': 'deterministic',
                  'code': 'en'
                },
                params: [
      
                  { default: booking.user.name.toString() },
                  { default: booking.car.title.toString() },
                  { default:booking.car.registration_no.toString() },
                  { default: lead.assignee.name.toString() },
                  { default: advisor.name.toString() },
      
                ]
              }
            }
          }
      
          await messageBird.conversations.start(params, function (err, response) {
            if (err) {
              return  // console.log(err);
            }
             // console.log(response);
          });
    
    
    
    
        }, */


  //sumit.


  newBookingAdvisor: async (id) => {


    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .populate({ path: 'car', select: 'registration_no title' })
      .exec()


    var getChannel = await User.findOne({ _id: mongoose.Types.ObjectId(booking.business) }).exec()
    let channelId = getChannel.whatsAppChannelId;




    let advisor = await User.findOne({ _id: mongoose.Types.ObjectId(booking.advisor) }).exec()
    let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(booking.lead) })
      .populate({ path: 'assignee', select: 'name' })
      .exec()
    // console.log("fdsdffdgfdg" + lead.assignee.name);
    //  // console.log(manager);
    //var assigneeName = lead.assignee.name,

    var assigneeName = 'Not Found Assignee'
    if (lead) {


      if (lead.assignee.name == null) {

        assigneeName = 'Not Found Assignee'
      }
      else {
        assigneeName = lead.assignee.name
      }
    }

    var params = {
      'to': '+91' + advisor.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "newbooking",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },
          params: [

            { default: booking.user.name.toString() },
            { default: booking.car.title.toString() },
            { default: booking.car.registration_no.toString() },
            { default: assigneeName.toString() },
            { default: advisor.name.toString() },

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












  },



  customerBookingRemnder: async (id) => {

    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .populate({ path: 'car', select: 'registration_no title' })
      .exec()

    let advisor = await User.findOne({ _id: mongoose.Types.ObjectId(booking.advisor) }).exec()
    let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(booking.lead) })
      .populate({ path: 'assignee', select: 'name contact_no' })
      .exec()
    var channelId = booking.business.whatsAppChannelId;
    //  // console.log(booking.date.toString());
    //  // console.log( booking.time_slot);
    //  // console.log(booking.convenience);
    //  // console.log(booking.car.title);
    //  // console.log(booking.car.registration_no);
    //  // console.log(advisor.name, advisor.contact_no);
    //  // console.log(lead.assignee.name, lead.assignee.contact_no);

    var params = {
      'to': '+91' + booking.user.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "customremin",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },

          params: [

            { default: booking.date.toDateString() },
            { default: booking.time_slot.toString() },
            { default: booking.convenience.toString() },
            { default: booking.car.title.toString() },
            { default: booking.car.registration_no.toString() },

            { default: booking.business.name.toString() },
            { default: booking.business.contact_no.toString() },
            { default: lead.assignee.name.toString() },
            { default: lead.assignee.contact_no.toString() },

            { default: advisor.name.toString() },
            { default: advisor.contact_no.toString() },

          ]


        }
      }
    }

    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        //return  // console.log(err);
      }
      // console.log(response);
    });



  },


  //sumit....reminder for tommorrow

  advisorBookingReminder: async (id) => {

    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .populate({ path: 'car', select: 'registration_no title' })
      .exec()

    let advisor = await User.findOne({ _id: mongoose.Types.ObjectId(booking.advisor) }).exec()

    var channelId = booking.business.whatsAppChannelId;



    // var day ='today';




    var params = {
      'to': '+91' + advisor.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "advisorbookremin",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },

          params: [


            { default: booking.convenience.toString() },
            { default: booking.car.title.toString() },
            { default: booking.user.name },
            { default: booking.user.contact_no },
            { default: booking.convenience.toString() },
            { default: booking.time_slot.toString() },



          ]


        }
      }
    }

    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        //return  // console.log(err);
      }
      // console.log(response);
    });



  },



  //sumit.. for today...
  advisorBookingReminderToday: async (id) => {

    let booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .populate({ path: 'car', select: 'registration_no title' })
      .exec()

    let advisor = await User.findOne({ _id: mongoose.Types.ObjectId(booking.advisor) }).exec()

    var channelId = booking.business.whatsAppChannelId;



    var day = 'today';




    var params = {
      'to': '+91' + advisor.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "testadvisor",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },

          params: [

            { default: day.toString() },
            { default: booking.convenience.toString() },
            { default: booking.car.title.toString() },
            { default: booking.user.name },
            { default: booking.user.contact_no },
            { default: booking.convenience.toString() },
            { default: booking.time_slot.toString() },



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



  },

  FollowUpReminder: async (id) => {
    let lead = await Lead.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
      .populate({ path: 'assignee', select: 'name contact_no' })
      .populate({ path: 'car', select: 'title' })
      .exec()
    var channelId = lead.business.whatsAppChannelId;

    var cartitle = undefined;

    if (lead.car == null) {

      cartitle = "Car not found"
    }

    else {
      cartitle = lead.car.title;
    }

    // console.log("dfdgdggfdgf" + lead.assignee.contact_no);

    var params = {
      'to': '+91' + lead.assignee.contact_no,
      'channelId': channelId,
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': "followupremin",
          'language': {
            'policy': 'deterministic',
            'code': 'en'
          },

          params: [
            { default: cartitle.toString() },
            { default: lead.name.toString() },
            { default: lead.contact_no.toString() },
            { default: lead.source.toString() },




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

  },






  qrCodeWhatsApp: async (userBooking, business) => {
    var business = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
    // var user = await  User.findOne({_id:mongoose.Types.ObjectId(userBooking) })
    // .populate({ path: 'user', select: 'name contact_no address _id' })
    // .exec();

    console.log('ssss')
    // var params = {
    //   'to': '+919717837769',// + userBooking.contact_no,
    //   'type': 'hsm',
    //   'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
    //   'content': {
    //     'hsm': {
    //       'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
    //       'templateName': 'payment_link',
    //       'language': {
    //         'policy': 'deterministic',
    //         'code': 'en'
    //       },
    //       'components': [
    //         {
    //           'type': 'header',
    //           'parameters': [
    //             {
    //               'type': 'image',
    //               'image': {
    //                 'url': 'https://i.ibb.co/kBf4NDN/QrCode.png',
    //                 'caption': 'Qr.png'
    //               }
    //             }
    //           ]
    //         },
    //         {
    //           'type': 'body',
    //           'parameters': [
    //             {
    //               'type': 'text',
    //               'text': business.name
    //             },
    //             {
    //               'type': 'text',
    //               'text': business.bank_details[0].bank
    //             },
    //             {
    //               'type': 'text',
    //               'text': business.bank_details[0].account_no
    //             },
    //             {
    //               'type': 'text',
    //               'text': business.bank_details[0].ifsc
    //             },
    //             {
    //               'type': 'text',
    //               'text': business.bank_details[0].upi_id
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   }
    // }
    var params = {
      'to': '+919717837769',
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
                  "type": "image",
                  "image": {

                    'url': `https://i.ibb.co/kBf4NDN/QrCode.png`,
                    //'url' : 'https://careager.s3.ap-south-1.amazonaws.com/whatsappMediaChats/5_6163500974267696247.docx',

                    "caption": `shared by Ruchi`,
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
        return console.log(err);
      }
      console.log(response);
    });






  },







  // paymentReqWhatsApp : async()=>{
  //   //var business = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
  //   // var user = await  User.findOne({_id:mongoose.Types.ObjectId(userBooking) })
  //   // .populate({ path: 'user', select: 'name contact_no address _id' })
  //   // .exec();


  //   var params = {
  //     "to": "+919717837769",
  //     "type": "hsm",
  //     "channelId": "fe7defba13134d3d81498f5c8f8f0aa8",
  //     "content": {
  //       "hsm": {
  //         "namespace": "d16e5071_32b4_4f26_9168_869b57db0a90",
  //         "templateName": "payment_request",
  //         "language": {
  //           "policy": "deterministic",
  //           "code": "en"
  //         },
  //         "components": [
  //           {
  //             "type": "header",
  //             "parameters": [
  //               {
  //                 "type": "image",
  //                 "image": {
  //                   "url": "https://i.ibb.co/DfPwb5W/google-pay.jpg",
  //                   "caption": "Qr.png"
  //                 }
  //               }
  //             ]
  //           },
  //           {
  //             "type": "body",
  //             "parameters": [
  //               {
  //                 "type": "text",
  //                 "text": "CarEager"
  //               },
  //               {
  //                 "type": "text",
  //                 "text": "11800"
  //               },
  //               {
  //                 "type": "text",
  //                 "text": "HDFC Bank Limited"
  //               },
  //               {
  //                 "type": "text",
  //                 "text": "1354671823243"
  //               },
  //               {
  //                 "type": "text",
  //                 "text": "HDFC234343"
  //               },
  //               {
  //                 "type": "text",
  //                 "text": "manan@okhdfcbank"
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   }

  //   await messageBird.conversations.start(params, function (err, response) {
  //     if (err) {
  //       return // console.log(err);
  //     }
  //     // console.log(response);
  //   });
  // },



  statmentSend: async (user, business) => {
    var businessDetails = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
    var userDetails = await User.findOne({ _id: mongoose.Types.ObjectId(user) })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .exec();
    var channelId = businessDetails.whatsAppChannelId;

    // console.log("SSSS" + userDetails.contact_no);
    var params = {
      'to': '+91' + userDetails.contact_no,
      'type': 'hsm',
      'channelId': channelId,
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
                    'url': `${userDetails.business_info.party_statements}`,
                    //'url' :'https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/RizeBear+Distribution+Private+Limited.pdf',
                    "caption": `${userDetails.name}.pdf`,
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
                  'text': userDetails.name,
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



  },


  //invoice send.
  invoiceSend: async (user, invoice, business) => {
    var businessDetails = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
    var userDetails = await User.findOne({ _id: mongoose.Types.ObjectId(user) })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .exec();
    // console.log("iinvvv" + invoice);
    // console.log("invv2" + invoice.invoice_url);

    var due = invoice.due.due.toLocaleString();
    var url = invoice.invoice_url;
    // console.log("url" + url);

    var channelId = businessDetails.whatsAppChannelId;

    var carDetail = await Invoice.findOne({ car: mongoose.Types.ObjectId(invoice.car) })
      .populate({ path: 'car', select: 'title registration_no' })
      .exec();
    // console.log("car" + car);
    var caption = carDetail.car.registration_no;
    // console.log(caption);

    var params = {
      'to': "+91" + userDetails.contact_no,
      'type': 'hsm',
      'channelId': channelId,//'fe7defba13134d3d81498f5c8f8f0aa8',
      'content': {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'invoice_doc',//'invoice_doc',
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
                    'url': `${url}`,
                    "caption": `${caption}`
                  }
                }
              ]
            },
            {
              "type": "body",
              'parameters': [
                {
                  'type': 'text',
                  'text': `${due}`,
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



  },



  performaSendWhatsapp: async (b, business) => {
    var businessDetails = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
    var booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(b) })

      .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
      .populate({ path: 'car', select: '_id id title registration_no fuel_type vin engine_no' })
      .exec();



    var due = booking.due.due.toLocaleString();
    var url = booking.performa_url;

    // console.log(url);
    var channelId = businessDetails.whatsAppChannelId;


    var title = booking.car.title;
    var caption = booking.car.registration_no;
    // console.log(caption);

    var params = {
      'to': "+91" + booking.user.contact_no,
      'type': 'hsm',
      'channelId': channelId,//'fe7defba13134d3d81498f5c8f8f0aa8',
      'content': {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'performa_doc',//'invoice_doc',
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
                    // "url": 'http://www.africau.edu/images/default/sample.pdf',
                    'url': `${url}`,
                    // 'url' :'https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/RizeBear+Distribution+Private+Limited.pdf',
                    "caption": `${caption}`
                  }
                }
              ]
            },
            {
              "type": "body",
              'parameters': [
                {
                  'type': 'text',
                  'text': `${title}`,


                },

                {
                  'type': 'text',
                  'text': `${due}`,

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



  },



  partsRequest: async (vendorId, business) => {

    var seller = await VendorOrders.findOne({ _id: mongoose.Types.ObjectId(vendorId) })
      .populate({ path: 'vendor', select: 'name avatar avatar_address contact_no  business_info optional_info' })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no  business_info optional_info' })
      .exec()



    var storeCount = await Management.find({ role: 'Store Manager', business: seller.vendor }).count();

    var link = `https://business.autroid.com/sales/quotation/${vendorId}`;
    var appLink = 'https://play.google.com/store/apps/details?id=com.vmt.autroid';




    var phone = '';
    // var day ='today';

    var number = seller.vendor.contact_no

    if (number == '18008434300') {
      phone = seller.vendor.optional_info.alternate_no

      // console.log("in ifffff");
    }
    else {
      phone = number;
      // console.log("in elsee");
    }


    // console.log("SSSSPP" + phone);





    //for storeAdmi
    if (storeCount !== 0) {

      var storeAdmin = await Management.findOne({ role: 'Store Manager', business: seller.vendor })
        .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()
      var params = {
        'to': '+91' + storeAdmin.user.contact_no,
        'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
        'type': 'hsm',
        content: {
          'hsm': {
            'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
            'templateName': 'partslink',
            'language': {

              'policy': 'deterministic',
              'code': 'en'
            },

            params: [


              { default: seller.business.name.toString() },
              { default: appLink.toString() },
              { default: link.toString() },




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




    //for admin...

    var params = {
      'to': '+91' + phone,
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'partslink',
          'language': {

            'policy': 'deterministic',
            'code': 'en'
          },

          params: [


            { default: seller.business.name.toString() },
            { default: appLink.toString() },
            { default: link.toString() },




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





  },



  qutationReq: async (vendorId, business) => {

    var relatedbusiness = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
    var vendor = await User.findOne({ _id: mongoose.Types.ObjectId(vendorId) })
      .populate({ path: 'user', select: 'name contact_no address _id' })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no isCarEager uuid business_info whatsAppChannelId' })
      .exec()

    var storeCount = await Management.find({ role: 'Store Manager', business: business }).count();



    // console.log("dsdfds" + relatedbusiness.contact_no);

    var link = 'https://business.autroid.com/';
    var appLink = 'https://play.google.com/store/apps/details?id=com.vmt.autroid';


    var phone = undefined;
    // var day ='today';
    var number = relatedbusiness.contact_no;


    if (number == '18008434300') {
      phone = relatedbusiness.optional_info.alternate_no

      // console.log("in ifffff");
    } else {
      phone = number;
      // console.log("in elsee");
    }

    // console.log("SSSSPP" + phone);




    var params = {
      'to': '+91' + phone,//+'+9199448276',//+vendor.contact_no,//9717837769' ,
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'qutationmsg',
          'language': {

            'policy': 'deterministic',
            'code': 'en'
          },

          params: [


            { default: vendor.name.toString() },
            { default: appLink.toString() },
            { default: link.toString() },





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


    //for Storeboy..

    if (storeCount !== 0) {
      var storeAdmin = await Management.findOne({ role: 'Store Manager', business: business })
        .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

      var params = {
        'to': '+91' + storeAdmin.user.contact_no,//+'+9199448276',//+vendor.contact_no,//9717837769' ,
        'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
        'type': 'hsm',
        content: {
          'hsm': {
            'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
            'templateName': 'qutationmsg',
            'language': {

              'policy': 'deterministic',
              'code': 'en'
            },

            params: [


              { default: vendor.name.toString() },
              { default: appLink.toString() },
              { default: link.toString() },





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

  },







  // newParts: async (id) => {
  //   var seller = await VendorOrders.findOne({ _id: mongoose.Types.ObjectId(id) })
  //     .populate({ path: 'vendor', select: 'name avatar avatar_address contact_no  business_info optional_info' })
  //     .populate({ path: 'business', select: 'name avatar avatar_address contact_no address whatsAppChannelId' })
  //     .exec()
  //   var storeAdmin = await Management.findOne({ role: 'Store Manager', business: seller.vendor })
  //     .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()
  //   var storeCount = await Management.find({ role: 'Store Manager', business: seller.vendor }).count()
  //   var city = seller.business.address.city;
  //   var orderId = seller.order_no;
  //   var amount = seller.total_amount.toFixed();
  //   if (storeAdmin) {
  //     var link = "wa.me/" + storeAdmin.user.contact_no;
  //   }

  //   var phone = undefined;
  //   // var day ='today';
  //   var number = seller.vendor.contact_no;


  //   if (number == '18008434300') {
  //     phone = seller.vendor.optional_info.alternate_no

  //     // console.log("in ifffff");
  //   } else {
  //     phone = number;
  //     // console.log("in elsee");
  //   }
  //   //store..
  //   if (storeCount !== 0) {
  //     var params = {
  //       'to': '+91' + storeAdmin.user.contact_no,//+vendor.contact_no,//9717837769' ,
  //       'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
  //       'type': 'hsm',
  //       content: {
  //         'hsm': {
  //           'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
  //           'templateName': 'neworder',
  //           'language': {

  //             'policy': 'deterministic',
  //             'code': 'en'
  //           },
  //           params: [
  //             { default: seller.business.name.toString() },
  //             { default: orderId.toString() },
  //             { default: amount.toLocaleString() },
  //             { default: city.toString() },
  //             { default: storeAdmin.user.name.toString() },
  //             { default: storeAdmin.user.contact_no.toString() },
  //             { default: link.toString() },
  //           ]
  //         }
  //       }
  //     }

  //     await messageBird.conversations.start(params, function (err, response) {
  //       if (err) {
  //         return // console.log(err);
  //       }
  //       // console.log(response);
  //     });

  //   }
  //   var params = {
  //     'to': '+91' + phone,//+vendor.contact_no,//9717837769' ,
  //     'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
  //     'type': 'hsm',
  //     content: {
  //       'hsm': {
  //         'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
  //         'templateName': 'neworder',
  //         'language': {

  //           'policy': 'deterministic',
  //           'code': 'en'
  //         },
  //         params: [
  //           { default: seller.business.name.toString() },
  //           { default: orderId.toString() },
  //           { default: amount.toLocaleString() },
  //           { default: city.toString() },
  //           { default: storeAdmin.user.name.toString() },
  //           { default: storeAdmin.user.contact_no.toString() },
  //           { default: link.toString() },
  //         ]
  //       }
  //     }
  //   }
  //   await messageBird.conversations.start(params, function (err, response) {
  //     if (err) {
  //       return // console.log(err);
  //     }
  //     // console.log(response);
  //   });
  // },


  newParts: async (id) => {


    var seller = await VendorOrders.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'vendor', select: 'name avatar avatar_address contact_no  business_info optional_info' })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no address whatsAppChannelId' })
      .exec()

    var storeAdmin = await Management.findOne({ role: 'Store Manager', business: seller.vendor })
      .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()


    var storeCount = await Management.find({ role: 'Store Manager', business: seller.vendor }).count()

    var city = seller.business.address.city;
    var orderId = seller.order_no;
    var amount = seller.total_amount.toFixed();



    var phone = undefined;
    // var day ='today';
    var number = seller.vendor.contact_no;


    if (number == '18008434300') {
      phone = seller.vendor.optional_info.alternate_no

      //  console.log("in ifffff");
    } else {
      phone = number;

    }

    if (storeAdmin) {
      var link = "wa.me/" + storeAdmin.user.contact_no
      var storeBoyName = storeAdmin.user.name
      var storePhone = storeAdmin.user.contact_no
    }
    else {
      link = "wa.me/" + phone
      storeBoyName = 'Name not found'
      storePhone = 'Not Found'
    }

    //store..
    if (storeCount !== 0) {
      var params = {
        'to': '+91' + storeAdmin.user.contact_no,//+vendor.contact_no,//9717837769' ,
        'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
        'type': 'hsm',
        content: {
          'hsm': {
            'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
            'templateName': 'neworder',
            'language': {

              'policy': 'deterministic',
              'code': 'en'
            },
            params: [

              { default: seller.business.name.toString() },
              { default: orderId.toString() },
              { default: amount.toLocaleString() },
              { default: city.toString() },
              { default: storeBoyName.toString() },
              { default: storePhone.toString() },
              { default: link.toString() },

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
    var params = {
      'to': '+91' + phone,//+vendor.contact_no,//9717837769' ,
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'neworder',
          'language': {

            'policy': 'deterministic',
            'code': 'en'
          },

          params: [

            { default: seller.business.name.toString() },
            { default: orderId.toString() },
            { default: amount.toLocaleString() },
            { default: city.toString() },
            { default: storeBoyName.toString() },
            { default: storePhone.toString() },
            { default: link.toString() },
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
  },




  orderDeliverd: async (id, orderId, userId) => {

    var seller = await User.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();


    var storeCount = await Management.find({ role: 'Store Manager', business: userId }).count()
    var user = await User.findOne({ _id: mongoose.Types.ObjectId(userId) }).exec();

    var phone = undefined;
    // var day ='today';
    var number = user.contact_no;


    if (number == '18008434300') {
      phone = user.optional_info.alternate_no


    } else {
      phone = number;

    }
    // console.log(user.name);


    var params = {
      'to': '+91' + phone,
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'orderdeli',
          'language': {

            'policy': 'deterministic',
            'code': 'en'
          },

          params: [

            { default: seller.name.toString() },
            { default: orderId.toString() },

          ]

        }
      }
    }

    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      //console.log(response);
    });

    //for store boy
    if (storeCount !== 0) {
      var storeAdmin = await Management.findOne({ role: 'Store Manager', business: userId })
        .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

      var params = {
        'to': '+91' + storeAdmin.user.contact_no,
        'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
        'type': 'hsm',
        content: {
          'hsm': {
            'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
            'templateName': 'orderdeli',
            'language': {

              'policy': 'deterministic',
              'code': 'en'
            },

            params: [


              { default: seller.name.toString() },
              { default: orderId.toString() },

            ]


          }
        }
      }
      await messageBird.conversations.start(params, function (err, response) {
        if (err) {
          return console.log(err);
        }
        // console.log(response);
      });

    }



  },






  orderCancel: async (businessId, userId, orderId) => {

    var business = await User.findOne({ _id: mongoose.Types.ObjectId(businessId) }).exec();


    var user = await User.findOne({ _id: mongoose.Types.ObjectId(userId) }).exec();

    var storeCount = await Management.find({ role: 'Store Manager', business: userId }).count();

    var phone = undefined;
    // var day ='today';
    var number = user.contact_no;


    if (number == '18008434300') {
      phone = user.optional_info.alternate_no


    } else {
      phone = number;

    }
    // console.log(user.name);


    var params = {
      'to': '+91' + phone,
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'cancelorder',
          'language': {

            'policy': 'deterministic',
            'code': 'en'
          },

          params: [


            { default: business.name.toString() },
            { default: orderId.toString() },






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

    //for store boy
    if (storeCount !== 0) {
      // console.log("in if");
      var storeAdmin = await Management.findOne({ role: 'Store Manager', business: userId })
        .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()

      var params = {
        'to': '+91' + storeAdmin.user.contact_no,
        'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
        'type': 'hsm',
        content: {
          'hsm': {
            'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
            'templateName': 'cancelorder',
            'language': {

              'policy': 'deterministic',
              'code': 'en'
            },

            params: [


              { default: business.name.toString() },
              { default: orderId.toString() },






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




  },







  // orderPurchase: async (id) => {
  //   var seller = await VendorOrders.findOne({ _id: mongoose.Types.ObjectId(id) })
  //     .populate({ path: 'vendor', select: 'name avatar avatar_address contact_no  business_info optional_info' })
  //     .populate({ path: 'business', select: 'name avatar avatar_address contact_no address whatsAppChannelId' })
  //     .exec()


  //   var storeAdmin = await Management.findOne({ role: 'Store Manager', business: seller.vendor })
  //     .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()




  //   var storeCount = await Management.find({ role: 'Store Manager', business: seller.vendor }).count()

  //   var city = seller.business.address.city;
  //   var orderId = seller.order_no;
  //   var amount = seller.total_amount.toFixed();
  //   var link = "wa.me/" + storeAdmin.user.contact_no;





  //   var phone = undefined;
  //   // var day ='today';
  //   var number = seller.vendor.contact_no;


  //   if (number == '18008434300') {
  //     phone = seller.vendor.optional_info.alternate_no

  //     // console.log("in ifffff");
  //   } else {
  //     phone = number;
  //     // console.log("in elsee");
  //   }








  //   //store..
  //   if (storeCount !== 0) {


  //     var params = {
  //       'to': '+91' + storeAdmin.user.contact_no,//+vendor.contact_no,//9717837769' ,
  //       'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
  //       'type': 'hsm',
  //       content: {
  //         'hsm': {
  //           'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
  //           'templateName': 'purchaseorder',
  //           'language': {

  //             'policy': 'deterministic',
  //             'code': 'en'
  //           },

  //           params: [


  //             { default: seller.business.name.toString() },
  //             { default: orderId.toString() },
  //             { default: amount.toLocaleString() },
  //             { default: city.toString() },
  //             { default: storeAdmin.user.name.toString() },
  //             { default: storeAdmin.user.contact_no.toString() },
  //             { default: link.toString() },






  //           ]


  //         }
  //       }
  //     }

  //     await messageBird.conversations.start(params, function (err, response) {
  //       if (err) {
  //         return // console.log(err);
  //       }
  //       // console.log(response);
  //     });


  //   }


  //   var params = {
  //     'to': '+91' + phone,//+vendor.contact_no,//9717837769' ,
  //     'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
  //     'type': 'hsm',
  //     content: {
  //       'hsm': {
  //         'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
  //         'templateName': 'purchaseorder',
  //         'language': {

  //           'policy': 'deterministic',
  //           'code': 'en'
  //         },

  //         params: [


  //           { default: seller.business.name.toString() },
  //           { default: orderId.toString() },
  //           { default: amount.toLocaleString() },
  //           { default: city.toString() },
  //           { default: storeAdmin.user.name.toString() },
  //           { default: storeAdmin.user.contact_no.toString() },
  //           { default: link.toString() },





  //         ]


  //       }
  //     }
  //   }

  //   await messageBird.conversations.start(params, function (err, response) {
  //     if (err) {
  //       return // console.log(err);
  //     }
  //     // console.log(response);
  //   });



  // },

  orderPurchase: async (id) => {

    var seller = await VendorOrders.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'vendor', select: 'name avatar avatar_address contact_no  business_info optional_info' })
      .populate({ path: 'business', select: 'name avatar avatar_address contact_no address whatsAppChannelId' })
      .exec()


    var storeAdmin = await Management.findOne({ role: 'Store Manager', business: seller.vendor })
      .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()




    var storeCount = await Management.find({ role: 'Store Manager', business: seller.vendor }).count()

    var city = seller.business.address.city;
    var orderId = seller.order_no;
    var amount = seller.total_amount.toFixed();

    var phone = undefined;
    // var day ='today';
    var number = seller.vendor.contact_no;


    if (number == '18008434300') {
      phone = seller.vendor.optional_info.alternate_no

      console.log("in ifffff");
    } else {
      phone = number;
      console.log("in elsee");
    }



    if (storeAdmin) {
      var link = "wa.me/" + storeAdmin.user.contact_no
      var storeBoyName = storeAdmin.user.name
      var storePhone = storeAdmin.user.contact_no
    }
    else {
      link = "wa.me/" + phone
      storeBoyName = 'Name not found'
      storePhone = 'Not Found'
    }


    //store..
    if (storeCount !== 0) {


      var params = {
        'to': '+91' + storeAdmin.user.contact_no,//+vendor.contact_no,//9717837769' ,
        'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
        'type': 'hsm',
        content: {
          'hsm': {
            'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
            'templateName': 'purchaseorder',
            'language': {

              'policy': 'deterministic',
              'code': 'en'
            },

            params: [

              { default: seller.business.name.toString() },
              { default: orderId.toString() },
              { default: amount.toLocaleString() },
              { default: city.toString() },
              { default: storeBoyName.toString() },
              { default: storePhone.toString() },
              { default: link.toString() },

            ]


          }
        }
      }

      await messageBird.conversations.start(params, function (err, response) {
        if (err) {
          return console.log(err);
        }
        console.log(response);
      });


    }


    var params = {
      'to': '+91' + phone,//+vendor.contact_no,//9717837769' ,
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'purchaseorder',
          'language': {

            'policy': 'deterministic',
            'code': 'en'
          },

          params: [


            { default: seller.business.name.toString() },
            { default: orderId.toString() },
            { default: amount.toLocaleString() },
            { default: city.toString() },
            { default: storeBoyName.toString() },
            { default: storePhone.toString() },
            { default: link.toString() },





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



  },



  SalesInvoiceWhatsapp: async (salesinvoice) => {
    var user = await User.findOne({ _id: mongoose.Types.ObjectId(salesinvoice.user) }).exec();
    var business = await User.findOne({ _id: mongoose.Types.ObjectId(salesinvoice.business) }).exec();

    var due = salesinvoice.due.due.toLocaleString();
    var url = salesinvoice.invoice_url;




    var businessName = business.name;
    var caption = user.name;

    // console.log(caption);

    var params = {
      'to': "+91" + user.contact_no,
      'type': 'hsm',
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'content': {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'order_invoice',//'invoice_doc',
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
                    // "url": 'http://www.africau.edu/images/default/sample.pdf',
                    'url': `${url}`,
                    // 'url' :'https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/RizeBear+Distribution+Private+Limited.pdf',
                    "caption": `${caption}`
                  }
                }
              ]
            },
            {
              "type": "body",
              'parameters': [
                {
                  'type': 'text',
                  'text': `${due}`,



                },

                {
                  'type': 'text',
                  'text': `${businessName}`,

                },

              ]
            }
          ]
        }
      }
    }

    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    });



  },




  estiamteSendWhatsapp: async (b, business) => {
    var businessDetails = await User.findOne({ _id: mongoose.Types.ObjectId(business) }).exec();
    var booking = await Booking.findOne({ _id: mongoose.Types.ObjectId(b) })
      .populate({ path: 'user', populate: { path: 'user', select: "_id id name contact_no email" } })
      .populate({ path: 'car', select: '_id id title registration_no fuel_type vin engine_no' })
      .exec();



    var due = booking.payment.estimate_cost.toLocaleString();
    let url = booking.estimate_url;
    console.log("Table URL  = " + booking.estimate_url)
    //console.log(url);
    var channelId = businessDetails.whatsAppChannelId;


    var title = booking.car.title;
    var caption = booking.car.registration_no;
    console.log(caption);

    var params = {
      'to': "+91" + booking.user.contact_no,
      'type': 'hsm',
      'channelId': channelId,//'fe7defba13134d3d81498f5c8f8f0aa8',
      'content': {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'estimate_file',//'invoice_doc',
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
                    // "url": 'http://www.africau.edu/images/default/sample.pdf',
                    'url': `${url}`,
                    // 'url' :'https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/RizeBear+Distribution+Private+Limited.pdf',
                    "caption": `${caption}`
                  }
                }
              ]
            },
            {
              "type": "body",
              'parameters': [
                {
                  'type': 'text',
                  'text': `${title}`,


                },

                {
                  'type': 'text',
                  'text': `${due}`,

                },

              ]
            }
          ]
        }
      }
    }
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    });

  },
  orderShiped: async (id, orderId, userId) => {
    var seller = await User.findOne({ _id: mongoose.Types.ObjectId(id) }).exec();
    var storeCount = await Management.find({ role: 'Store Manager', business: id }).count()
    var user = await User.findOne({ _id: mongoose.Types.ObjectId(userId) }).exec();
    var phone = undefined;
    // var day ='today';
    var number = seller.contact_no;
    if (number == '18008434300') {
      phone = seller.optional_info.alternate_no
    } else {
      phone = number;
    }
    console.log(user.name);

    var params = {
      'to': '+91' + phone,
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'type': 'hsm',
      content: {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'shipped',
          'language': {

            'policy': 'deterministic',
            'code': 'en'
          },
          params: [
            { default: seller.name.toString() },
            { default: orderId.toString() },
          ]
        }
      }
    }
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      // console.log(response);
    });
    //for store boy
    if (storeCount !== 0) {
      var storeAdmin = await Management.findOne({ role: 'Store Manager', business: id })
        .populate({ path: 'user', select: 'name  contact_no  business_info optional_info' }).exec()
      var params = {
        'to': '+91' + storeAdmin.user.contact_no,
        'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
        'type': 'hsm',
        content: {
          'hsm': {
            'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
            'templateName': 'shipped',
            'language': {
              'policy': 'deterministic',
              'code': 'en'
            },
            params: [
              { default: seller.name.toString() },
              { default: orderId.toString() },

            ]
          }
        }
      }
      await messageBird.conversations.start(params, function (err, response) {
        if (err) {
          return console.log(err);
        }
        // console.log(response);
      });
    }
  },

  parchiSendWhatsapp: async (id, businessId) => {
    var business = await User.findOne({ _id: mongoose.Types.ObjectId(businessId) }).exec();
    var parchi = await Parchi.findOne({ _id: mongoose.Types.ObjectId(id) })
      .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
      .exec();

    var due = parchi.payment.total.toLocaleString();
    var url = parchi.parchi_url;
    var caption = parchi.user.name;







    var params = {
      'to': "+91" + parchi.user.contact_no,
      'type': 'hsm',
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'content': {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'e_parchi',//'invoice_doc',
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
                    // "url": 'http://www.africau.edu/images/default/sample.pdf',
                    'url': `${url}`,
                    // 'url' :'https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/RizeBear+Distribution+Private+Limited.pdf',
                    "caption": `${caption}`
                  }
                }
              ]
            },
            {
              "type": "body",
              'parameters': [
                {
                  'type': 'text',
                  'text': `${due}`,



                },

                {
                  'type': 'text',
                  'text': `${business.name}`,

                },

              ]
            }
          ]
        }
      }
    }
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    });

  },

  //sales payment Req..By Sumit Mathur

  paymetRequestSales: async (user, businessId) => {
    var business = await User.findOne({ _id: mongoose.Types.ObjectId(businessId) }).exec();
    // console.log("ttt" + JSON.stringify(business.bank_details[0]));
    var bank = business.bank_details[0].bank

    var upi = ''

    if (business.bank_details[0].upi_id == "") {
      console.log("if");
      upi = 'not available'

    }
    else {
      console.log("else");
      upi = business.bank_details[0].upi_id
    }
    console.log(JSON.stringify(business.bank_details[0].upi_id));

    var params = {
      "to": "+91" + user.contact_no,
      "type": "hsm",
      "channelId": "fe7defba13134d3d81498f5c8f8f0aa8",
      "content": {
        "hsm": {
          "namespace": "d16e5071_32b4_4f26_9168_869b57db0a90",
          "templateName": "payment_link",
          "language": {
            "policy": "deterministic",
            "code": "en"
          },
          //   "components": [
          //     {
          //       "type": "header",
          //       "parameters": [
          //         {
          //           "type": "image",
          //           "image": {
          //             "url": "https://i.ibb.co/DfPwb5W/google-pay.jpg",
          //             "caption": "Qr.png"
          //           }
          //         }
          //       ]
          //     },
          //     {
          //       "type": "body",
          //       "parameters": [
          //         {
          //           "type": "text",
          //           "text": "CarEager"
          //         },
          //         {
          //           "type": "text",
          //           "text": "11800"
          //         },
          //         {
          //           "type": "text",
          //           "text": "HDFC Bank Limited"
          //         },
          //         {
          //           "type": "text",
          //           "text": "1354671823243"
          //         },
          //         {
          //           "type": "text",
          //           "text": "HDFC234343"
          //         },
          //         {
          //           "type": "text",
          //           "text": "manan@okhdfcbank"
          //         }
          //       ]
          //     }
          //   ]

          "components": [
            {
              "type": "header",
              "parameters": [
                {
                  "type": "image",
                  "image": {
                    "url": "https://i.ibb.co/kBf4NDN/QrCode.png"
                  }
                }
              ]
            },
            {
              "type": "body",
              "parameters": [
                {
                  "type": "text",
                  "text": business.name
                },
                // {
                //   "type": "text",
                //   "text": "MB93824"
                // },
                {
                  "type": "text",
                  "text": bank
                },
                {
                  "type": "text",
                  "text": `${business.bank_details[0].account_no}`
                },
                {
                  "type": "text",
                  "text": `${business.bank_details[0].ifsc}`
                },
                {
                  "type": "text",
                  "text": `${upi}`
                },
              ]
            }
          ]
        }
      }
    }

    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        for (error of err.errors) {
          console.error(error)
        }
      }
    });
  },

  // paymetRequestSales: async (user, businessId) => {
  //   var business = await User.findOne({ _id: mongoose.Types.ObjectId(businessId) }).exec();
  //   console.log("ss"+user.contact_no);

  //   var params = {
  //     'to': '+919717837769',// + user.contact_no,
  //     'type': 'hsm',
  //     'channelId': 'fe7defba13134d3d81498f5c8f8f0aa8',
  //     'content': {
  //       'hsm': {
  //         'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
  //         'templateName': 'payment_link',
  //         'language': {
  //           'policy': 'deterministic',
  //           'code': 'en'
  //         },
  //         'components': [
  //           {
  //             'type': 'header',
  //             'parameters': [
  //               {
  //                 'type': 'image',
  //                 'image': {
  //                   'url': 'https://i.ibb.co/kBf4NDN/QrCode.png',
  //                   'caption': 'Qr.png'
  //                 }
  //               }
  //             ]
  //           },
  //           {
  //             'type': 'body',
  //             'parameters': [
  //               {
  //                 'type': 'text',
  //                 'text': business.name
  //               },
  //               {
  //                 'type': 'text',
  //                 'text': business.bank_details[0].bank
  //               },
  //               {
  //                 'type': 'text',
  //                 'text': business.bank_details[0].account_no
  //               },
  //               {
  //                 'type': 'text',
  //                 'text': business.bank_details[0].ifsc
  //               },
  //               {
  //                 'type': 'text',
  //                 'text': business.bank_details[0].upi_id
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   }

  //   await messageBird.conversations.start(params, function (err, response) {
  //     if (err) {
  //       return console.log(err);
  //     }
  //      console.log(response);
  //   });






  // },


  //sumit mathur 30 Dec 

  paymentRecieptWhatsApp: async (user, payment) => {
    // var business = await User.findOne({ _id: mongoose.Types.ObjectId(businessId) }).exec();
    // var parchi = await Parchi.findOne({ _id: mongoose.Types.ObjectId(id) })
    // .populate({ path: 'user', select: 'name contact_no username email account_info business_info' })
    // .exec();

    // var due = parchi.payment.total.toLocaleString();
    var url = payment.transaction_url;
    var caption = `${user.name}._Payment_Receipt`;
    var name = user.name;
    var date = moment(payment.created_at).format('MMM DD,YYYY')
    //console.log(url);
    //console.log(date);

    var params = {
      'to': "+91" + user.contact_no,
      'type': 'hsm',
      'channelId': '4f1e778f-9f3b-41e0-8bf4-db6ffb15b0c2',
      'content': {
        'hsm': {
          'namespace': 'd16e5071_32b4_4f26_9168_869b57db0a90',
          'templateName': 'payment_parchi',//'invoice_doc',
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
                    // "url": 'http://www.africau.edu/images/default/sample.pdf',
                    'url': `${url}`,
                    // 'url' :'https://careager.s3.ap-south-1.amazonaws.com/partyStatemnts/RizeBear+Distribution+Private+Limited.pdf',
                    "caption": `${caption}`
                  }
                }
              ]
            },
            {
              "type": "body",
              'parameters': [
                {
                  'type': 'text',
                  'text': `${name}`,



                },

                {
                  'type': 'text',
                  'text': `${date}`,

                },

              ]
            }
          ]
        }
      }
    }
    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      //console.log(response);
    });

  },
  paymetRequest: async (amount, user, businessId) => {
    var business = await User.findOne({ _id: mongoose.Types.ObjectId(businessId) }).exec();
    console.log("ttt" + JSON.stringify(business.bank_details[0]));
    var bank = business.bank_details[0].bank

    var upi = ''

    if (business.bank_details[0].upi_id == "") {
      console.log("if");
      upi = 'not available'

    }
    else {
      console.log("else");
      upi = business.bank_details[0].upi_id
    }
    console.log(JSON.stringify(business.bank_details[0].upi_id));

    var params = {
      "to": "+91" + user.contact_no,
      "type": "hsm",
      "channelId": "fe7defba13134d3d81498f5c8f8f0aa8",
      "content": {
        "hsm": {
          "namespace": "d16e5071_32b4_4f26_9168_869b57db0a90",
          "templateName": "qr_code",
          "language": {
            "policy": "deterministic",
            "code": "en"
          },
          "components": [
            {
              "type": "header",
              "parameters": [
                {
                  "type": "image",
                  "image": {
                    "url": "https://i.ibb.co/kBf4NDN/QrCode.png"
                  }
                }
              ]
            },
            {
              "type": "body",
              "parameters": [
                {
                  "type": "text",
                  "text": business.name
                },
                {
                  "type": "text",
                  "text": "Rs. " + amount
                },
                {
                  "type": "text",
                  "text": bank
                },
                {
                  "type": "text",
                  "text": `${business.bank_details[0].account_no}`
                },
                {
                  "type": "text",
                  "text": `${business.bank_details[0].ifsc}`
                },
                {
                  "type": "text",
                  "text": `${upi}`
                },
              ]
            }
          ]
        }
      }
    }

    await messageBird.conversations.start(params, function (err, response) {
      if (err) {
        for (error of err.errors) {
          console.error(error)
        }
      }
    });
  },


}
//events.leadGenerate("7895933824")

module.exports = events


