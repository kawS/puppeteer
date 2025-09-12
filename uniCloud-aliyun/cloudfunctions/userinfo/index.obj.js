// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const MD5 = require('crypto-js/md5.js');

module.exports = {
	_before: function () {
		// 通用预处理器
	},
	// 登录
	async setLogin(params) {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		});
		const where = `uid == '${params.uid}' && token == '${params.pwd}' && rdtoken == '${params.rdtoken}'`;
		const timespan = new Date().getTime();
		try {
			const res = await db.collection('sysUser').where(where).get();
			if (res.data.length > 0) {
				const token = MD5(`${params.uid}${params.pwd}${params.rdtoken}`).toString();
				await db.collection('sysLog').add({
					status: 'success',
					event: 'login',
					type: 'login',
					uid: params.uid,
					time: timespan
				});
				return {
					uid: params.uid,
					token
				};
			} else {
				await db.collection('sysLog').add({
					status: 'error',
					event: 'no data',
					type: 'login',
					uid: params.uid,
					time: timespan
				});
				return null;
			}
		} catch (error) {
			await db.collection('sysLog').add({
					status: 'error',
					event: 'login',
					type: 'login',
					uid: params.uid,
					time: timespan
				});
		}
	},
	async checkToken(token) {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		});
		const res = await db.collection('sysUserLog').where(`token == '${token}'`).get();
		if (res.data.length > 0) {
			return res.data[0];
		} else {
			return null;
		}
	}
};
