<template>
	<v-row no-gutters="">
		<HeaderWithBack title="route" icon="fa-route"></HeaderWithBack>
		<!-- <v-app-bar fixed="" flat="" class="mt-12 pt-7" color="rgba(255,255,255,0)"
				><v-spacer></v-spacer
				><v-select
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
			></v-app-bar> -->
		<v-overlay
			:opacity="0.8"
			cols="12"
			class="mt-12 text-center"
			v-if="loading.full || errMsg"
			z-index="3"
			><v-progress-circular
				indeterminate
				color="lime"
				:size="70"
				:width="7"
				v-if="!errMsg"
			>
			</v-progress-circular>
			<p v-if="errMsg" class="text-center full-width">{{ errMsg }}</p>
			<v-btn v-if="errMsg" @click="initData" depressed="">
				<v-icon left dense="">fa-redo</v-icon>
				<span class="">重试</span>
			</v-btn>
		</v-overlay>
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
				</el-amap>
			</div>
		</v-col>
		<v-bottom-sheet v-model="showDetails" hide-overlay="">
			<v-card flat="" max-height="180">
				<v-list-item two-line="">
					<v-list-item-content>
						<v-list-item-title
							><span
								><v-icon left="" dense="">fa-road</v-icon
								>{{ parseDistance(route.distance) }}</span
							>
							<span class="ml-4"
								><v-icon left="" dense="">fa-clock</v-icon
								>{{ parseTime(route.time) }}</span
							></v-list-item-title
						>
					</v-list-item-content>
					<v-list-item-action>
						<v-btn v-if="$store.state.isWx" color="primary" @click="openNavi"
							><v-icon left="" dense="">fa-directions</v-icon
							>{{ $t("navigate") }}</v-btn
						>
						<v-menu v-else offset-y v-model="menuOpen" top>
							<template v-slot:activator="{ on }">
								<v-btn v-on="on" color="primary">
									<v-icon left="" dense="">fa-directions</v-icon
									>{{ $t("navigate") }}
								</v-btn>
							</template>
							<v-list dense="">
								<v-list-item
									v-for="(item, index) in navApp"
									:key="index"
									class=" subtitle-2"
									:href="item.href"
								>
									{{ item.name }}
								</v-list-item>
							</v-list>
						</v-menu>
					</v-list-item-action>
				</v-list-item>
			</v-card>
		</v-bottom-sheet>
	</v-row>
</template>

