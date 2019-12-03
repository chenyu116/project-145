<template>
	<v-row no-gutters="" align="start" id="attractionsMain">
		<HeaderWithBack title="attractions" icon="fa-map-pin"></HeaderWithBack>
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
					<template v-if="marketListUpdate">
						<el-amap-marker
							v-for="(marker, index) in markerList"
							:key="index"
							:label="marker.label"
							:position="marker.lnglat"
							:offset="markerOffset"
							:vid="marker.id"
						/>
					</template>
				</el-amap>
			</div>
		</v-col>
		<v-col cols="12">
			<v-parallax src="../assets/background1.png" :height="windowHeight - 270">
				<v-skeleton-loader
					:loading="loading.full"
					transition="scale-transition"
					type="article"
					style="background:rgba(0,0,0,0)"
				>
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
										v-if="item.map_polygon_details_thumbnail"
										:src="ossHost + item.map_polygon_details_thumbnail"
										max-height="64"
										max-width="64"
									></v-img>
								</v-list-item-avatar>
								<v-list-item-content
									@click="navPage('/details/' + item.map_gid)"
								>
									<v-list-item-subtitle
										class="subtitle-1 gray--text font-weight-bold"
										>{{ $t(item.name) }}</v-list-item-subtitle
									>
									<v-list-item-subtitle class="caption">{{
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
					</v-list>
				</v-skeleton-loader>
			</v-parallax>
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
		this.initData();
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
			loading: { full: true },
			markerOffset: [0, 0],
			markerList: [],
			marketListUpdate: false,
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
		initData() {
			const _this = this;
			const initFunc = [this.loadDetails, this.loadAddress, this.loadPolygons];
			Promise.mapSeries(initFunc, function(f) {
				return f();
			}).finally(function() {
				_this.loading.full = false;
			});
		},
		loadPolygons() {
			const _this = this;
			return new Promise(function(resolve) {
				const readStore = _this.$store.state.db
					.transaction("mapPolygons")
					.objectStore("mapPolygons")
					.getAll();
				readStore.onsuccess = function(e) {
					const r = e.target.result;
					if (r && r.length > 0) {
						r.sort(_this.sortByOrder);
						_this.list = r;
						for (let i = 0; i < r.length; i++) {
							r[i].lnglat = _this.changePoint(r[i].point);
							r[i].label = { content: _this.$t(r[i].name) };
							_this.markerList.push(r[i]);
						}
						_this.marketListUpdate = true;
					}
					resolve();
				};
				readStore.onerror = function() {
					resolve();
				};
			});
		},
		sortByOrder(a, b) {
			const sortOrderA = parseInt(a.map_polygon_sort_order);
			const sortOrderB = parseInt(b.map_polygon_sort_order);
			return sortOrderB - sortOrderA;
		},
		loadAddress() {
			const _this = this;
			return new Promise(function(resolve) {
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
					resolve();
				};
				readAddressStore.onerror = function() {
					resolve();
				};
			});
		},
		loadDetails() {
			const _this = this;
			return new Promise(function(resolve) {
				const readStore = _this.$store.state.db
					.transaction("mapPolygons")
					.objectStore("mapPolygons")
					.getAll();
				readStore.onsuccess = function(e) {
					const r = e.target.result;
					if (r && r.length > 0) {
						const waitMapGID = [];
						for (let i = 0; i < r.length; i++) {
							if (r[i].map_polygon_details_content === undefined) {
								waitMapGID.push(r[i]);
							}
						}
						Promise.map(
							waitMapGID,
							function(d) {
								return _this.loadDetailsRemote(d);
							},
							{ concurrency: 3 }
						).then(function() {
							resolve();
						});
					}
				};
			});
		},
		loadDetailsRemote(r) {
			const _this = this;
			return new Promise(function(resolve) {
				_this.$http
					.get(_this.apiHost + "/polygon/details", {
						params: {
							map_gid: r.map_gid,
							project_id: _this.$store.state.startPointInfo.project_id,
							timestamp: parseInt(new Date().getTime() / 1000)
						}
					})
					.then(
						function(resp) {
							if (resp.status === 200) {
								for (let i in resp.body) {
									if (i.indexOf("map_polygon_details") === 0) {
										if (
											i === "map_polygon_details_voice" ||
											i === "map_polygon_details_content"
										) {
											r[i] = JSON.parse(resp.body[i]);
										} else if (i === "map_polygon_details_images") {
											if (resp.body[i]) {
												r[i] = resp.body[i];
												r["images"] = resp.body[i].split(",");
											}
										} else {
											r[i] = resp.body[i];
										}
									}
								}
								const writePolygonStore = _this.$store.state.db
									.transaction("mapPolygons", "readwrite")
									.objectStore("mapPolygons");
								writePolygonStore.put(r);
							}
							setTimeout(function() {
								resolve();
							}, 300);
						},
						function() {
							setTimeout(function() {
								resolve();
							}, 300);
						}
					);
			});
		},
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
