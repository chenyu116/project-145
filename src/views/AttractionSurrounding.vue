<template>
	<v-layout fill-height="">
		<HeaderWithBack title="surrounding" icon="fa-search"></HeaderWithBack>
		<v-row
			no-gutters=""
			align="start"
			justify="center"
			class=" mt-12"
			v-if="$store.state.surrounding"
		>
			<v-container fluid="">
				<v-card-title
					><v-icon color="lime darken-2">{{
						$store.state.surrounding.icon
					}}</v-icon>
					<span class="ml-2">
						{{ $t($store.state.surrounding.keywords) }}</span
					></v-card-title
				>
				<v-row no-gutters="" align="start" justify="center">
					<v-col cols="12">
						<div class="amap-page-container amap" id="amapHome">
							<el-amap
								ref="map"
								vid="amap"
								:amap-manager="amapManager"
								:center="center"
								:zooms="$store.state.mapZooms"
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
				<v-col cols="12">
					<v-skeleton-loader
						:loading="loading.searching"
						transition="scale-transition"
						type="paragraph"
					>
						<v-list
							three-line=""
							:max-height="$store.state.windowHeight - 360"
							class="overflow-y-auto"
							:max-width="$store.state.windowWidth - 48"
						>
							<template v-for="(item, index) in list">
								<v-divider
									:key="`divider-${index}`"
									v-if="index > 0"
								></v-divider>
								<v-list-item :key="index">
									<v-list-item-content>
										<v-list-item-subtitle class="subtitle-1 black--text">{{
											item.name
										}}</v-list-item-subtitle>
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
				</v-col>
				<v-col cols="12" v-if="errMsg && list.length === 0"
					><v-layout fill-height="" align-center="" justify-center="">
						<v-btn @click="search" depressed="">
							<v-icon left dense="">fa-redo</v-icon>
							<span class="">{{ $t("retry") }}</span>
						</v-btn>
					</v-layout></v-col
				>
			</v-container>
		</v-row>
	</v-layout>
</template>

<script>
import { AMapManager, lazyAMapApiLoaderInstance } from "vue-amap";
export default {
	components: {},
	data() {
		return {
			loading: {
				searching: true
			},
			errMsg: "",
			keywords: "",
			list: [],
			pageSize: 20,
			markerLimit: 10,
			markerOffset: [0, 0],
			markerList: [],
			amapManager: new AMapManager(),
			zoom: 16,
			center: [],
			lng: 0,
			lat: 0,
			events: {
				init: function() {}
			},
			amapPosition: false,
			plugin: [
				// {
				// 	pName: "Geolocation",
				// 	events: {
				// 		init() {
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
				// }
				// }
				// }
			]
		};
	},
	computed: {
		surrounding() {
			return this.$store.state.surrounding;
		}
	},
	mounted() {
		if (!this.surrounding) {
			this.$router.replace("/");
			return;
		}
		const _this = this;
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
			zIndex: 100,
			zooms: [14, 18] // 设置可见级别，[最小级别，最大级别]
		});
		lazyAMapApiLoaderInstance.load().then(function() {
			_this.$refs.map.$$getInstance().add(flexibleLayer);
			_this.mapLimitBounds();
		});
		this.center = this.changePoint(this.surrounding.point);
		this.search();
	},
	destroyed() {
		if (this.$route.name === "details") {
			this.$store.commit("updateSurrounding", null);
		}
	},
	methods: {
		mapLimitBounds() {
			const bounds = new window.AMap.Bounds(
				new window.AMap.LngLat(
					this.$store.state.mapBounds.southWest[0],
					this.$store.state.mapBounds.southWest[1]
				),
				new window.AMap.LngLat(
					this.$store.state.mapBounds.northEast[0],
					this.$store.state.mapBounds.northEast[1]
				)
			);
			this.$refs.map.$$getInstance().setLimitBounds(bounds);
		},
		search() {
			const _this = this;
			let keywords = this.$store.state.surrounding.keywords;
			if (keywords === "subway") {
				keywords = "地铁";
			}
			this.errMsg = "";
			const lang = this.$i18n.locale === "zh_CN" ? "zh_cn" : "en";
			const placeSearch = new window.AMap.PlaceSearch({
				pageSize: 20,
				lang: lang
			});
			let currentPoint = this.changePoint(this.$store.state.surrounding.point);
			placeSearch.searchNearBy(keywords, currentPoint, 5000, function(
				status,
				result
			) {
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
							lnglat: [_this.list[i].location.lng, _this.list[i].location.lat]
						});
					}
				} else {
					_this.errMsg = _this.$t("noSearchResult");
				}
				_this.loading.searching = false;
			});
		},
		route(item) {
			const details = item;
			details.lnglat = [item.location.lng, item.location.lat];
			this.$store.commit("updateCurrentRoute", details);
			this.$router.replace("/route");
		}
	}
};
</script>
<style scoped>
.amap {
	width: 100% !important;
	height: 200px;
}
</style>