<script>
import { AMapManager, lazyAMapApiLoaderInstance } from "vue-amap";
export default {
	components: {},
	mounted() {
		if (!this.currentDetails) {
			this.$router.replace("/");
			return;
		}
		this.currentDetails.name = this.currentDetails.map_gid
			? this.$t(this.currentDetails.name)
			: this.currentDetails.name;
		const _this = this;
		lazyAMapApiLoaderInstance.load().then(function() {
			_this.mapInstance = _this.$refs.map.$$getInstance();
			_this.initData();
		});
		// const _this = this;
		// setTimeout(function() {
		// 	_this.loading.full = false;
		// }, 2000);
		// this.startMarker = new window.AMap.Marker({
		// 	icon: require("../assets/start.png"),
		// 	position: startPointCenter
		// });
		// this.endMarker = new window.AMap.Marker({
		// 	icon: require("../assets/end.png"),
		// 	position: endLngLat
		// });
		// this.routeLine = new window.AMap.Polyline({
		// 	path: this.routePath,
		// 	strokeWeight: 6,
		// 	showDir: true,
		// 	strokeColor: "orange", // 线条颜色
		// 	lineJoin: "round" // 折线拐点连接处样式
		// });
	},
	computed: {
		windowHeight() {
			return this.$store.state.windowHeight;
		},
		currentDetails() {
			return this.$store.state.currentRoute;
		}
	},
	watch: {
		currentRouteType(val) {
			if (!val || !this.routeType[val]) return;
			this.searchRoute();
		}
	},
	beforeDestroy() {
		this.$store.commit("updateCurrentRoute", null);
	},
	data() {
		let self = this;
		return {
			menuOpen: false,
			errMsg: "",
			nowPosition: {},
			loading: { full: true },
			list: {},
			mapInstance: null,
			startMarker: null,
			endMarker: null,
			routeLine: null,
			routePath: [],
			route: {},
			showDetails: false,
			navApp: {
				baidu: {
					name: self.$t("baiduMap"),
					href: ""
				},
				amap: {
					name: self.$t("amapMap"),
					href: ""
				}
				// qq: { name: self.$t("qqMap"), scheme: "qqmap://map" }
			},
			routeType: {
				walking: new window.AMap.Walking({}),
				driving: new window.AMap.Driving({
					policy: window.AMap.DrivingPolicy.LEAST_TIME
				})
			},
			currentRouteType: "",
			address: "",
			amapManager: new AMapManager(),
			zoom: 17,
			center: self.$store.state.startPointInfo.center.split(","),
			lng: 0,
			lat: 0,
			events: {
				init: function() {},
				click: function() {
					self.menuOpen = false;
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
		initData() {
			this.loading.full = true;
			this.errMsg = "";
			const initFunc = [this.getNowPosition];
			this.showDetails = false;
			this.currentRouteType = "";
			this.mapClean();
			const _this = this;
			Promise.map(
				initFunc,
				function(f) {
					return f();
				},
				{ concurrency: 1 }
			)
				.then(function() {
					_this.startMarker = new window.AMap.Marker({
						icon: require("../assets/start.png"),
						position: _this.nowPosition.position
					});
					_this.endMarker = new window.AMap.Marker({
						icon: require("../assets/end.png"),
						position: _this.currentDetails.lnglat
					});
					if (!_this.$store.state.isWx) {
						_this.prepareAppUrl();
					}
					_this.currentRouteType = "driving";
				})
				.catch(function(err) {
					_this.errMsg = err;
					_this.loading.full = false;
				});
		},
		searchRoute() {
			const _this = this;
			_this.routeType[_this.currentRouteType].search(
				_this.nowPosition.position,
				_this.currentDetails.lnglat,
				function(status, result) {
					if (
						result.info.toLowerCase() === "ok" &&
						result.routes &&
						result.routes[0]
					) {
						_this.route = result.routes[0];
						if (
							_this.currentRouteType === "walking" &&
							_this.route.distance >= 1000
						) {
							_this.currentRouteType = "driving";
							return;
						} else if (
							_this.currentRouteType === "driving" &&
							_this.route.distance < 1000
						) {
							_this.currentRouteType = "walking";
							return;
						}

						const path = [];
						_this.route.steps.forEach(value => {
							value.path.forEach(lngLat => {
								path.push(lngLat);
							});
						});
						_this.routeLine = new window.AMap.Polyline({
							path: path,
							strokeWeight: 6,
							showDir: true,
							strokeColor: "orange", // 线条颜色
							lineJoin: "round" // 折线拐点连接处样式
						});
						_this.mapInstance.add([
							_this.startMarker,
							_this.endMarker,
							_this.routeLine
						]);
						_this.mapInstance.setFitView();
						_this.showDetails = true;
						// _this.errMsg = result.info;
					} else {
						_this.errMsg = result.info
							? result.info
							: _this.$t("searchRouteFail");
					}
					_this.loading.full = false;
				}
			);
		},
		mapClean() {
			if (this.startMarker) this.mapInstance.remove(this.startMarker);
			if (this.endMarker) this.mapInstance.remove(this.endMarker);
			if (this.routeLine) this.mapInstance.remove(this.routeLine);
			this.startMarker = null;
			this.endMarker = null;
			this.routeLine = null;
		},
		getNowPosition() {
			const _this = this;
			return new Promise(function(resolve, reject) {
				window.AMap.plugin("AMap.Geolocation", function() {
					const geolocation = new window.AMap.Geolocation();
					geolocation.getCurrentPosition(function(status, result) {
						_this.prepareAppUrl();
						if (result.info === "SUCCESS") {
							_this.nowPosition = result;

							resolve();
						} else {
							const errMsg = result.message
								? result.message
								: _this.$t("getPositionFail");
							reject(errMsg);
						}
					});
				});
			});
		},
		// loadAddress() {
		// 	const _this = this;
		// 	return new Promise(function(resolve) {
		// 		if (!_this.currentDetails.map_gid) {
		// 			resolve();
		// 			return;
		// 		}
		// 		const readAddressStore = _this.$store.state.db
		// 			.transaction("mapPolygonAddress")
		// 			.objectStore("mapPolygonAddress")
		// 			.get(_this.currentDetails.map_gid);
		// 		readAddressStore.onsuccess = function(e) {
		// 			const r = e.target.result;
		// 			if (r) {
		// 				_this.address = r.add;
		// 			}
		// 			resolve();
		// 		};
		// 	});
		// },
		parseTime(time) {
			const hour = parseInt(time / 3600);
			let minutes = parseInt((time - hour * 3600) / 60);
			if (minutes < 1) minutes = 1;
			return (
				(hour ? hour + " " + this.$t("hour") : "") +
				(minutes ? minutes + " " + this.$t("minutes") : "")
			);
		},
		parseDistance(d) {
			const kilometer = d / 1000;
			if (kilometer < 1) {
				return d + " " + this.$t("meter");
			}
			return kilometer.toFixed(1) + " " + this.$t("kilometer");
		},
		prepareAppUrl() {
			const client = this.getClient();
			const baiduParams = new window.URLSearchParams();
			baiduParams.set("destination", this.currentDetails.name);
			baiduParams.set("src", client + ".baidu.openAPIdemo");
			baiduParams.set("mode", this.currentRouteType);
			baiduParams.set("coord_type", "bd09ll");
			this.navApp.baidu.href =
				"baidumap://map/direction?" + baiduParams.toString();
			const amapParams = new window.URLSearchParams();
			amapParams.set("sourceApplication", this.$store.state.navigator.appName);
			amapParams.set("lat", this.currentDetails.lnglat[1]);
			amapParams.set("lon", this.currentDetails.lnglat[0]);
			amapParams.set("dev", 0);
			this.navApp.amap.href = client + "amap://navi?" + amapParams.toString();
		},
		getClient() {
			const u = this.$store.state.navigator.userAgent;
			let client;
			if (u.indexOf("Android") > -1 || u.indexOf("Adr") > -1) {
				client = "andr";
				// eslint-disable-next-line no-extra-boolean-cast
			} else if (!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
				client = "ios";
			}
			return client;
		},
		openNavi() {
			this.$wechat.wx.openLocation({
				latitude: this.currentDetails.lnglat[1],
				longitude: this.currentDetails.lnglat[0],
				name: this.currentDetails.name,
				address: this.address
			});
		}
	}
};
</script>
<style>
.amap-geolocation-con {
	z-index: 2 !important;
}
</style>
