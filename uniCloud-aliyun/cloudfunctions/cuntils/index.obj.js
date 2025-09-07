// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function () {
		// 通用预处理器
	},
	// 微信小程序openid
	async getOpenId(code) {
		const appid = 'wx0bf904d495a674ab';
		const secret = '12b09c561b293f2649dd6750116aaeca';
		const tarUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
		const res = await uniCloud.httpclient.request(tarUrl, {
			method: 'GET',
			dataType: 'json',
		});
		const tarUrlAT = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
		const resAT = await uniCloud.httpclient.request(tarUrlAT, {
			method: 'GET',
			dataType: 'json',
		});
		return Object.assign(res.data, resAT.data);
	},
	// 发送一次性订阅
	async sendMSGTest(obj) {
		const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${obj.atoken}`;
		const res = await uniCloud.httpclient.request(url, {
			method: 'POST',
			dataType: 'json',
			headers: {
				'content-type': 'application/json',
			},
			data: {
				template_id: obj.modelid,
				page: '/pages/index/index',
				touser: obj.openid,
				data: obj.data,
				miniprogram_state: 'formal',
				lang: 'zh_CN',
			},
		});
		return res;
	},
	// 系统配置
	async getSysInfo() {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		const dbcollection = await db.collection('sysInfo').get();
		return dbcollection;
	},
	// 获取页面
	async getPageDoc(apiUrl) {
		const res = await uniCloud.httpclient.request(apiUrl, {
			method: 'GET',
			dataType: 'text',
		});
		return res;
	},
	// 系统配置&卡盒列表
	async getIndexInfo() {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		const sysInfoData = await db.collection('sysInfo').get();
		const ptcgBoxMenuTable = await db.collection('ptcgBoxMenu').where('isBack == false').orderBy('_id desc').get();
		const SVP = ptcgBoxMenuTable.data.filter((item) => item.ecode == 'SVP');
		const staData = ptcgBoxMenuTable.data.filter((item) => item.ecode != 'SVP');
		const seriesData = staData.reduce((acc, current) => {
			const sename = current.sename.replace(' & ', '');
			if (!acc[sename]) {
				acc[sename] = [];
			}
			acc[sename].push(current);
			return acc;
		}, {});
		seriesData['ScarletViolet'].push(...SVP);
		return { sysInfoData, seriesData };
	},
	// 搜索
	async getSearchCard(where) {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		const MELength = await db.collection('ptcgCardME').where(where).count();
		const SVLength = await db.collection('ptcgCardSV').where(where).count();
		const SSLength = await db.collection('ptcgCardSS').where(where).count();
		const OthLength = await db.collection('ptcgOcard').where(where).count();
		const size = 100;
		let MEoffset = 0;
		let SVoffset = 0;
		let SSoffset = 0;
		let SVPoffset = 0;
		let result = [];
		while (MEoffset < MELength.total) {
			let res = await db.collection('ptcgCardME').where(where).orderBy('_id desc').skip(MEoffset).limit(size).get();
			result = [...result, ...res.data];
			MEoffset += size;
		}
		while (SVoffset < SVLength.total) {
			let res = await db.collection('ptcgCardSV').where(where).orderBy('_id desc').skip(SVoffset).limit(size).get();
			result = [...result, ...res.data];
			SVoffset += size;
		}
		while (SVPoffset < OthLength.total) {
			let res = await db.collection('ptcgOcard').where(where).orderBy('_id desc').skip(SVPoffset).limit(size).get();
			result = [...result, ...res.data];
			SVPoffset += size;
		}
		while (SSoffset < SSLength.total) {
			let res = await db.collection('ptcgCardSS').where(where).orderBy('_id desc').skip(SSoffset).limit(size).get();
			result = [...result, ...res.data];
			SSoffset += size;
		}
		return result;
	},
	// 系列卡盒
	async getSeriesCard(seriesTb, where) {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		const length = await db.collection(seriesTb).where(where).orderBy('_id asc').count();
		const size = 100;
		let offset = 0;
		let result = [];
		while (offset < length.total) {
			let res = await db.collection(seriesTb).where(where).orderBy('_id asc').skip(offset).limit(size).get();
			result = [...result, ...res.data];
			offset += size;
		}
		return result;
	},
	// 热门卡组
	async getHotList(skip, limit, where) {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		let res = {
			data: [],
			count: 0,
		};
		if (where) {
			res = await db.collection('ptcgHot').where(where).skip(skip).limit(limit).orderBy('_id', 'desc').get({
				getCount: true,
			});
		} else {
			res = await db.collection('ptcgHot').skip(skip).limit(limit).orderBy('_id', 'desc').get({
				getCount: true,
			});
		}
		return res;
	},
	// 热门卡组名列表
	async getHotNameList() {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		const length = await db.collection('ptcgHot').orderBy('_id desc').count();
		const size = 100;
		const _set = new Set();
		let offset = 0;
		let result = [];
		while (offset < length.total) {
			let res = await db.collection('ptcgHot').orderBy('_id desc').skip(offset).limit(size).get();
			result = [...result, ...res.data];
			offset += size;
		}
		_set.add('全部');
		for (let item of result) {
			_set.add(item.name);
		}
		return Array.from(_set);
	},
	// 热门卡组卡表
	async getCodeDeck(data) {
		const _odata = {};
		if(data.SV){
			_odata.SV = data.SV;
			if(data.SVB){
				_odata.SV = [..._odata.SV, ...data.SVB]
			}
			if(data.SVW){
				_odata.SV = [..._odata.SV, ...data.SVW]
			}
		}
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		const dbCom = db.command;
		const whereArr = Object.keys(_odata);
		let index = 0;
		let _data = [];
		while (index < whereArr.length) {
			const key = whereArr[index];
			const item = _odata[key];
			const tb = key == '' ? 'ptcgCardSS' : `ptcgCard${key}`;
			if (item.length > 0) {
				const where = dbCom.or(
					item.map((item) => {
						return {
							ename: dbCom.exists(item.name),
							series: item.set,
							cardNo: parseInt(item.number),
						};
					})
				);
				let res = await db.collection(tb).where(where).get();
				_data = [..._data, ...res.data];
				index += 1;
			}
		}
		return _data;
	},
	// svp数据
	async getOthCodeDeck(data) {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		const dbCom = db.command;
		const whereArr = Object.keys(data);
		let index = 0;
		let _data = [];
		while (index < whereArr.length) {
			const key = whereArr[index];
			const item = data[key];
			const tb = 'ptcgOcard';
			if (item.length > 0) {
				const where = dbCom.or(
					item.map((item) => {
						return {
							ename: dbCom.exists(item.name),
							series: item.set,
							cardNo: parseInt(item.number),
						};
					})
				);
				let res = await db.collection(tb).where(where).get();
				_data = [..._data, ...res.data];
				index += 1;
			}
		}
		return _data;
	},
	// Pocket热门卡组
	async getPocketHotList(skip, limit, where) {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		let res = {
			data: [],
			count: 0,
		};
		if (where) {
			res = await db.collection('ptcgPocketHot').where(where).skip(skip).limit(limit).orderBy('_id', 'desc').get({
				getCount: true,
			});
		} else {
			res = await db.collection('ptcgPocketHot').skip(skip).limit(limit).orderBy('_id', 'desc').get({
				getCount: true,
			});
		}
		return res;
	},
	// Pocket热门卡组名列表
	async getPocketHotNameList() {
		const db = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo(),
		});
		const length = await db.collection('ptcgPocketHot').orderBy('_id desc').count();
		const size = 100;
		const _set = new Set();
		let offset = 0;
		let result = [];
		while (offset < length.total) {
			let res = await db.collection('ptcgPocketHot').orderBy('_id desc').skip(offset).limit(size).get();
			result = [...result, ...res.data];
			offset += size;
		}
		_set.add('全部');
		for (let item of result) {
			_set.add(item.name);
		}
		return Array.from(_set);
	},
	// 大学院废墟查卡
	async getDeckDet(params) {
			const res = await uniCloud.httpclient.request(`https://mtgch.com/api/v1/result?q=${params}&page=1&page_size=20&unique=oracle_id&priority_chinese=true&view=1`, {
			method: 'GET',
			dataType: 'json'
		});
		return res;
	},
};
