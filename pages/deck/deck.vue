<template>
	<div class="content">
		<a-skeleton v-if="data.length == 0" />
		<a-row v-else>
			<a-col :span="24" v-for="(item, index) in data" :key="index">
				<a-divider v-if="types.includes(index)">{{ item.category }}</a-divider>
				<a-button type="text" @click="getDet(item.name, index)">{{ item.count }} {{ item.name }}</a-button>
			</a-col>
		</a-row>
	</div>
	<a-modal v-model:open="visible" title="" :closable="false">
		<template #footer>
			<a-switch v-model:checked="checkImg" style="margin-right: 8px" />
			<a-button type="primary" @click="goIndex(-1)" :disabled="selIndex == 0 || loadCard">Prev</a-button>
			<a-button type="primary" @click="goIndex(1)" :disabled="selIndex == maxDis || loadCard">Next</a-button>
			<a-button key="submit" type="primary" @click="visible = false">Return</a-button>
		</template>
		<a-skeleton v-if="!visible" />
		<a-row v-else>
			<a-col :span="24">
				<div>{{ card.display_name_zh }}</div>
				<div class="mb1">{{ card.display_name }}</div>
				<div class="mb1f">
					<div>{{ card.display_type_line }}</div>
					<div>{{ card.rarity }}</div>
				</div>
				<div v-html="card.oracle_text_html"></div>
			</a-col>
			<template v-if="card.other_faces && card.other_faces.length > 0">
				<a-divider />
				<a-col :span="24" v-for="ocard in card.other_faces" :key="ocard.collector_number">
					<div>{{ ocard.display_name_zh }}</div>
					<div class="mb1">{{ ocard.display_name }}</div>
					<div v-html="ocard.oracle_text_html"></div>
				</a-col>
			</template>
			<div class="imgs" v-show="checkImg">
				<a-image-preview-group>
					<a-image :width="50" :src="card.image_url" />
					<a-image :width="50" :src="ocard.image_url" v-for="ocard in card.other_faces" :key="ocard.collector_number" />
				</a-image-preview-group>
			</div>
		</a-row>
	</a-modal>
</template>

<script setup>
	import { onShow } from '@dcloudio/uni-app';
	import { Modal, message } from 'ant-design-vue';
	import { ref } from 'vue';

	// 云对象
	const cloudObj = uniCloud.importObject('cuntils');
	const db = uniCloud.database();

	const data = ref([]);
	const card = ref({});
	const visible = ref(false);
	const types = [];
	const selIndex = ref(null);
	const maxDis = ref(null);
	const loadCard = ref(false);
	const checkImg = ref(false);

	onShow(options => {
		data.value = uni.getStorageSync('mtgDeck') || [];
		maxDis.value = data.value.length - 1;
		for (let i = 0; i < data.value.length; i++) {
			let item = data.value[i];
			if (i == 0) {
				types.push(0);
			} else {
				if (item.category != data.value[i - 1].category) {
					types.push(i);
				}
			}
		}
	});

	const getDet = (name, index) => {
		const reqName = name.split(' // ')[0];
		if (index) selIndex.value = index;
		loadCard.value = true;
		db.collection('mtgCards')
			.where({
				display_name: reqName
			})
			.get()
			.then(async res => {
				if (res.result.errCode === 0) {
					const items = res.result.data;
					if (items.length > 0) {
						card.value = items[0];
						visible.value = true;
						loadCard.value = false;
					} else {
						const res = await cloudObj.getDeckDet(reqName);
						loadCard.value = false;
						if (res.data) {
							const items = res.data?.items ?? [];
							if (items.length > 0) {
								const result = items.filter(item => item.display_name == reqName);
								card.value = result?.[0];
								visible.value = true;
								db.collection('mtgCards')
									.add(card.value)
									.then(res => {
										if (res.result.errCode === 0) {
											message.success('新增成功');
										} else {
											console.error(err.errMsg);
										}
									})
									.catch(err => {
										console.error(err);
									});
							}
						}
					}
				} else {
					console.error(err.errMsg);
				}
			})
			.catch(err => {
				console.error(err);
			});
	};
	const goIndex = type => {
		selIndex.value = selIndex.value + type;
		getDet(data.value[selIndex.value].name, selIndex.value);
	};
</script>

<style lang="scss" scoped>
	* {
		box-sizing: border-box;
	}
	.content {
		padding: 40rpx;
		.tlt {
			font-size: 30rpx;
			font-weight: 700;
		}
		.item {
			margin-bottom: 10rpx;
			&:last-of-type {
				margin-bottom: 0;
			}
		}
	}
	.mb1 {
		margin-bottom: 1em;
	}
	.mb1f {
		margin-bottom: 1em;
		display: flex;
		justify-content: space-between;
	}
	.imgs {
		width: 100%;
		display: flex;
		justify-content: space-evenly;
	}
</style>
