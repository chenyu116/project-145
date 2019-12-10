<template>
	<v-container fluid="" class="pl-0 pr-0">
		<HeaderWithBack
			title="nowPositionSurrounding"
			icon="fa-flag"
		></HeaderWithBack>
		<v-row no-gutters="" align="start" justify="center" class=" mt-12">
			<v-col cols="12">
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
		</v-row>
		<v-row no-gutters="" align="start" justify="center" class="mt-0">
			<v-col cols="12">
				<v-card color="white" flat="" tile="">
					<v-bottom-navigation
						color="red"
						:class="`elevation-1`"
						:width="barWidth"
						v-model="selectSurrounding"
					>
						<v-btn
							v-for="(item, index) in surrounding"
							:key="index"
							:width="navWidth"
							@click="selectSurrounding = item.text"
							:disabled="loading.searching"
						>
							<span class="subtitle-2">{{ $t(item.text) }}</span>
							<v-icon>{{ item.icon }}</v-icon>
						</v-btn>
					</v-bottom-navigation>
				</v-card>
			</v-col>
		</v-row>
		<v-row no-gutters="" class="mt-1">
			<v-col cols="12">
				<v-skeleton-loader
					:loading="loading.searching"
					transition="scale-transition"
					type="list-item-three-line"
				>
					<v-list
						three-line=""
						:max-height="$store.state.windowHeight - 340"
						class="overflow-y-auto"
						:max-width="$store.state.windowWidth"
					>
						<template v-for="(item, index) in list">
							<v-divider :key="`divider-${index}`" v-if="index > 0"></v-divider>
							<v-list-item :key="index">
								<v-list-item-content>
									<v-list-item-title>{{ item.name }}</v-list-item-title>
									<v-list-item-subtitle>{{
										item.address
									}}</v-list-item-subtitle>
								</v-list-item-content>
								<v-list-item-action
									><v-btn @click="route(item)" icon="">
										<v-icon color="lime darken-1">fa-location-arrow</v-icon>
									</v-btn>
									<v-list-item-action-text
										>{{ item.distance }}
										{{ $t("meter") }}</v-list-item-action-text
									></v-list-item-action
								>

								<!-- <v-list-item-action class="subtitle-2">{{
									item.address
								}}</v-list-item-action> -->
							</v-list-item>
						</template>
					</v-list>
				</v-skeleton-loader>
				<v-row
					no-gutters=""
					align="center"
					style="height:300px;"
					justify="center"
					v-if="errMsg"
				>
					<v-btn @click="search(selectSurrounding)" depressed="">
						<v-icon left dense="">fa-redo</v-icon>
						<span class="">{{ $t("retry") }}</span>
					</v-btn>
				</v-row>
			</v-col>
		</v-row>
		<!-- <v-img
			id="toMapBtn"
			class="toMapBtn"
			src="../assets/toMapBtn.png"
			@click="navPage('/map')"
		></v-img> -->
	</v-container>
</template>

<script>
import { AMapManager } from "vue-amap";
export default {
	components: {},
	data() {
		const self = this;
		return {
			loading: {
				searching: true,
				break: false
			},
			pageSize: 20,
			markerLimit: 10,
			errMsg: "",
			keywords: "",
			list: [],
			navWidth: "",
			barWidth: "",
			selectSurrounding: -1,
			surrounding: [
				{
					text: "food",
					icon: "fa-utensils"
				},
				{
					text: "shopping",
					icon: "fa-shopping-cart"
				},
				{
					text: "hotel",
					icon: "fa-hotel"
				},
				{
					text: "parking",
					icon: "fa-parking"
				},
				{
					text: "bus",
					icon: "fa-bus"
				},
				{
					text: "toilet",
					icon: "fa-restroom"
				}
			],
			markerOffset: [0, 0],
			markerList: [],
			amapManager: new AMapManager(),
			zoom: 13,
			center: this.$store.state.startPointInfo.center.split(","),
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
						init(o) {
							// o 是高德地图定位插件实例
							o.getCurrentPosition((status, result) => {
								if (result && result.position) {
									self.lng = result.position.lng;
									self.lat = result.position.lat;
									self.center = [self.lng, self.lat];
									self.amapPosition = true;
									self.$nextTick();
								}
							});
						}
					}
				}
			]
		};
	},
	computed: {
		windowWidth() {
			return this.$store.state.windowWidth;
		}
	},
	watch: {
		selectSurrounding(val) {
			if (this.surrounding[val]) {
				this.search(this.surrounding[val].text);
			}
		},
		windowWidth: {
			handler(val) {
				this.navWidth = val / this.surrounding.length + "px !important";
				this.barWidth = val;
			},
			immediate: true
		}
	},
	mounted() {
		this.selectSurrounding = 0;
		// const mapBtnInterval = setInterval(function() {
		// 	const d = document.getElementById("toMapBtn");
		// 	const ac = document.getElementsByClassName("amap-controls")[0];
		// 	if (d && ac) {
		// 		clearInterval(mapBtnInterval);
		// 		ac.appendChild(d);
		// 	}
		// }, 1000);
	},
	methods: {
		search(keywords) {
			const _this = this;
			this.errMsg = "";
			this.markerList = [];
			const _keywords = this.$t(keywords);
			this.loading.searching = true;
			const lang = this.$i18n.locale === "zh_CN" ? "zh_cn" : "en";
			const placeSearch = new window.AMap.PlaceSearch({
				pageSize: this.pageSize,
				lang: lang
			});
			this.$http.put(
				this.apiHost + "/project/spm",
				{
					type: "search",
					content: JSON.stringify({
						keywords: _keywords,
						locale: _this.$i18n.locale,
						agent: _this.$store.state.navigator.userAgent
					}),
					contentType: "json",
					tag: _this.$store.state.userId,
					projectID: _this.$store.state.startPointInfo.project_id,
					timestamp: parseInt(new Date().getTime() / 1000)
				},
				{
					emulateJSON: false
				}
			);
			window.AMap.plugin("AMap.Geolocation", function() {
				const geolocation = new window.AMap.Geolocation();
				geolocation.getCurrentPosition(function(status, result) {
					if (result.position) {
						placeSearch.searchNearBy(
							_keywords,
							[result.position.lng, result.position.lat],
							5000,
							function(status, result) {
								if (
									result.info === "OK" &&
									result.poiList &&
									result.poiList.pois.length > 0
								) {
									_this.list = result.poiList.pois;
									let limitCount = _this.markerLimit;
									if (_this.list.length < limitCount) {
										limitCount = _this.list.length;
									}

									for (let i = 0; i < limitCount; i++) {
										_this.markerList.push({
											id: i,
											label: { content: _this.list[i].name },
											lnglat: [
												_this.list[i].location.lng,
												_this.list[i].location.lat
											]
										});
									}
								} else {
									_this.errMsg = _this.$t("noSearchResult");
								}
								_this.loading.searching = false;
							}
						);
					} else {
						_this.errMsg = _this.$t("getPositionFail");
						_this.loading.searching = false;
					}
				});
			});
		},
		route(item) {
			const details = item;
			details.lnglat = [item.location.lng, item.location.lat];
			this.$store.commit("updateCurrentRoute", details);
			this.$router.replace("/route");
		},
		navPage(path) {
			this.$router.replace({ path: path });
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
.amap {
	width: 100% !important;
	height: 200px;
}
.v-item-group.v-bottom-navigation .v-btn {
	min-width: 30px !important;
}
</style>
