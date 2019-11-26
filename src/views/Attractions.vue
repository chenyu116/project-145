<template>
	<v-row no-gutters="" align="start" id="attractionsMain">
		<v-col cols="12">
			<HeaderWithBack title="attractions" icon="fa-map-pin"></HeaderWithBack>
		</v-col>
		<v-col cols="12" class="mt-12">
			<div class="amap-page-container amap" id="amapHome">
				<el-amap
					ref="map"
					vid="amap"
					:amap-manager="amapManager"
					:center="center"
					:zoom="zoom"
					:plugin="plugin"
					:events="events"
				>
					<el-amap-marker
						v-for="(marker, index) in markerList"
						:key="index"
						:label="marker.label"
						:position="marker.lnglat"
						:offset="markerOffset"
						:vid="marker.id"
					/>
				</el-amap>
			</div>
		</v-col>
		<v-col cols="12">
			<v-parallax src="../assets/background1.png" :height="windowHeight - 270">
				<v-list
					:max-height="windowHeight - 270"
					class="overflow-y-auto"
					tile=""
					three-line=""
					color="rgba(0,0,0,0)"
				>
					<template v-for="(item, index) in list">
						<v-list-item :href="item.href" :key="index">
							<v-list-item-avatar
								tile=""
								size="50"
								@click="navPage('/details/' + item.map_gid)"
							>
								<v-img
									class="cate-item-image mt-4"
									v-if="item.map_polygon_description_thumbnail"
									:src="ossHost + item.map_polygon_description_thumbnail"
									max-height="64"
									max-width="64"
								></v-img>
							</v-list-item-avatar>
							<v-list-item-content @click="navPage('/details/' + item.map_gid)">
								<v-list-item-subtitle
									class="subtitle-1 gray--text font-weight-bold"
									>{{ $t(item.name) }}</v-list-item-subtitle
								>
								<v-list-item-subtitle class="caption" v-model="addressUpdate">{{
									address[item.map_gid] &&
									address[item.map_gid]["add-" + $i18n.locale]
										? address[item.map_gid]["add-" + $i18n.locale]
										: ""
								}}</v-list-item-subtitle>
							</v-list-item-content>
							<v-list-item-action class="subtitle-2" @click="route(item)">
								<v-btn icon color="lime darken-1"
									><v-icon>fa-location-arrow</v-icon></v-btn
								>
								<v-list-item-action-text>{{
									$t("mapIt")
								}}</v-list-item-action-text>
							</v-list-item-action>
						</v-list-item>
					</template>
				</v-list></v-parallax
			>
		</v-col>
		<v-img
			id="toMapBtn"
			class="toMapBtn"
			src="../assets/toMapBtn.png"
			@click="navPage('/map')"
		></v-img>
	</v-row>
</template>

<script>
import { AMapManager, lazyAMapApiLoaderInstance } from "vue-amap";
export default {
	components: {},
	mounted() {
		const _this = this;
		this.loadPolygons();
		const mapBtnInterval = setInterval(function() {
			const d = document.getElementById("toMapBtn");
			const ac = document.getElementsByClassName("amap-controls")[0];
			if (d && ac) {
				clearInterval(mapBtnInterval);
				ac.appendChild(d);
			}
		}, 1000);
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
	data() {
		let self = this;
		return {
			listHeight: window.innerHeight - 270,
			list: [],
			markerOffset: [0, 0],
			markerList: [],
			addressUpdate: false,
			address: {},
			amapManager: new AMapManager(),
			zoom: 16,
			center: self.$store.state.startPointInfo.center.split(","),
			lng: 0,
			lat: 0,
			events: {
				init: function() {}
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
		loadPolygons() {
			const _this = this;
			const readStore = _this.$store.state.db
				.transaction("mapPolygons")
				.objectStore("mapPolygons")
				.getAll();
			readStore.onsuccess = function(e) {
				const r = e.target.result;
				if (r && r.length > 0) {
					_this.list = r;
					for (let i = 0; i < r.length; i++) {
						r[i].lnglat = _this.changePoint(r[i].point);
						r[i].label = { content: _this.$t(r[i].name) };
						_this.markerList.push(r[i]);
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
						_this.addressUpdate = true;
					};
				}
			};
		},
		// loadPolygonAddress(lngLat, geocoder) {
		// 	return new Promise(function(resolve) {
		// 		geocoder.getAddress(lngLat, function(status, result) {
		// 			if (status === "complete" && result.info === "OK") {
		// 				if (result && result.regeocode) {
		// 					resolve(result.regeocode.formattedAddress);
		// 				}
		// 			}
		// 		});
		// 	});
		// },
		// initPolygonAddress() {
		// 	const waitList = [];
		// 	for (let i = 0; i < this.list.length; i++) {
		// 		if (
		// 			this.address[this.list[i].map_gid] &&
		// 			this.address[this.list[i].map_gid]["add-" + this.$i18n.locale]
		// 		)
		// 			continue;
		// 		const p = this.address[this.list[i].map_gid]
		// 			? this.address[this.list[i].map_gid]
		// 			: { map_gid: this.list[i].map_gid };
		// 		p.point = this.changePoint(this.list[i].point);
		// 		waitList.push(p);
		// 	}
		// 	if (waitList.length > 0) {
		// 		const lang = this.$i18n.locale === "zh_CN" ? "zh_cn" : "en";
		// 		const geocoder = new window.AMap.Geocoder({
		// 			lang: lang,
		// 			radius: 1000,
		// 			extensions: "base"
		// 		});
		// 		const _this = this;
		// 		Promise.map(
		// 			waitList,
		// 			function(p) {
		// 				const _p = p;
		// 				return _this
		// 					.loadPolygonAddress(_p.point, geocoder)
		// 					.then(function(resp) {
		// 						_p["add-" + _this.$i18n.locale] = resp;
		// 						_this.address[_p.map_gid] = _p;
		// 					});
		// 			},
		// 			{ concurrency: 3 }
		// 		).then(function() {
		// 			const writeAddressStore = _this.$store.state.db
		// 				.transaction("mapPolygonAddress", "readwrite")
		// 				.objectStore("mapPolygonAddress");
		// 			console.log(_this.address);
		// 			for (let i in _this.address) {
		// 				writeAddressStore.put(_this.address[i]);
		// 			}
		// 			_this.addressUpdate = true;
		// 		});
		// 	} else {
		// 		this.addressUpdate = true;
		// 	}
		// 	// 定义高德地理编码接口
		// },
		navPage(path) {
			this.$router.replace({ path: path });
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
.toMapBtn {
	position: absolute;
	bottom: 70px;
	left: 10px;
	z-index: 2;
}
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
