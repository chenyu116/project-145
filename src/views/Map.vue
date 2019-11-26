<template>
	<v-row no-gutters="" align="start">
		<v-col cols="12">
			<HeaderWithBack title="map" icon="fa-map"></HeaderWithBack>
			<v-app-bar fixed="" flat="" class="mt-12 pt-7" color="rgba(255,255,255,0)"
				><v-select
					full-width=""
					background-color="white"
					ref="select"
					:items="markerList"
					:label="$t('attractions')"
					item-text="name"
					item-value="map_gid"
					dense
					outlined
					hide-selected=""
					v-model="selectMapGID"
				></v-select
			></v-app-bar>
		</v-col>
		<v-col cols="12" class="mt-12">
			<div
				class="amap-page-container amap"
				id="amapHome"
				:style="`height:${$store.state.windowHeight - 48}px`"
			>
				<el-amap
					ref="map"
					vid="amap"
					:amap-manager="amapManager"
					:center="center"
					:zoom="zoom"
					:plugin="plugin"
					:events="events"
				>
					<!-- <el-amap-marker
						v-for="(marker, index) in markerList"
						:key="index"
						:label="marker.label"
						:position="marker.lnglat"
						:offset="markerOffset"
						:vid="marker.id"
						:clickable="true"
					/> -->
				</el-amap>
			</div>
		</v-col>
		<v-bottom-sheet v-model="showDetails" hide-overlay="">
			<v-card flat="">
				<v-list-item three-line>
					<v-list-item-content>
						<v-list-item-subtitle class="headline mb-1 black--text">{{
							currentDetails.name
						}}</v-list-item-subtitle>
						<v-list-item-subtitle>{{
							address[selectMapGID] &&
							address[selectMapGID]["add-" + $i18n.locale]
								? address[selectMapGID]["add-" + $i18n.locale]
								: ""
						}}</v-list-item-subtitle>
					</v-list-item-content>

					<v-list-item-avatar
						tile
						size="80"
						color="grey"
						v-if="currentDetails.map_polygon_description_thumbnail"
						><v-img
							:src="ossHost + currentDetails.map_polygon_description_thumbnail"
						></v-img
					></v-list-item-avatar>
				</v-list-item>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn elevation="1" :to="`/details/${selectMapGID}`" replace=""
						><v-icon left="" dense="">fa-file</v-icon>{{ $t("details") }}</v-btn
					>
					<v-btn elevation="1" @click="route(currentDetails)"
						><v-icon left="" dense="">fa-route</v-icon>{{ $t("route") }}</v-btn
					>
					<v-btn color="red darken-4" icon @click="showDetails = !showDetails"
						><v-icon>fa-times</v-icon></v-btn
					>
				</v-card-actions>
			</v-card>
		</v-bottom-sheet>
	</v-row>
</template>

<script>
import { AMapManager, lazyAMapApiLoaderInstance } from "vue-amap";
export default {
	components: {},
	mounted() {
		const _this = this;
		this.loadPolygons();
		const flexibleLayer = new window.AMap.TileLayer.Flexible({
			/**
			 * 自定义切片属性，返回值为切片图片或 canvas
			 * @param x: 切片横向编号
			 * @param y: 切片纵向编号
			 * @param z: 切片层级
			 * @param success: 创建成功回调
			 * @param fail: 创建失败回调
			 */
			createTile: function(x, y, z, success, fail) {
				// var image = imageList[x];
				var img = document.createElement("img");
				img.onload = function() {
					success(img);
				};
				// img.crossOrigin = "anonymous";//3D 的时候添加，同时图片要有跨域头
				img.onerror = function() {
					fail();
				};

				img.src =
					"https://o.signp.cn/maps/1403/zh_CN/" +
					z +
					"/" +
					x +
					"/" +
					y +
					".png";
			},
			opacity: 1,
			visible: true,
			cacheSize: 256, // 内存中缓存的切片的数量上限
			zIndex: 999,
			zooms: [14, 18] // 设置可见级别，[最小级别，最大级别]
		});
		lazyAMapApiLoaderInstance.load().then(function() {
			_this.$refs.map.$$getInstance().add(flexibleLayer);
		});
	},
	computed: {
		windowHeight() {
			return this.$store.state.windowHeight;
		}
	},
	watch: {
		selectMapGID(val) {
			if (!val || !this.list[val]) return;
			this.currentDetails = this.list[val];
			this.center = this.currentDetails.lnglat;
			this.showDetails = true;
		},
		showDetails(val) {
			if (val === false) {
				this.selectMapGID = "";
			}
		}
	},
	data() {
		let self = this;
		return {
			list: {},
			selectMapGID: "",
			showDetails: false,
			currentDetails: {},
			markerOffset: [0, 0],
			markerList: [],
			addressUpdate: false,
			address: {},
			amapManager: new AMapManager(),
			zoom: 17,
			center: self.$store.state.startPointInfo.center.split(","),
			lng: 0,
			lat: 0,
			events: {
				init: function() {},
				click: function() {
					self.$refs.select.blur();
				}
			},
			amapPosition: false,
			plugin: [
				{
					pName: "Geolocation",
					events: {
						init() {
							// o 是高德地图定位插件实例
							// o.getCurrentPosition((status, result) => {
							// 	if (result && result.position) {
							// 		self.lng = result.position.lng;
							// 		self.lat = result.position.lat;
							// 		self.center = [self.lng, self.lat];
							// 		self.amapPosition = true;
							// 		self.$nextTick();
							// 	}
							// });
						}
					}
				}
			]
		};
	},
	methods: {
		mapSuccess(e) {
			console.log("mapSuccess", e);
		},
		loadPolygons() {
			const _this = this;
			const readStore = _this.$store.state.db
				.transaction("mapPolygons")
				.objectStore("mapPolygons")
				.getAll();
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				if (r && r.length > 0) {
					for (let i = 0; i < r.length; i++) {
						r[i].lnglat = _this.changePoint(r[i].point);
						r[i].name = _this.$t(r[i].name);
						r[i].label = { content: _this.$t(r[i].name) };
						_this.markerList.push(r[i]);
						_this.list[r[i].map_gid] = r[i];
					}
					const readAddressStore = _this.$store.state.db
						.transaction("mapPolygonAddress")
						.objectStore("mapPolygonAddress")
						.getAll();
					readAddressStore.onsuccess = function(e) {
						const r = e.target.result;
						if (r && r.length > 0) {
							for (let i = 0; i < r.length; i++) {
								_this.address[r[i].map_gid] = r[i];
							}
						}
					};
				}
			};
		},
		route(item) {
			this.$store.commit("updateCurrentRoute", item);
			this.$router.replace("/route");
		}
	}
};
</script>
<style>
.amap-geolocation-con {
	z-index: 2 !important;
}
</style>
<style scoped>
.cate-item-image {
	background-size: 100%;
	float: left;
	height: 4rem;
	width: 4rem;
	display: flex;
}
.amap {
	width: 100% !important;
	height: 220px;
}
</style>
