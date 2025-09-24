<template>
	<div class="content">
		<a-segmented v-model:value="sVal" block :options="types" @change="changeType" />
		<br />
		<div v-show="sVal === 'Tournaments'">
			<unicloud-db v-slot:default="{ data }" collection="mtgDeck" where="type=='Tournaments'">
				<a-timeline>
					<a-timeline-item v-for="item in data" :key="item.url">
						<div class="tlt">{{ item.name }}</div>
						<div class="wrap" v-for="sitem in item.decks" :key="sitem.url">
							<a-button type="text" @click="goDet(sitem.det)">{{ sitem.name }}</a-button>
							<div class="mana" v-html="returnHtml(sitem.mana)"></div>
						</div>
					</a-timeline-item>
				</a-timeline>
			</unicloud-db>
		</div>
		<div v-show="sVal === 'Metagame'">
			<unicloud-db v-slot:default="{ data }" collection="mtgDeck" where="type=='Metagame'">
				<div class="wrap" v-for="item in data" :key="item.url">
					<a-button type="text" @click="goDet(item.deck)">{{ item.name }}</a-button>
					<div class="mana" v-html="returnHtml(item.mana)"></div>
				</div>
			</unicloud-db>
		</div>
		<div v-show="sVal === 'Search'">
			<a-input v-model:value="searchInp" placeholder="name" />
			<br />
			<br />
			<a-button @click="getSearch">getDet</a-button>
			<a-button @click="saveSearch">saveDet</a-button>
			{{ searchData?.[0].display_name }}
		</div>
		<a-button @click="setNew(sVal)" v-if="sVal !== 'Search'">set new deck list</a-button>
	</div>
</template>

<script setup>
	import { onShow } from '@dcloudio/uni-app';
	import { Modal, message } from 'ant-design-vue';
	import { ref } from 'vue';
	import { colors, setList } from '@/dict/comm.js';

	// 云对象
	const cloudObj = uniCloud.importObject('cuntils');
	const db = uniCloud.databaseForJQL();
	const dbCmd = db.command;
	const types = ref(['Tournaments', 'Metagame', 'Search']);
	const sVal = ref(types.value[0]);
	const searchInp = ref('');
	const searchData = ref(null);

	onShow(options => {
		uni.removeStorageSync('mtgDeck');
	});

	const goDet = det => {
		uni.setStorageSync('mtgDeck', det);
		uni.navigateTo({
			url: '/pages/deck/deck'
		});
	};

	const returnHtml = color => {
		const slist = color.split('|');
		let result = '';
		slist.forEach(element => {
			result += `${colors[element].tag}`;
		});
		return `<i class="ms ms-ci ms-ci-${slist.length} ms-ci-${result}"></i>`;
	};

	const setNew = type => {
		import(`../../json/demo${type}.json`)
			.then(async module => {
				console.log('Loaded demo.js:', module.result);

				await db.collection('mtgDeck').where(`type=='${sVal.value}'`).remove();

				db.collection('mtgDeck')
					.add(module.result)
					.then(res => {
						if (res.errCode === 0) {
							message.success(`新增${sVal.value}成功`);
							location.reload();
						} else {
							console.error(res.errMsg);
						}
					})
					.catch(err => {
						console.error(err);
					});
			})
			.catch(err => {
				console.error('Failed to load demo.js:', err);
			});
	};

	const changeType = val => {
		console.log(val);
	};
	const getSearch = async () => {
		const set = setList.map(item => item.label);
		const res = await cloudObj.getDeckDet(searchInp.value, 'illustration_id');
		const result = res.data.items.filter(item => {
			if (item.display_name_zh == searchInp.value || item.display_name == searchInp.value) {
				if (set.includes(item.set)) {
					return true;
				}
			}
		});
		searchData.value = result;
	};
	const saveSearch = async () => {
		const baseData = searchData.value[0];
		baseData.other_faces = searchData.value.slice(1);
		db.collection('mtgCards')
			.add(baseData)
			.then(res => {
				if (res.errCode === 0) {
					message.success(`新增${searchData.value}成功`);
					location.reload();
				} else {
					console.error(res.errMsg);
				}
			})
			.catch(err => {
				console.error(err);
			});
	};
</script>

<style lang="scss" scoped>
	.content {
		padding: 40rpx;

		.tlt {
			font-size: 30rpx;
			font-weight: 700;
		}
	}

	:deep(.wrap) {
		display: flex;
		align-items: center;

		.mana {
			display: flex;
		}

		.i-cr {
			margin-left: 10rpx;
			width: 30rpx;
			height: 30rpx;
			border: 1px solid #999;
			border-radius: 50%;
			display: block;
		}
	}
</style>
