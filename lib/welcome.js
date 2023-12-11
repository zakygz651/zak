const fs = require('fs')
const { TelegraPh } = require('./uploader')
const { getRandom, smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./myfunc')
const { isSetWelcome, getTextSetWelcome } = require('./setwelcome');
const { isSetLeft, getTextSetLeft } = require('./setleft');
let set_welcome_db = JSON.parse(fs.readFileSync('./database/set_welcome.json'));
let set_left_db = JSON.parse(fs.readFileSync('./database/set_left.json'));
let setting = JSON.parse(fs.readFileSync('./config.json'));
const welcome2 = setting.auto_welcomeMsg
const leave2 = setting.auto_leaveMsg
const {
	delay,
	proto,
	jidDecode,
	jidNormalizedUser,
	generateForwardMessageContent,
	generateWAMessageFromContent,
	downloadContentFromMessage,
} = require('@adiwajshing/baileys')
const moment = require('moment-timezone')

module.exports.welcome = async(iswel, isleft, juna, anu) =>{
	try {
            const metadata = await juna.groupMetadata(anu.id)
            const participants = anu.participants
            const memeg = metadata.participants.length;
  	        const groupName = metadata.subject
  		      const groupDesc = metadata.desc
  		      
            for (let num of participants) {
  		      const fkontaku = { key: {participant: `0@s.whatsapp.net`, ...(anu.id ? { remoteJid: `6283136505591-1614953337@g.us` } : {}) }, message: { 'contactMessage': { 'displayName': ``, 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;,;;;\nFN:,\nitem1.TEL;waid=${num.split('@')[0]}:${num.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 'jpegThumbnail': setting.pathimg, thumbnail: setting.pathimg,sendEphemeral: true}}}
                try {
                    pp_user = await juna.profilePictureUrl(num, 'image')
                } catch {
                    pp_user = 'https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg'
                }

                try {
                    ppgroup = await juna.profilePictureUrl(anu.id, 'image')
                } catch {
                    ppgroup = 'https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg'
                }
                if (anu.action == 'add' && (iswel || setting.auto_welcomeMsg)) {
                	console.log(anu)
                if (isSetWelcome(anu.id, set_welcome_db)) {               	
                var get_teks_welcome = await getTextSetWelcome(anu.id, set_welcome_db)
                var replace_pesan = (get_teks_welcome.replace(/@user/gi, `@${num.split('@')[0]}`))
                var full_pesan = (replace_pesan.replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc))
                juna.sendMessage(anu.id, { text: `${full_pesan}` })
                } else {
    var wc = await getBuffer(`https://telegra.ph/file/eaf642e46f00344e93a2c.png`)
                	await juna.sendMessage(anu.id, {image: wc, caption: `Hii @${num.split("@")[0]},Welcome In ${groupName} Jangan Lupa Intro! \n${groupDesc}`, mentions: [num]}, {quoted:fkontaku})
                }
                } else if (anu.action == 'remove' && (isleft || setting.auto_leaveMsg)) {
                	console.log(anu)
                	if (isSetLeft(anu.id, set_left_db)) {            	
                        var get_teks_left = await getTextSetLeft(anu.id, set_left_db)
                        var replace_pesan = (get_teks_left.replace(/@user/gi, `@${num.split('@')[0]}`))
                        var full_pesan = (replace_pesan.replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc))
                      juna.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `${full_pesan}` })
                       } else {
   var lf = await getBuffer(`https://telegra.ph/file/a0a6f7bc72d1a6be0fa48.png`) 
await juna.sendMessage(anu.id, {image: lf, caption: `Sayonara @${num.split("@")[0]}`, mentions: [num]}, {quoted:fkontaku})
                        } 
                } else if (anu.action == 'promote') {
                  juna.relayMessage(anu.id, {
		scheduledCallCreationMessage: {
		callType: "AUDIO",
		scheduledTimestampMs: 100,
		title: `@${num.split("@")[0]} Telah Di Promote Menjadi Admin\n`, 
		}
	}, {})
                } else if (anu.action == 'demote') {
                    juna.relayMessage(anu.id, {
		scheduledCallCreationMessage: {
		callType: "AUDIO",
		scheduledTimestampMs: 100,
		title: `@${num.split("@")[0]} Telah Di Demote Dan Menjadi Member Biasa\n`, 
		}
	}, {})
              }
}
        } catch (err) {
            console.log(err)
            }
	}

	module.exports.aDelete = async (setting, juna, m) => {
	  if(setting.antiDelete){
	try {
		const dataChat = global.dbc
		const mess = dataChat.find((a) => a.id == m.id);
		const mek = mess.m;
    //console.log(mek)
		const participant = mek.key.remoteJid.endsWith("@g.us") ? mek.key.participant : mek.key.remoteJid;
		console.log(participant)
		const froms = mek.key.remoteJid;
		await juna.sendMessage(
			froms, {
				text: `「 *ANTI DELETE MESSAGE* 」
    
📛 *Name* : ${mek.pushName}
👤 *User* : @${mek.sender.split("@")[0]}
⏰ *Clock* : ${moment.tz('Asia/Jakarta').format('HH:mm:ss')} WIB 
✍️ *MessageType* : ${mek.mtype}
    `,
				mentions: [participant],
			}, {
				quoted: mek
			}
		);

		await juna.copyNForward(froms, mek, true);
  	await delay(4000)
		let messek = dataChat.find((a) => a.id == m.id);
		for (let [i, te] of dataChat.entries()) {
			if (te.id === m.id) {
				dataChat.splice(i, 1); // Tim is now removed from "users"
		}
		}

	} catch (err) {
	  console.log(err)
	}
	  }
	}

module.exports.oneTime = async (setting,juna,m) => {
  if(setting.antiViewOnce){
  			try {
let teks = `「 *ANTI VIEWONCE MESSAGE* 」
      
📛 *Name* : ${m.pushName}
👤 *User* : @${m.sender.split("@")[0]}
⏰ *Clock* : ${moment.tz('Asia/Jakarta').format('HH:mm:ss')} WIB  
✍️ *MessageType* : ${m.mtype}
💬 *Caption* : ${m.msg.caption ? m.msg.caption : "no caption"}`

await juna.sendTextWithMentions(m.chat, teks, m)
  await delay(500)

  m.copyNForward(m.chat, true, {
  readViewOnce: true,
    quoted: m
  })

			} catch (err) {
				console.log(err)
			}
  }
}
